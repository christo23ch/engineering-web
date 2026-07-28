/**
 * Capture endpoints (RF-06/07 contact, RF-13 lead magnet, RF-14
 * candidature). Shared pipeline, per Bible §17 order — cheap checks first:
 *
 *   read body (size/type caps) → honeypot (fake-accept spam) → durable rate
 *   limit (429) → domain validation (400 with per-field detail) → one
 *   transaction: subject + consent + outbox (ADR-008/010) → 201.
 *
 * Factories take an EndpointDepsFactory so integration tests inject a real
 * (PGlite) database and a fixed config; routes bind the default factory.
 */
import type { APIContext, APIRoute } from 'astro';
import type { EndpointDeps, EndpointDepsFactory } from '@/server/context';
import { defaultEndpointDeps } from '@/server/context';
import { hashIp } from '@/server/db/repositories/consents';
import { readBody } from '@/server/http/body';
import { toAppError } from '@/server/http/errors';
import { SUCCESS_PATH, errorRedirectPath } from '@/server/http/form-flow';
import { defineEndpoint, methodNotAllowed } from '@/server/http/handler';
import type { RequestMeta } from '@/server/http/handler';
import { created, seeOther, wantsHtml } from '@/server/http/respond';
import {
  clientBucket,
  enforceRateLimit,
  resolveClientIp,
} from '@/server/rate-limit/limiter';
import {
  captureCandidature,
  captureLead,
  type CaptureContext,
} from '@/server/services/capture';
import { parseCandidatureSubmission } from '@/server/validation/candidatures';
import { isHoneypotTripped } from '@/server/validation/common';
import { parseLeadSubmission } from '@/server/validation/leads';

function safeClientAddress(context: APIContext): string | undefined {
  try {
    return context.clientAddress;
  } catch {
    // Not available in prerender/tests — the X-Forwarded-For fallback applies.
    return undefined;
  }
}

function captureContextFrom(context: APIContext): CaptureContext {
  const ip = resolveClientIp(context.request, safeClientAddress(context));
  return {
    ipHash: ip ? hashIp(ip) : undefined,
    userAgent: context.request.headers.get('user-agent') ?? undefined,
    sourceUrl: context.request.headers.get('referer') ?? undefined,
  };
}

interface CapturePipeline {
  scope: 'leads' | 'candidatures';
  /** Page hosting the form — where a zero-JS failure returns the user. */
  formPath: string;
  run: (
    deps: EndpointDeps,
    body: Record<string, unknown>,
    context: APIContext,
    meta: RequestMeta,
  ) => Promise<Response>;
}

function capturePost(
  depsFactory: EndpointDepsFactory,
  pipeline: CapturePipeline,
): APIRoute {
  return defineEndpoint({
    name: `${pipeline.scope}.create`,
    handler: async (context, meta) => {
      // Native form navigations get POST/redirect/GET; fetch clients keep the
      // JSON envelope untouched (see http/form-flow.ts).
      const asHtml = wantsHtml(context.request);

      try {
        const deps = depsFactory();
        const body = await readBody(context.request);

        if (isHoneypotTripped(body)) {
          // Fake-accept: the bot learns nothing, nothing is persisted.
          meta.log.warn('honeypot tripped — fake accept');
          return asHtml
            ? seeOther(SUCCESS_PATH, meta.requestId)
            : created({ estado: 'recibido' }, meta.requestId);
        }

        await enforceRateLimit(deps.db(), {
          bucket: clientBucket(
            pipeline.scope,
            context.request,
            safeClientAddress(context),
          ),
          windowSeconds: deps.config.rateLimit.windowSeconds,
          max: deps.config.rateLimit.max,
          log: meta.log,
        });

        const response = await pipeline.run(deps, body, context, meta);
        return asHtml ? seeOther(SUCCESS_PATH, meta.requestId) : response;
      } catch (error) {
        // JSON clients keep the kernel's AppError → HTTP mapping.
        if (!asHtml) throw error;
        // Zero-JS clients get an honest banner on the page they came from;
        // log here because the kernel now sees a 303, not the failure.
        const appError = toAppError(error);
        const fields = { code: appError.code, status: appError.status };
        if (appError.status >= 500) {
          meta.log.error('form submission failed', { ...fields, error });
        } else {
          meta.log.warn('form submission rejected', fields);
        }
        return seeOther(
          errorRedirectPath(context.request, pipeline.formPath, appError.code),
          meta.requestId,
        );
      }
    },
  });
}

export function leadsPost(
  depsFactory: EndpointDepsFactory = defaultEndpointDeps,
): APIRoute {
  return capturePost(depsFactory, {
    scope: 'leads',
    formPath: '/contacto',
    run: async (deps, body, context, meta) => {
      const input = parseLeadSubmission(body);
      const { id } = await captureLead(
        deps.db(),
        input,
        captureContextFrom(context),
      );
      meta.log.info('lead captured', { leadId: id, kind: input.kind });
      return created({ id, estado: 'recibido' }, meta.requestId);
    },
  });
}

export function candidaturesPost(
  depsFactory: EndpointDepsFactory = defaultEndpointDeps,
): APIRoute {
  return capturePost(depsFactory, {
    scope: 'candidatures',
    formPath: '/empleo',
    run: async (deps, body, context, meta) => {
      const input = parseCandidatureSubmission(body);
      const { id } = await captureCandidature(
        deps.db(),
        input,
        captureContextFrom(context),
      );
      meta.log.info('candidature captured', { candidatureId: id });
      return created({ id, estado: 'recibido' }, meta.requestId);
    },
  });
}

/** 405 for anything that is not the POST above. */
export function captureMethodNotAllowed(scope: string): APIRoute {
  return methodNotAllowed(`${scope}.method`, ['POST']);
}
