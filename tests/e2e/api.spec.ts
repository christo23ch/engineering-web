import { test, expect } from '@playwright/test';

// BFF smoke over the real built server (Node adapter — Bible §13). The
// preview environment has NO §38 secrets on purpose: these tests pin the
// honest degraded behavior (capability states, client-safe 503s) and the
// security envelope. Full functional coverage (persistence, outbox, Brevo)
// lives in tests/integration on a real in-process Postgres.

test('GET /api/health reports degraded capabilities without values', async ({
  request,
}) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-request-id']).toBeTruthy();
  const body = (await response.json()) as {
    data: { status: string; capabilities: Record<string, string> };
  };
  expect(body.data.status).toBe('degraded');
  expect(body.data.capabilities).toEqual({
    database: 'unconfigured',
    crm: 'unconfigured',
    email: 'unconfigured',
    cms: 'unconfigured',
    ai: 'unconfigured',
    embeddings: 'unconfigured',
  });
});

test('GET /api/leads answers 405 with Allow: POST', async ({ request }) => {
  const response = await request.get('/api/leads');
  expect(response.status()).toBe(405);
  expect(response.headers()['allow']).toBe('POST');
});

test('POST /api/leads without a database degrades to a client-safe 503', async ({
  request,
}) => {
  const response = await request.post('/api/leads', {
    data: {
      nombre: 'Nombre Apellido',
      email: 'lead@example.com',
      mensaje: 'Mensaje suficientemente largo.',
      consentimiento: true,
    },
  });
  expect(response.status()).toBe(503);
  const body = (await response.json()) as {
    error: { code: string; message: string };
  };
  expect(body.error.code).toBe('not_configured');
  // Capability name only — never a value or an internal trace.
  expect(body.error.message).toContain('database');
  expect(body.error.message).not.toContain('postgres');
});

test('cross-site form posts are blocked by the CSRF origin check (§17)', async ({
  request,
}) => {
  const response = await request.post('/api/leads', {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      origin: 'https://evil.example',
    },
    data: 'nombre=X&email=a%40b.co&mensaje=hola&consentimiento=on',
  });
  expect(response.status()).toBe(403);
});

test('outbox worker endpoint is closed without its secret', async ({
  request,
}) => {
  const response = await request.get('/api/internal/outbox/process', {
    headers: { authorization: 'Bearer anything' },
  });
  // No OUTBOX_WORKER_SECRET in this environment → explicit 503, never a run.
  expect(response.status()).toBe(503);
  const body = (await response.json()) as { error: { code: string } };
  expect(body.error.code).toBe('not_configured');
});

test('cms publish webhook is closed without its secret (ADR-001)', async ({
  request,
}) => {
  const response = await request.post('/api/internal/cms/webhook', {
    headers: { 'content-type': 'application/json' },
    data: { _type: 'article' },
  });
  // No CMS_WEBHOOK_SECRET in this environment → explicit 503, never a build.
  expect(response.status()).toBe(503);
  const body = (await response.json()) as { error: { code: string } };
  expect(body.error.code).toBe('not_configured');
});

test('IA assistant degrades to an honest fallback when unconfigured (§16)', async ({
  request,
}) => {
  const response = await request.post('/api/ia/consulta', {
    data: { pregunta: '¿Qué servicios de ingeniería ofrecéis?' },
  });
  // No AI/embeddings keys here → 200 with an honest fallback, never a
  // fabricated answer and never a 5xx (the widget stays usable).
  expect(response.status()).toBe(200);
  const body = (await response.json()) as {
    data: { outcome: string; respuesta: string; enlaces: { url: string }[] };
  };
  expect(body.data.outcome).toBe('fallback');
  expect(body.data.respuesta).toContain('formulario de contacto');
  // The fallback points the user to search + contact (zero fabrication).
  expect(body.data.enlaces.map((e) => e.url)).toContain('/contacto');
});

test('IA assistant rejects non-POST with 405', async ({ request }) => {
  const response = await request.get('/api/ia/consulta');
  expect(response.status()).toBe(405);
  expect(response.headers()['allow']).toBe('POST');
});
