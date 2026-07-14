/**
 * Retry backoff for the outbox worker (ADR-010): exponential growth with a
 * cap and symmetric jitter, so a burst of failures does not resynchronize
 * into a thundering herd against Brevo.
 *
 * attempts = deliveries already tried (≥1). Defaults: 30 s · 2^(n-1), capped
 * at 1 h, ±20 % jitter → ~30 s, 1 m, 2 m, 4 m, 8 m, 16 m, 32 m, 1 h…
 */

export interface BackoffOptions {
  baseSeconds?: number;
  factor?: number;
  maxSeconds?: number;
  /** Jitter ratio r → multiplier uniform in [1-r, 1+r]. */
  jitterRatio?: number;
  random?: () => number;
}

export function backoffSeconds(
  attempts: number,
  options: BackoffOptions = {},
): number {
  const base = options.baseSeconds ?? 30;
  const factor = options.factor ?? 2;
  const max = options.maxSeconds ?? 3600;
  const jitter = options.jitterRatio ?? 0.2;
  const random = options.random ?? Math.random;

  const exponent = Math.max(0, attempts - 1);
  const raw = Math.min(max, base * factor ** exponent);
  const multiplier = 1 - jitter + 2 * jitter * random();
  return Math.max(1, Math.round(raw * multiplier));
}
