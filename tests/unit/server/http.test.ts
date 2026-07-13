import { describe, it, expect } from 'vitest';
import type { APIContext } from 'astro';
import {
  AppError,
  IntegrationError,
  isRetryableError,
} from '@/server/http/errors';
import { readBody, MAX_BODY_BYTES } from '@/server/http/body';
import { defineEndpoint, methodNotAllowed } from '@/server/http/handler';
import { ok } from '@/server/http/respond';
import { createLogger } from '@/server/logging/logger';

const silentLog = createLogger({ write: () => undefined });

function contextFor(request: Request): APIContext {
  // The kernel only touches `request`; a partial context is sufficient.
  return { request } as APIContext;
}

async function bodyOf(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

describe('endpoint kernel — request id, envelope, error mapping', () => {
  it('wraps success and echoes a valid incoming x-request-id', async () => {
    const route = defineEndpoint({
      name: 'test.ok',
      log: silentLog,
      handler: (_ctx, meta) =>
        Promise.resolve(ok({ pong: true }, meta.requestId)),
    });
    const response = (await route(
      contextFor(
        new Request('https://bff.test/api/ping', {
          headers: { 'x-request-id': 'req-123' },
        }),
      ),
    )) as Response;
    expect(response.status).toBe(200);
    expect(response.headers.get('x-request-id')).toBe('req-123');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(await bodyOf(response)).toEqual({
      data: { pong: true },
      requestId: 'req-123',
    });
  });

  it('generates a request id when the incoming one is invalid', async () => {
    const route = defineEndpoint({
      name: 'test.ok',
      log: silentLog,
      handler: (_ctx, meta) => Promise.resolve(ok(null, meta.requestId)),
    });
    const response = (await route(
      contextFor(
        new Request('https://bff.test/api/ping', {
          headers: { 'x-request-id': 'bad id with spaces \n' },
        }),
      ),
    )) as Response;
    expect(response.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('maps AppError to its status/code and exposes details', async () => {
    const route = defineEndpoint({
      name: 'test.invalid',
      log: silentLog,
      handler: () => {
        throw AppError.validation(['email: required']);
      },
    });
    const response = (await route(
      contextFor(new Request('https://bff.test/api/x', { method: 'POST' })),
    )) as Response;
    expect(response.status).toBe(400);
    const body = await bodyOf(response);
    expect(body.error).toEqual({
      code: 'validation_failed',
      message: 'Validation failed',
      details: ['email: required'],
    });
  });

  it('hides internals on unknown errors (generic 500)', async () => {
    const route = defineEndpoint({
      name: 'test.boom',
      log: silentLog,
      handler: () => {
        throw new Error('SELECT * FROM secrets failed');
      },
    });
    const response = (await route(
      contextFor(new Request('https://bff.test/api/x')),
    )) as Response;
    expect(response.status).toBe(500);
    const body = await bodyOf(response);
    expect(JSON.stringify(body)).not.toContain('secrets');
    expect((body.error as Record<string, unknown>).code).toBe('internal_error');
  });

  it('sets Retry-After on rate_limited and Allow on 405', async () => {
    const limited = defineEndpoint({
      name: 'test.limited',
      log: silentLog,
      handler: () => {
        throw AppError.rateLimited(120);
      },
    });
    const limitedRes = (await limited(
      contextFor(new Request('https://bff.test/api/x')),
    )) as Response;
    expect(limitedRes.status).toBe(429);
    expect(limitedRes.headers.get('retry-after')).toBe('120');

    const notAllowed = methodNotAllowed('test.get', ['POST']);
    const naRes = (await notAllowed(
      contextFor(new Request('https://bff.test/api/x')),
    )) as Response;
    expect(naRes.status).toBe(405);
    expect(naRes.headers.get('allow')).toBe('POST');
  });
});

describe('body intake — size cap and content types', () => {
  it('parses JSON objects', async () => {
    const body = await readBody(
      new Request('https://bff.test/api/x', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.c' }),
      }),
    );
    expect(body).toEqual({ email: 'a@b.c' });
  });

  it('rejects invalid JSON and non-object JSON', async () => {
    await expect(
      readBody(
        new Request('https://bff.test/api/x', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{nope',
        }),
      ),
    ).rejects.toMatchObject({ code: 'invalid_json', status: 400 });
    await expect(
      readBody(
        new Request('https://bff.test/api/x', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '[1,2]',
        }),
      ),
    ).rejects.toMatchObject({ code: 'validation_failed' });
  });

  it('parses url-encoded forms (progressive enhancement)', async () => {
    const params = new URLSearchParams({
      nombre: 'X',
      consentimiento: 'on',
    });
    const body = await readBody(
      new Request('https://bff.test/api/x', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: params,
      }),
    );
    expect(body).toEqual({ nombre: 'X', consentimiento: 'on' });
  });

  it('rejects oversized payloads with 413', async () => {
    const big = 'x'.repeat(MAX_BODY_BYTES + 1);
    await expect(
      readBody(
        new Request('https://bff.test/api/x', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ big }),
        }),
      ),
    ).rejects.toMatchObject({ code: 'payload_too_large', status: 413 });
  });

  it('rejects unsupported media types with 415', async () => {
    await expect(
      readBody(
        new Request('https://bff.test/api/x', {
          method: 'POST',
          headers: { 'content-type': 'text/plain' },
          body: 'hello',
        }),
      ),
    ).rejects.toMatchObject({ code: 'unsupported_media_type', status: 415 });
  });
});

describe('error taxonomy — retry classification (ADR-010)', () => {
  it('classifies IntegrationError by status', () => {
    expect(
      isRetryableError(new IntegrationError('brevo', 'x', { status: 429 })),
    ).toBe(true);
    expect(
      isRetryableError(new IntegrationError('brevo', 'x', { status: 503 })),
    ).toBe(true);
    expect(
      isRetryableError(new IntegrationError('brevo', 'x', { status: 400 })),
    ).toBe(false);
    expect(isRetryableError(new IntegrationError('brevo', 'network'))).toBe(
      true,
    );
  });

  it('treats AppError as permanent and unknowns as transient', () => {
    expect(isRetryableError(AppError.validation(['x']))).toBe(false);
    expect(isRetryableError(new TypeError('fetch failed'))).toBe(true);
  });
});
