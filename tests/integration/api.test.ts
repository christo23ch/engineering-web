import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { APIContext, APIRoute } from 'astro';
import type { TestDb } from './helpers/db';
import { createTestDb } from './helpers/db';
import { loadServerConfig } from '@/server/config';
import type { EndpointDeps } from '@/server/context';
import {
  candidaturesPost,
  captureMethodNotAllowed,
  leadsPost,
} from '@/server/endpoints/capture';
import { healthGet } from '@/server/endpoints/health';
import { AppError } from '@/server/http/errors';
import { outboxProcess } from '@/server/endpoints/outbox';
import { createLogger } from '@/server/logging/logger';

let harness: TestDb;
const silentLog = createLogger({ write: () => undefined });

beforeEach(async () => {
  harness = await createTestDb();
});

afterEach(async () => {
  await harness.close();
});

const workerSecret = 'test-worker-secret';

function testDeps(overrides: Partial<EndpointDeps> = {}): () => EndpointDeps {
  const config = loadServerConfig({
    ENVIRONMENT: 'test',
    RATE_LIMIT_WINDOW: '600',
    RATE_LIMIT_MAX: '2',
    OUTBOX_WORKER_SECRET: workerSecret,
    CRM_API_KEY: 'crm-key',
    EMAIL_API_KEY: 'email-key',
    EMAIL_FROM: 'noreply@firm.example',
    EMAIL_TO_INTERNAL: 'leads@firm.example',
  });
  return () => ({
    config,
    db: () => harness.db,
    log: silentLog,
    ...overrides,
  });
}

function invoke(route: APIRoute, request: Request): Promise<Response> {
  return Promise.resolve(route({ request } as APIContext) as Response);
}

