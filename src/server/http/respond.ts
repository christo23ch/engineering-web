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

/**
 * Does this request come from a browser form navigation (as opposed to a
 * fetch/JSON client)? Native <form> posts send an HTML `Accept`; fetch clients
 * send `application/json` or a wildcard. Used by the capture endpoints to answer a
 * zero-JS submission with a 303 redirect instead of a JSON body the browser
 * would render as raw text (Bible §13 progressive enhancement).
 */
export function wantsHtml(request: Request): boolean {
  return (request.headers.get('accept') ?? '')
    .toLowerCase()
    .includes('text/html');
}

/**
 * POST/redirect/GET: 303 forces the follow-up to be a GET, so a refresh on the
 * success screen cannot resubmit the form. `location` must be a site-relative
 * path built by us — never a value taken from the request (open-redirect).
 */
export function seeOther(location: string, requestId: string): Response {
  return new Response(null, {
    status: 303,
    headers: {
      location,
      'cache-control': 'no-store',
      'referrer-policy': 'no-referrer',
      'x-request-id': requestId,
    },
  });
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
