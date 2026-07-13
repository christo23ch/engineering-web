/**
 * API response envelope + security headers (Bible §17). Every BFF response is
 * JSON, uncacheable and sniff-proof; success wraps `data`, failure wraps
 * `error` with a closed `code` set — the UI can switch on codes without
 * parsing prose.
 */
import type { AppError } from '@/server/http/errors';

const BASE_HEADERS: Record<string, string> = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
};

export function json(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...BASE_HEADERS, ...headers },
  });
}

export function ok(data: unknown, requestId: string): Response {
  return json(200, { data, requestId }, { 'x-request-id': requestId });
}

export function created(data: unknown, requestId: string): Response {
  return json(201, { data, requestId }, { 'x-request-id': requestId });
}

export function errorResponse(error: AppError, requestId: string): Response {
  const message = error.expose ? error.message : 'Internal error';
  return json(
    error.status,
    {
      error: {
        code: error.code,
        message,
        ...(error.expose && error.details ? { details: error.details } : {}),
      },
      requestId,
    },
    { ...error.headers, 'x-request-id': requestId },
  );
}