const jsonRequest = (
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
) =>
  new Request(`https://bff.test${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

const validLead = {
  nombre: 'Nombre Apellido',
  email: 'lead@example.com',
  empresa: 'ACME',
  servicio: 'eficiencia-energetica',
  mensaje: 'Necesitamos una auditoría energética.',
  consentimiento: true,
};

async function bodyOf(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

describe('POST /api/leads — full capture flow (ADR-008/010)', () => {
  it('persists lead + consent + 3 outbox jobs and returns 201', async () => {
    const route = leadsPost(testDeps());
    const response = await invoke(
      route,
      jsonRequest('/api/leads', validLead, {
        'x-forwarded-for': '203.0.113.7',
        referer: 'https://firm.example/contacto',
        'user-agent': 'vitest',
      }),
    );
    expect(response.status).toBe(201);
    const data = (await bodyOf(response)).data as Record<string, unknown>;
    expect(data.estado).toBe('recibido');

    const leads = await harness.db.query<{
      email: string;
      source_url: string;
    }>('select email, source_url from leads');
    expect(leads).toEqual([
      {
        email: 'lead@example.com',
        source_url: 'https://firm.example/contacto',
      },
    ]);

    const consents = await harness.db.query<{
      purpose: string;
      ip_hash: string | null;
      user_agent: string | null;
    }>('select purpose, ip_hash, user_agent from consents');
    expect(consents[0]?.purpose).toBe('contact');
    expect(consents[0]?.ip_hash).toMatch(/^[0-9a-f]{32}$/);
    expect(consents[0]?.user_agent).toBe('vitest');

    const topics = await harness.db.query<{ topic: string }>(
      'select topic from outbox_events order by topic',
    );
    expect(topics.map((t) => t.topic)).toEqual([
      'lead.confirm.email',
      'lead.deliver.crm',
      'lead.notify.internal',
    ]);
  });

  it('accepts the zero-JS form encoding (progressive enhancement)', async () => {
    const route = leadsPost(testDeps());
    const params = new URLSearchParams({
      nombre: 'Nombre Apellido',
      email: 'form@example.com',
      mensaje: 'Mensaje suficientemente largo.',
      consentimiento: 'on',
    });
    const response = await invoke(
      route,
      new Request('https://bff.test/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: params,
      }),
    );
    expect(response.status).toBe(201);
  });

  it('fake-accepts honeypot submissions without persisting anything', async () => {
    const route = leadsPost(testDeps());
    const response = await invoke(
      route,
      jsonRequest('/api/leads', {
        ...validLead,
        website: 'http://spam.example',
      }),
    );
    expect(response.status).toBe(201);
    const data = (await bodyOf(response)).data as Record<string, unknown>;
    expect(data.id).toBeUndefined();
    expect(await harness.db.query('select id from leads')).toHaveLength(0);
  });

  it('returns 400 with per-field Spanish details on invalid input', async () => {
    const route = leadsPost(testDeps());
    const response = await invoke(
      route,
      jsonRequest('/api/leads', { email: 'nope' }),
    );
    expect(response.status).toBe(400);
    const error = (await bodyOf(response)).error as {
      code: string;
      details: string[];
    };
    expect(error.code).toBe('validation_failed');
    expect(error.details).toContain('nombre: obligatorio');
    expect(await harness.db.query('select id from leads')).toHaveLength(0);
  });

  it('rate limits the third submission from the same client (max=2)', async () => {
    const route = leadsPost(testDeps());
    const from = { 'x-forwarded-for': '203.0.113.9' };
    for (let i = 0; i < 2; i += 1) {
      const okRes = await invoke(
        route,
        jsonRequest('/api/leads', validLead, from),
      );
      expect(okRes.status).toBe(201);
    }
    const blocked = await invoke(
      route,
      jsonRequest('/api/leads', validLead, from),
    );
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toMatch(/^\d+$/);
    // A different client is unaffected.
    const other = await invoke(
      route,
      jsonRequest('/api/leads', validLead, {
        'x-forwarded-for': '203.0.113.10',
      }),
    );
    expect(other.status).toBe(201);
  });

  it('maps a missing database capability to the client-safe 503', async () => {
    // Realistic path: config without DATABASE_URL → requireCapability throws.
    const { requireCapability } = await import('@/server/config');
    const emptyConfig = loadServerConfig({});
    const withoutDb = () => ({
      config: emptyConfig,
      db: () => {
        requireCapability(emptyConfig, 'database');
        return harness.db;
      },
      log: silentLog,
    });
    const response = await invoke(
      leadsPost(withoutDb),
      jsonRequest('/api/leads', validLead),
    );
    expect(response.status).toBe(503);
    const error = (await bodyOf(response)).error as { code: string };
    expect(error.code).toBe('not_configured');
  });

  it('rejects non-POST methods with 405 + Allow', async () => {
    const route = captureMethodNotAllowed('leads');
    const response = await invoke(
      route,
      new Request('https://bff.test/api/leads', { method: 'DELETE' }),
    );
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });
});

describe('POST /api/candidatures (RF-14 — recruitment purpose)', () => {
  it('persists candidature + recruitment consent + internal-only delivery', async () => {
    const route = candidaturesPost(testDeps());
    const response = await invoke(
      route,
      jsonRequest('/api/candidatures', {
        nombre: 'Persona Candidata',
        email: 'cv@example.com',
        telefono: '+34 600 000 000',
        mensaje: 'Candidatura espontánea.',
        consentimiento: 'on',
      }),
    );
    expect(response.status).toBe(201);
    const consents = await harness.db.query<{ purpose: string }>(
      'select purpose from consents',
    );
    expect(consents[0]?.purpose).toBe('recruitment');
    const topics = await harness.db.query<{ topic: string }>(
      'select topic from outbox_events',
    );
    // Internal notification only — NEVER a CRM delivery (GDPR §21).
    expect(topics.map((t) => t.topic)).toEqual(['candidature.notify.internal']);
  });
});

describe('GET /api/health', () => {
  it('reports capability states without leaking values', async () => {
    const response = await invoke(
      healthGet(testDeps()),
      new Request('https://bff.test/api/health'),
    );
    expect(response.status).toBe(200);
    const data = (await bodyOf(response)).data as Record<string, unknown>;
    expect(data.capabilities).toEqual({
      database: 'unconfigured',
      crm: 'configured',
      email: 'configured',
      cms: 'unconfigured',
      ai: 'unconfigured',
      embeddings: 'unconfigured',
    });
    expect(data.status).toBe('degraded');
    expect(JSON.stringify(data)).not.toContain('crm-key');
  });
});

describe('outbox drain endpoint (ADR-010, Bearer auth)', () => {
  const drainRequest = (auth?: string) =>
    new Request('https://bff.test/api/internal/outbox/process', {
      method: 'POST',
      headers: auth ? { authorization: auth } : {},
    });

  it('rejects missing and wrong bearers with 401', async () => {
    const route = outboxProcess(testDeps());
    expect((await invoke(route, drainRequest())).status).toBe(401);
    expect(
      (await invoke(route, drainRequest('Bearer wrong-secret'))).status,
    ).toBe(401);
  });

  it('drains captured leads end-to-end through Brevo (faked)', async () => {
    const calls: string[] = [];
    const fetchImpl: typeof fetch = (input) => {
      calls.push(new URL(String(input)).pathname);
      return Promise.resolve(new Response('{}', { status: 201 }));
    };
    await invoke(leadsPost(testDeps()), jsonRequest('/api/leads', validLead));
    const response = await invoke(
      outboxProcess(testDeps({ fetchImpl })),
      drainRequest(`Bearer ${workerSecret}`),
    );
    expect(response.status).toBe(200);
    const data = (await bodyOf(response)).data as Record<string, unknown>;
    expect(data.claimed).toBe(3);
    expect(data.delivered).toBe(3);
    expect(data.counts).toEqual({ delivered: 3 });
    // CRM contact + two transactional emails.
    expect(calls.sort()).toEqual([
      '/v3/contacts',
      '/v3/smtp/email',
      '/v3/smtp/email',
    ]);
  });

  it('returns 503 when the worker secret is not configured', async () => {
    const config = loadServerConfig({});
    const route = outboxProcess(() => ({
      config,
      db: () => harness.db,
      log: silentLog,
    }));
    expect((await invoke(route, drainRequest('Bearer anything'))).status).toBe(
      503,
    );
  });
});

describe('zero-JS form flow — native <form> POST (progressive enhancement)', () => {
  const formRequest = (
    path: string,
    fields: Record<string, string>,
    headers: Record<string, string> = {},
  ) =>
    new Request(`https://bff.test${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
        referer: 'https://bff.test/contacto',
        ...headers,
      },
      body: new URLSearchParams(fields).toString(),
    });

  const validLeadForm = {
    tipo: 'contacto',
    nombre: 'Nombre Apellido',
    email: 'form@example.com',
    empresa: 'ACME',
    servicio: 'eficiencia-energetica',
    mensaje: 'Necesitamos una auditoría energética completa.',
    consentimiento: 'on',
    website: '',
  };

  it('redirects a valid submission to the success screen (303, no JSON shown)', async () => {
    const response = await invoke(
      leadsPost(testDeps()),
      formRequest('/api/leads', validLeadForm),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/contacto/gracias');
    expect(await response.text()).toBe('');
    // The lead is really persisted — the redirect is not a facade.
    const rows = await harness.db.query<{ email: string }>(
      'select email from leads',
    );
    expect(rows.map((row) => row.email)).toEqual(['form@example.com']);
  });

  it('returns to the form with the validation banner on a 400', async () => {
    const response = await invoke(
      leadsPost(testDeps()),
      formRequest('/api/leads', { ...validLeadForm, email: 'not-an-email' }),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/contacto#error-validacion');
    expect(await harness.db.query('select id from leads')).toHaveLength(0);
  });

  it('returns the rate-limit banner once the window is exhausted (429)', async () => {
    const deps = testDeps(); // RATE_LIMIT_MAX = 2
    for (let i = 0; i < 2; i += 1) {
      await invoke(leadsPost(deps), formRequest('/api/leads', validLeadForm));
    }
    const response = await invoke(
      leadsPost(deps),
      formRequest('/api/leads', validLeadForm),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/contacto#error-limite');
  });

  it('returns the unavailable banner when the database is not configured (503)', async () => {
    const config = loadServerConfig({ ENVIRONMENT: 'test' });
    const route = leadsPost(() => ({
      config,
      db: () => {
        throw AppError.notConfigured('database');
      },
      log: silentLog,
    }));
    const response = await invoke(
      route,
      formRequest('/api/leads', validLeadForm),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      '/contacto#error-no-disponible',
    );
  });

  it('honeypot submissions are fake-accepted to the success screen', async () => {
    const response = await invoke(
      leadsPost(testDeps()),
      formRequest('/api/leads', { ...validLeadForm, website: 'bot' }),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/contacto/gracias');
    expect(await harness.db.query('select id from leads')).toHaveLength(0);
  });

  it('candidatures redirect back to /empleo on failure and persist on success', async () => {
    const candidature = {
      nombre: 'Nombre Apellido',
      email: 'candidato@example.com',
      telefono: '+34 600 000 000',
      mensaje: 'Perfil de ingeniería energética.',
      consentimiento: 'on',
    };
    const ok = await invoke(
      candidaturesPost(testDeps()),
      formRequest('/api/candidatures', candidature, {
        referer: 'https://bff.test/empleo',
      }),
    );
    expect(ok.status).toBe(303);
    expect(ok.headers.get('location')).toBe('/contacto/gracias');
    expect(await harness.db.query('select id from candidatures')).toHaveLength(
      1,
    );

    const bad = await invoke(
      candidaturesPost(testDeps()),
      formRequest(
        '/api/candidatures',
        { ...candidature, consentimiento: '' },
        { referer: 'https://bff.test/empleo' },
      ),
    );
    expect(bad.headers.get('location')).toBe('/empleo#error-validacion');
  });

  it('a cross-origin referer can never become the redirect target', async () => {
    const response = await invoke(
      leadsPost(testDeps()),
      formRequest(
        '/api/leads',
        { ...validLeadForm, email: 'bad' },
        { referer: 'https://evil.example/phish' },
      ),
    );
    expect(response.headers.get('location')).toBe('/contacto#error-validacion');
  });

  it('fetch/JSON clients keep the exact JSON contract (201, no redirect)', async () => {
    const response = await invoke(
      leadsPost(testDeps()),
      jsonRequest('/api/leads', validLead),
    );
    expect(response.status).toBe(201);
    expect(response.headers.get('location')).toBeNull();
    expect((await bodyOf(response)).data).toMatchObject({
      estado: 'recibido',
    });
  });
});
