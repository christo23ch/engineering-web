import { describe, it, expect } from 'vitest';
import { IntegrationError } from '@/server/http/errors';
import { createBrevoClient } from '@/server/integrations/brevo/client';
import { upsertContact } from '@/server/integrations/brevo/contacts';
import { sendEmail } from '@/server/integrations/brevo/email';
import { buildOutboxHandlers } from '@/server/outbox/handlers';
import { OUTBOX_TOPICS } from '@/server/outbox/topics';
import { loadServerConfig } from '@/server/config';
import {
  leadConfirmation,
  leadInternalNotification,
  candidatureInternalNotification,
} from '@/server/email/templates';

interface Recorded {
  url: string;
  init: RequestInit;
  body: Record<string, unknown>;
}

function fakeFetch(status: number, body: unknown = {}) {
  const calls: Recorded[] = [];
  const impl: typeof fetch = (input, init) => {
    calls.push({
      url: String(input),
      init: init ?? {},
      body: JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>,
    });
    return Promise.resolve(
      new Response(status === 204 ? null : JSON.stringify(body), { status }),
    );
  };
  return { calls, impl };
}

const clientWith = (impl: typeof fetch) =>
  createBrevoClient({
    apiBase: 'https://api.brevo.com/v3/',
    apiKey: 'test-key',
    fetchImpl: impl,
  });

describe('brevo client — auth, success and error mapping (ADR-010)', () => {
  it('posts JSON with the api-key header (trailing slash normalized)', async () => {
    const { calls, impl } = fakeFetch(201, { id: 1 });
    await clientWith(impl).post('/contacts', { email: 'a@b.co' });
    expect(calls[0]?.url).toBe('https://api.brevo.com/v3/contacts');
    const headers = calls[0]?.init.headers as Record<string, string>;
    expect(headers['api-key']).toBe('test-key');
    expect(headers['content-type']).toBe('application/json');
  });

  it('handles 204/empty bodies', async () => {
    const { impl } = fakeFetch(204);
    await expect(
      clientWith(impl).post('/contacts', {}),
    ).resolves.toBeUndefined();
  });

  it('maps 4xx to permanent and 429/5xx to transient', async () => {
    for (const [status, retryable] of [
      [400, false],
      [401, false],
      [429, true],
      [500, true],
      [503, true],
    ] as const) {
      const { impl } = fakeFetch(status, { message: 'vendor detail' });
      try {
        await clientWith(impl).post('/contacts', {});
        expect.unreachable('should have thrown');
      } catch (error) {
        const integration = error as IntegrationError;
        expect(integration).toBeInstanceOf(IntegrationError);
        expect(integration.retryable).toBe(retryable);
        expect(integration.message).toContain(String(status));
      }
    }
  });

  it('maps network failures to transient', async () => {
    const impl: typeof fetch = () =>
      Promise.reject(new TypeError('fetch failed'));
    await expect(clientWith(impl).post('/x', {})).rejects.toMatchObject({
      retryable: true,
    });
  });
});

describe('brevo contacts (DA-2) and email (DA-8) payloads', () => {
  it('upserts a contact with uppercase attributes and updateEnabled', async () => {
    const { calls, impl } = fakeFetch(201);
    await upsertContact(clientWith(impl), {
      email: 'lead@example.com',
      nombre: 'Nombre',
      empresa: 'ACME',
      servicio: 'instalaciones-mep',
      origen: 'contacto',
    });
    expect(calls[0]?.body).toEqual({
      email: 'lead@example.com',
      attributes: {
        ORIGEN: 'contacto',
        NOMBRE: 'Nombre',
        EMPRESA: 'ACME',
        SERVICIO: 'instalaciones-mep',
      },
      updateEnabled: true,
    });
  });

  it('sends a text-only transactional email', async () => {
    const { calls, impl } = fakeFetch(201);
    await sendEmail(clientWith(impl), {
      from: 'noreply@firm.example',
      to: 'leads@firm.example',
      subject: 'Asunto',
      text: 'Cuerpo',
    });
    expect(calls[0]?.url).toContain('/smtp/email');
    expect(calls[0]?.body).toEqual({
      sender: { email: 'noreply@firm.example' },
      to: [{ email: 'leads@firm.example' }],
      subject: 'Asunto',
      textContent: 'Cuerpo',
    });
  });
});

