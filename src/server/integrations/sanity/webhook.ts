/**
 * Sanity webhook signature verification (ADR-001 rebuild-on-webhook).
 *
 * Sanity signs GROQ-powered webhook deliveries with the
 * `sanity-webhook-signature` header: `t=<unix ms>,v1=<signature>` where the
 * signature is HMAC-SHA256 over `${t}.${rawBody}` keyed with the shared
 * secret (CMS_WEBHOOK_SECRET, §38), encoded base64url without padding.
 *
 * Verification is constant-time and bounds the timestamp (±5 min default)
 * so a captured delivery cannot be replayed later to burn build minutes.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export const SANITY_SIGNATURE_HEADER = 'sanity-webhook-signature';

const DEFAULT_TOLERANCE_MS = 5 * 60 * 1000;

export interface SignatureCheck {
  valid: boolean;
  reason?: string;
}

function computeSignature(secret: string, timestamp: string, body: string) {
  return createHmac('sha256', secret)
    .update(`${timestamp}.${body}`, 'utf8')
    .digest('base64url');
}

export interface VerifyOptions {
  header: string | null;
  body: string;
  secret: string;
  now?: () => Date;
  toleranceMs?: number;
}

export function verifySanityWebhookSignature(
  options: VerifyOptions,
): SignatureCheck {
  const { header, body, secret } = options;
  if (!header) return { valid: false, reason: 'missing signature header' };

  const match = /^t=(\d+)[,\s]+v1=([A-Za-z0-9_-]+)$/.exec(header.trim());
  if (!match?.[1] || !match[2]) {
    return { valid: false, reason: 'malformed signature header' };
  }
  const [, timestamp, presented] = match;

  const now = (options.now ?? (() => new Date()))().getTime();
  const tolerance = options.toleranceMs ?? DEFAULT_TOLERANCE_MS;
  const skew = Math.abs(now - Number(timestamp));
  if (skew > tolerance) {
    return { valid: false, reason: 'timestamp outside tolerance' };
  }

  const expected = computeSignature(secret, timestamp, body);
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { valid: false, reason: 'signature mismatch' };
  }
  return { valid: true };
}

/** Test/tooling helper: produce a valid header for a payload. */
export function signSanityWebhook(
  secret: string,
  body: string,
  timestampMs: number,
): string {
  return `t=${String(timestampMs)},v1=${computeSignature(
    secret,
    String(timestampMs),
    body,
  )}`;
}
