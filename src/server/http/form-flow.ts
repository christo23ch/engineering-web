/**
 * Zero-JS form flow (Bible §13 progressive enhancement, §17 security).
 *
 * The approved forms POST natively (no JavaScript), so the BFF must answer a
 * browser navigation with a redirect rather than JSON. Pages are SSG, which
 * means they cannot read a query string server-side — so the outcome travels
 * in the URL **fragment** and the pre-rendered status banner is revealed with
 * CSS `:target` (see components/content/FormStatus.astro). No JS anywhere.
 *
 * The fragment vocabulary itself lives in `@/lib/forms/status` so the server
 * and the rendered page cannot drift apart; this module only decides WHICH
 * outcome an error maps to.
 *
 * Open-redirect policy (§17): the success target is a constant we own, and the
 * "back to the form" target is derived from the Referer ONLY after checking it
 * is same-origin, keeping just its pathname. Anything else falls back to the
 * endpoint's default page. A caller-supplied absolute URL is never honoured.
 */
import {
  FORM_STATUS_FRAGMENTS,
  type FormStatusFragment,
} from '@/lib/forms/status';
import type { ErrorCode } from '@/server/http/errors';

/**
 * Map the error taxonomy onto the four honest user-facing outcomes:
 * 400-family → "revisa los datos", 429 → "límite de envíos",
 * 503 → "no disponible ahora", everything else → "error inesperado".
 */
export function fragmentForError(code: ErrorCode): FormStatusFragment {
  switch (code) {
    case 'validation_failed':
    case 'invalid_json':
    case 'payload_too_large':
    case 'unsupported_media_type':
      return FORM_STATUS_FRAGMENTS.validacion;
    case 'rate_limited':
      return FORM_STATUS_FRAGMENTS.limite;
    case 'not_configured':
      return FORM_STATUS_FRAGMENTS.noDisponible;
    default:
      return FORM_STATUS_FRAGMENTS.inesperado;
  }
}

/**
 * Where to send the user back after a failed submission: the page the form
 * lives on. Same-origin Referer → its pathname; anything else → `fallback`.
 * Only the pathname survives, so a crafted query/fragment cannot ride along.
 */
export function resolveReturnPath(request: Request, fallback: string): string {
  const referer = request.headers.get('referer');
  if (!referer) return fallback;
  let candidate: URL;
  let current: URL;
  try {
    candidate = new URL(referer);
    current = new URL(request.url);
  } catch {
    return fallback;
  }
  if (candidate.origin !== current.origin) return fallback;
  // A pathname always starts with "/" and carries no host, so it cannot be
  // turned into a protocol-relative ("//evil.example") redirect.
  return candidate.pathname.startsWith('/') ? candidate.pathname : fallback;
}

/** Build the site-relative Location for a failed zero-JS submission. */
export function errorRedirectPath(
  request: Request,
  fallback: string,
  code: ErrorCode,
): string {
  return `${resolveReturnPath(request, fallback)}#${fragmentForError(code)}`;
}
