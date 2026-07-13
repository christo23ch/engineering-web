/**
 * Endpoint kernel: wraps a business handler into an Astro `APIRoute` with
 * request-id propagation, structured request logging (Bible §36) and the
 * AppError → HTTP mapping (§17). Handlers throw AppError; the kernel is the
 * only place that turns exceptions into responses, so no endpoint can leak an
 * internal message by accident.
 */
import { randomUUID } from 'node:crypto';
import type { APIContext, APIRoute } from 'astro';
import { AppError, toAppError } from '@/server/http/errors';
import { errorResponse } from '@/server/http/respond';
import { getLogger, type Logger } from '@/server/logging/logger';

export interface RequestMeta {
  requestId: string;
  log: Logger;
}

export type EndpointHandler = (
  context: APIContext,
  meta: RequestMeta,
) => Promise<Response>;

const REQUEST_ID = /^[A-Za-z0-9-]{1,64}$/;

function resolveRequestId(request: Request): string {
  const incoming = request.headers.get('x-request-id');
  return incoming && REQUEST_ID.test(incoming) ? incoming : randomUUID();
}

export interface DefineEndpointOptions {
  /** Endpoint name for logs, e.g. "leads.create". */
  name: string;
  handler: EndpointHandler;
  /** Injectable logger for tests; defaults to the process logger. */
  log?: Logger;
}

export function defineEndpoint(options: DefineEndpointOptions): APIRoute {
  const baseLog = options.log ?? getLogger();

  return async (context: APIContext): Promise<Response> => {
    const requestId = resolveRequestId(context.request);
    const startedAt = performance.now();
    const log = baseLog.child({ endpoint: options.name, requestId });

    let response: Response;
    try {
      response = await options.handler(context, { requestId, log });
    } catch (error) {
      const appError = toAppError(error);
      const fields = {
        code: appError.code,
        status: appError.status,
        // `error` values are redacted to name/message/stack by the logger.
        error: appError.status >= 500 ? appError : appError.message,
        cause: appError.cause,
      };
      if (appError.status >= 500) log.error('request failed', fields);
      else log.warn('request rejected', fields);
      response = errorResponse(appError, requestId);
    }

    log.info('request handled', {
      method: context.request.method,
      path: new URL(context.request.url).pathname,
      status: response.status,
      durationMs: Math.round(performance.now() - startedAt),
    });
    return response;
  };
}

/** Standard 405 for unsupported verbs on an endpoint (adds Allow). */
export function methodNotAllowed(name: string, allowed: string[]): APIRoute {
  return defineEndpoint({
    name,
    handler: () => {
      throw AppError.methodNotAllowed(allowed);
    },
  });
}
