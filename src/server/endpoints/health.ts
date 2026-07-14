/**
 * Health endpoint (Bible §34 monitoring): capability states only — which
 * integrations are configured, never their values. `degraded` simply means
 * some §38 capability is absent (expected in CI and until client
 * ratification lands vendor credentials, §49).
 */
import type { APIRoute } from 'astro';
import { capabilityStates } from '@/server/config';
import type { EndpointDepsFactory } from '@/server/context';
import { defaultEndpointDeps } from '@/server/context';
import { defineEndpoint, methodNotAllowed } from '@/server/http/handler';
import { ok } from '@/server/http/respond';

export function healthGet(
  depsFactory: EndpointDepsFactory = defaultEndpointDeps,
): APIRoute {
  return defineEndpoint({
    name: 'health.get',
    handler: (_context, meta) => {
      const { config } = depsFactory();
      const capabilities = capabilityStates(config);
      const status = Object.values(capabilities).every(
        (state) => state === 'configured',
      )
        ? 'ok'
        : 'degraded';
      return Promise.resolve(
        ok(
          { status, environment: config.environment, capabilities },
          meta.requestId,
        ),
      );
    },
  });
}

export function healthMethodNotAllowed(): APIRoute {
  return methodNotAllowed('health.method', ['GET']);
}
