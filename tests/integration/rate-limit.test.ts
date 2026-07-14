import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { TestDb } from './helpers/db';
import { createTestDb } from './helpers/db';
import type { DbClient } from '@/server/db/client';
import {
  checkRateLimit,
  enforceRateLimit,
  clientBucket,
} from '@/server/rate-limit/limiter';
import { createLogger } from '@/server/logging/logger';

let harness: TestDb;

beforeAll(async () => {
  harness = await createTestDb();
});

afterAll(async () => {
  await harness.close();
});

const T0 = new Date('2026-07-14T10:00:00Z');
const at = (offsetSeconds: number) => () =>
  new Date(T0.getTime() + offsetSeconds * 1000);

describe('durable fixed-window rate limit (Bible §17, real SQL)', () => {
  it('allows up to max within a window, then blocks with Retry-After', async () => {
    const options = {
      bucket: 'test:client-a',
      windowSeconds: 600,
      max: 3,
      now: at(30),
    };
    for (let i = 0; i < 3; i += 1) {
      const decision = await checkRateLimit(harness.db, options);
      expect(decision.allowed).toBe(true);
      expect(decision.remaining).toBe(2 - i);
    }
    const blocked = await checkRateLimit(harness.db, options);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    // 30 s into a 600 s window → 570 s until reset.
    expect(blocked.retryAfterSeconds).toBe(570);
  });

  it('enforceRateLimit throws the client-safe 429', async () => {
    const options = {
      bucket: 'test:client-b',
      windowSeconds: 600,
      max: 1,
      now: at(0),
    };
    await enforceRateLimit(harness.db, options);
    await expect(enforceRateLimit(harness.db, options)).rejects.toMatchObject({
      code: 'rate_limited',
      status: 429,
    });
  });

  it('resets in the next window and cleans up stale rows for the bucket', async () => {
    const bucket = 'test:client-c';
    const base = { bucket, windowSeconds: 600, max: 1 };
    await checkRateLimit(harness.db, { ...base, now: at(0) });
    const blocked = await checkRateLimit(harness.db, { ...base, now: at(10) });
    expect(blocked.allowed).toBe(false);

    // Next window: allowed again…
    const fresh = await checkRateLimit(harness.db, { ...base, now: at(600) });
    expect(fresh.allowed).toBe(true);
    // …and the previous window's row for this bucket has been swept.
    const rows = await harness.db.query<{ n: string }>(
      'select count(*)::text as n from rate_limits where bucket = $1',
      [bucket],
    );
    expect(rows[0]?.n).toBe('1');
  });

  it('isolates buckets (contact vs candidature scopes, different clients)', async () => {
    const base = { windowSeconds: 600, max: 1, now: at(0) };
    await checkRateLimit(harness.db, { ...base, bucket: 'leads:x' });
    const otherScope = await checkRateLimit(harness.db, {
      ...base,
      bucket: 'candidatures:x',
    });
    const otherClient = await checkRateLimit(harness.db, {
      ...base,
      bucket: 'leads:y',
    });
    expect(otherScope.allowed).toBe(true);
    expect(otherClient.allowed).toBe(true);
  });

  it('fails open (allowed + logged) when the store errors', async () => {
    const lines: string[] = [];
    const log = createLogger({ write: (l) => lines.push(l) });
    const broken: DbClient = {
      query: () => Promise.reject(new Error('connection refused')),
      exec: () => Promise.reject(new Error('connection refused')),
      transaction: () => Promise.reject(new Error('connection refused')),
      end: () => Promise.resolve(),
    };
    const decision = await checkRateLimit(broken, {
      bucket: 'test:broken',
      windowSeconds: 600,
      max: 3,
      log,
    });
    expect(decision.allowed).toBe(true);
    expect(lines.some((l) => l.includes('failing open'))).toBe(true);
  });
});

describe('clientBucket — pseudonymized key (GDPR §21)', () => {
  const request = (headers: Record<string, string> = {}) =>
    new Request('https://bff.test/api/leads', { headers });

  it('prefers the platform address over X-Forwarded-For', () => {
    const a = clientBucket(
      'leads',
      request({ 'x-forwarded-for': '198.51.100.9' }),
      '203.0.113.7',
    );
    const b = clientBucket('leads', request(), '203.0.113.7');
    expect(a).toBe(b);
  });

  it('falls back to the left-most forwarded hop, never the raw IP', () => {
    const bucket = clientBucket(
      'leads',
      request({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }),
    );
    expect(bucket).toMatch(/^leads:[0-9a-f]{32}$/);
    expect(bucket).not.toContain('203.0.113.7');
  });

  it('degrades to a shared unknown bucket without addresses', () => {
    expect(clientBucket('leads', request())).toBe(
      clientBucket('leads', request()),
    );
  });
});
