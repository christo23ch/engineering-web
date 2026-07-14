import { describe, it, expect } from 'vitest';
import type { APIContext, APIRoute } from 'astro';
import { loadServerConfig } from '@/server/config';
import type { EndpointDeps } from '@/server/context';
import {
  cmsWebhookMethodNotAllowed,
  cmsWebhookPost,
} from '@/server/endpoints/cms-webhook';
import { signSanityWebhook } from '@/server/integrations/sanity/webhook';
import { createLogger } from '@/server/logging/logger';

const silentLog = createLogger({ write: () => undefined });
const SECRET = 'webhook-secret';
const HOOK_URL = 'https://hooks.example/deploy/abc123';

function deps(
  env: Record<string, string> = {},
  fetchImpl?: typeof fetch,
): () => EndpointDeps {
  const config = loadServerConfig({
    CMS_WEBHOOK_SECRET: SECRET,
    DEPLOY_HOOK_URL: HOOK_URL,
    ...env,
  });
  return () => ({
    config,
    db: () => {
      throw new Error('webhook must not touch the database');
    },
    log: silentLog,
    fetchImpl,
  });
}

function hookRecorder(status = 200) {
  const calls: { url: string; method?: string }[] = [];
  const impl: typeof fetch = (input, init) => {
    calls.push({ url: String(input), method: init?.method });
    return Promise.resolve(new Response('ok', { status }));
  };
  return { calls, impl };
}

const BODY = JSON.stringify({ _type: 'service', slug: { current: 'nuevo' } });

function signedRequest(body: string, header?: string): Request {
  return new Request('https://bff.test/api/internal/cms/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(header ? { 'sanity-webhook-signature': header } : {}),
    },
    body,
  });
}

function invoke(route: APIRoute, request: Request): Promise<Response> {
  return Promise.resolve(route({ request } as APIContext) as Response);
}

describe('cms publish webhook → rebuild (ADR-001)', () => {
  it('triggers the deploy hook on a valid signature and returns 202', async () => {
    const hook = hookRecorder();
    const route = cmsWebhookPost(deps({}, hook.impl));
    const response = await invoke(
      route,
      signedRequest(BODY, signSanityWebhook(SECRET, BODY, Date.now())),
    );
    expect(response.status).toBe(202);
    const payload = (await response.json()) as {
      data: { triggered: boolean; documentType?: string; slug?: string };
    };
    expect(payload.data).toEqual({
      triggered: true,
      documentType: 'service',
      slug: 'nuevo',
    });
    expect(hook.calls).toEqual([{ url: HOOK_URL, method: 'POST' }]);
  });

  it('rejects invalid signatures with 401 and never calls the hook', async () => {
    const hook = hookRecorder();
    const route = cmsWebhookPost(deps({}, hook.impl));
    const bad = await invoke(
      route,
      signedRequest(BODY, signSanityWebhook('otro', BODY, Date.now())),
    );
    expect(bad.status).toBe(401);
    const missing = await invoke(route, signedRequest(BODY));
    expect(missing.status).toBe(401);
    expect(hook.calls).toHaveLength(0);
  });

  it('degrades to 503 while secret or deploy hook are unconfigured', async () => {
    const noSecret = cmsWebhookPost(() => ({
      config: loadServerConfig({ DEPLOY_HOOK_URL: HOOK_URL }),
      db: () => {
        throw new Error('unused');
      },
      log: silentLog,
    }));
    expect((await invoke(noSecret, signedRequest(BODY))).status).toBe(503);

    const noHook = cmsWebhookPost(() => ({
      config: loadServerConfig({ CMS_WEBHOOK_SECRET: SECRET }),
      db: () => {
        throw new Error('unused');
      },
      log: silentLog,
    }));
    expect((await invoke(noHook, signedRequest(BODY))).status).toBe(503);
  });

  it('maps a failing deploy hook to 502 (Sanity retries the delivery)', async () => {
    const hook = hookRecorder(500);
    const route = cmsWebhookPost(deps({}, hook.impl));
    const response = await invoke(
      route,
      signedRequest(BODY, signSanityWebhook(SECRET, BODY, Date.now())),
    );
    expect(response.status).toBe(502);
    const payload = (await response.json()) as { error: { code: string } };
    expect(payload.error.code).toBe('upstream_error');
  });

  it('answers 405 with Allow: POST on other methods', async () => {
    const route = cmsWebhookMethodNotAllowed();
    const response = await invoke(
      route,
      new Request('https://bff.test/api/internal/cms/webhook'),
    );
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });
});
