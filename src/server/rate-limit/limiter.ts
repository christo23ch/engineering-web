/**
 * Durable fixed-window rate limiting (Bible §17 anti-abuse). In-memory
 * counters do not survive serverless invocations (same argument as ADR-010),
 * so the window lives in the `rate_limits` table and every hit is one atomic
 * upsert — safe under concurrent instances.
 *
 * Policy decisions:
 * - Keyed by pseudonymized client IP (SHA-256 — GDPR §21: the raw IP is never
 *   stored) + endpoint scope, so the contact and candidature limits are
 *   independent.
 * - FAIL-OPEN: if the limit check itself errors, the request proceeds and the
 *   failure is logged. A lost lead costs more than a spam burst; the durable
 *   persistence step right after would surface a real DB outage anyway.
 * - Window/size from §38 RATE_LIMIT_WINDOW / RATE_LIMIT_MAX (defaults 3600/5).
 */
import type { DbClient } from '@/server/db/client';
import { hashIp } from '@/server/db/repositories/consents';
import { AppError } from '@/server/http/errors';
import type { Logger } from '@/server/logging/logger';

export interface RateLimitOptions {
  /** Scope + pseudonymized client, e.g. `leads:ab12…`. */
  bucket: string;
  windowSeconds: number;
  max: number;
  now?: () => Date;
  log?: Logger;
}

export interface RateLimitDecision {
  allowed: boolean;
  /** Remaining requests in the current window (0 when blocked). */
  remaining: number;
  /** Seconds until the current window resets. */
  retryAfterSeconds: number;
}

export async function checkRateLimit(
  db: DbClient,
  options: RateLimitOptions,
): Promise<RateLimitDecision> {
  const now = (options.now ?? (() => new Date()))();
  const windowMs = options.windowSeconds * 1000;
  const windowStartMs = Math.floor(now.getTime() / windowMs) * windowMs;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStartMs + windowMs - now.getTime()) / 1000),
  );

  try {
    const rows = await db.query<{ count: number }>(
      `insert into rate_limits (bucket, window_start, count)
       values ($1, $2, 1)
       on conflict (bucket, window_start)
         do update set count = rate_limits.count + 1
       returning count`,
      [options.bucket, new Date(windowStartMs).toISOString()],
    );
    const count = Number(rows[0]?.count ?? 1);

    // Opportunistic hygiene: the first hit of a fresh window clears this
    // bucket's stale windows (bounded, single-bucket delete).
    if (count === 1) {
      await db.query(
        'delete from rate_limits where bucket = $1 and window_start < $2',
        [options.bucket, new Date(windowStartMs).toISOString()],
      );
    }

    if (count > options.max) {
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }
    return {
      allowed: true,
      remaining: options.max - count,
      retryAfterSeconds,
    };
  } catch (error) {
    options.log?.error('rate limit check failed — failing open', { error });
    return {
      allowed: true,
      remaining: options.max,
      retryAfterSeconds,
    };
  }
}

/** Check and throw the client-safe 429 (with Retry-After) when exceeded. */
export async function enforceRateLimit(
  db: DbClient,
  options: RateLimitOptions,
): Promise<void> {
  const decision = await checkRateLimit(db, options);
  if (!decision.allowed) {
    throw AppError.rateLimited(decision.retryAfterSeconds);
  }
}

/**
 * Resolve the client IP for the bucket key: platform-provided address first
 * (Astro `clientAddress`), then the left-most X-Forwarded-For hop. Returns a
 * pseudonymized bucket fragment, never the raw IP.
 */
export function clientBucket(
  scope: string,
  request: Request,
  clientAddress?: string,
): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip =
    clientAddress?.trim() || forwarded?.split(',')[0]?.trim() || 'unknown';
  return `${scope}:${hashIp(ip)}`;
}