describe('email templates — provisional-honest copy', () => {
  const lead = {
    leadId: 'L1',
    kind: 'contact' as const,
    email: 'lead@example.com',
    nombre: 'Nombre',
    empresa: 'ACME',
    servicio: 'eficiencia-energetica',
    mensaje: 'Detalle del proyecto.',
  };

  it('internal notification carries the lead data and reference', () => {
    const content = leadInternalNotification(lead);
    expect(content.subject).toContain('lead@example.com');
    for (const fragment of ['Nombre', 'ACME', 'eficiencia-energetica', 'L1']) {
      expect(content.text).toContain(fragment);
    }
  });

  it('confirmation makes no invented promises (no SLA, no company name)', () => {
    const content = leadConfirmation(lead);
    expect(content.text).toContain('Hemos recibido');
    expect(content.text).not.toMatch(/\b\d+\s*(h|horas|días)\b/i);
    expect(content.text).not.toContain('[NOMBRE_EMPRESA]');
  });

  it('candidature notification flags the CRM exclusion (GDPR §21)', () => {
    const content = candidatureInternalNotification({
      candidatureId: 'C1',
      nombre: 'Persona',
      email: 'cv@example.com',
    });
    expect(content.text).toContain('no sincronizar con el CRM');
  });
});

describe('outbox handler registry (topics → Brevo)', () => {
  const fullConfig = loadServerConfig({
    CRM_API_KEY: 'crm-key',
    EMAIL_API_KEY: 'email-key',
    EMAIL_FROM: 'noreply@firm.example',
    EMAIL_TO_INTERNAL: 'leads@firm.example',
  });
  const leadPayload = {
    leadId: 'L1',
    kind: 'contact',
    email: 'lead@example.com',
    nombre: 'Nombre',
  };
  const meta = {
    id: 'evt',
    topic: 'x',
    attempts: 0,
    log: { child: () => undefined } as never,
  };

  it('delivers a lead to the CRM via /contacts', async () => {
    const { calls, impl } = fakeFetch(201);
    const handlers = buildOutboxHandlers({
      config: fullConfig,
      fetchImpl: impl,
    });
    await handlers[OUTBOX_TOPICS.leadDeliverCrm]?.(leadPayload, meta);
    expect(calls[0]?.url).toContain('/contacts');
    expect(calls[0]?.body.email).toBe('lead@example.com');
  });

  it('notifies the internal inbox and confirms to the requester', async () => {
    const { calls, impl } = fakeFetch(201);
    const handlers = buildOutboxHandlers({
      config: fullConfig,
      fetchImpl: impl,
    });
    await handlers[OUTBOX_TOPICS.leadNotifyInternal]?.(leadPayload, meta);
    await handlers[OUTBOX_TOPICS.leadConfirmEmail]?.(leadPayload, meta);
    const to = calls.map((c) => (c.body.to as { email: string }[])[0]?.email);
    expect(to).toEqual(['leads@firm.example', 'lead@example.com']);
    // Both go through the email credential, not the CRM one.
    for (const call of calls) {
      expect((call.init.headers as Record<string, string>)['api-key']).toBe(
        'email-key',
      );
    }
  });

  it('treats a missing capability as transient (config may land later)', async () => {
    const handlers = buildOutboxHandlers({
      config: loadServerConfig({}),
      fetchImpl: fakeFetch(201).impl,
    });
    await expect(
      handlers[OUTBOX_TOPICS.leadDeliverCrm]?.(leadPayload, meta),
    ).rejects.toMatchObject({ retryable: true });
    await expect(
      handlers[OUTBOX_TOPICS.candidatureNotifyInternal]?.(
        { candidatureId: 'C1', nombre: 'P', email: 'cv@example.com' },
        meta,
      ),
    ).rejects.toMatchObject({ retryable: true });
  });

  it('treats malformed payloads as permanent (a retry cannot fix them)', async () => {
    const handlers = buildOutboxHandlers({
      config: fullConfig,
      fetchImpl: fakeFetch(201).impl,
    });
    await expect(
      handlers[OUTBOX_TOPICS.leadDeliverCrm]?.({ nope: true }, meta),
    ).rejects.toMatchObject({ retryable: false });
  });
});
