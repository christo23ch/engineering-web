import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { TestDb } from './helpers/db';
import { createTestDb } from './helpers/db';
import { IntegrationError } from '@/server/http/errors';
import { insertLead } from '@/server/db/repositories/leads';
import {
  enqueueOutbox,
  claimDueBatch,
  outboxCounts,
  type OutboxEventRow,
} from '@/server/outbox/repository';
import { processOutbox } from '@/server/outbox/worker';
import { OUTBOX_TOPICS } from '@/server/outbox/topics';
import { createLogger } from '@/server/logging/logger';

let harness: TestDb;
const silentLog = createLogger({ write: () => undefined });
// Anchored one hour in the FUTURE: rows are enqueued with the database's
// real now() default, so the injected clock must sit after it — a fixed
// calendar date here becomes a time bomb the moment the wall clock passes it.
const T0 = new Date(Date.now() + 3600_000);
const at = (offsetSeconds: number) => () =>
  new Date(T0.getTime() + offsetSeconds * 1000);
const noJitter = { random: () => 0.5 };

beforeEach(async () => {
  harness = await createTestDb();
});

afterEach(async () => {
  await harness.close();
});

async function eventById(id: string): Promise<OutboxEventRow | undefined> {
  const rows = await harness.db.query<OutboxEventRow>(
    'select * from outbox_events where id = $1',
    [id],
  );
  return rows[0];
}

describe('transactional outbox (ADR-010)', () => {
  it('is written atomically with the business row — rollback removes both', async () => {
    await expect(
      harness.db.transaction(async (tx) => {
        const { id } = await insertLead(tx, {
          kind: 'contact',
          email: 'atomic@example.com',
        });
        await enqueueOutbox(tx, OUTBOX_TOPICS.leadDeliverCrm, {
          leadId: id,
          email: 'atomic@example.com',
        });
        throw new Error('simulated failure after enqueue');
      }),
    ).rejects.toThrow('simulated failure');
    expect(await outboxCounts(harness.db)).toEqual({});
    const leads = await harness.db.query('select id from leads');
    expect(leads).toHaveLength(0);
  });

  it('claims only due events and locks them as processing', async () => {
    const { id: due } = await enqueueOutbox(
      harness.db,
      OUTBOX_TOPICS.leadNotifyInternal,
      { leadId: 'x', email: 'a@b.co' },
    );
    await harness.db.query(
      `update outbox_events set next_attempt_at = $2 where id <> $1`,
      [due, new Date(T0.getTime() + 9e6).toISOString()],
    );
    const { id: future } = await enqueueOutbox(
      harness.db,
      OUTBOX_TOPICS.leadConfirmEmail,
      { leadId: 'x', email: 'a@b.co' },
    );
    await harness.db.query(
      'update outbox_events set next_attempt_at = $2 where id = $1',
      [future, new Date(T0.getTime() + 9e6).toISOString()],
    );

    const claimed = await claimDueBatch(harness.db, { now: at(0) });
    expect(claimed.map((e) => e.id)).toEqual([due]);
    expect((await eventById(due))?.status).toBe('processing');
    expect((await eventById(future))?.status).toBe('pending');
  });

  it('reclaims abandoned processing rows after the visibility timeout', async () => {
    const { id } = await enqueueOutbox(
      harness.db,
      OUTBOX_TOPICS.leadDeliverCrm,
      { leadId: 'x', email: 'a@b.co' },
    );
    // Simulate a crashed instance: locked long ago, never settled.
    await harness.db.query(
      `update outbox_events set status = 'processing', locked_at = $2
       where id = $1`,
      [id, new Date(T0.getTime() - 600 * 1000).toISOString()],
    );
    const reclaimed = await claimDueBatch(harness.db, {
      now: at(0),
      visibilityTimeoutSeconds: 300,
    });
    expect(reclaimed.map((e) => e.id)).toEqual([id]);
  });
});

describe('outbox worker — settlement (ADR-010)', () => {
  it('delivers successful events', async () => {
    const { id } = await enqueueOutbox(
      harness.db,
      OUTBOX_TOPICS.leadDeliverCrm,
      { leadId: 'x', email: 'a@b.co' },
    );
    const seen: string[] = [];
    const summary = await processOutbox(
      harness.db,
      {
        [OUTBOX_TOPICS.leadDeliverCrm]: (payload) => {
          seen.push(String(payload.email));
          return Promise.resolve();
        },
      },
      { log: silentLog, now: at(0) },
    );
    expect(summary).toEqual({ claimed: 1, delivered: 1, retried: 0, dead: 0 });
    expect(seen).toEqual(['a@b.co']);
    const row = await eventById(id);
    expect(row?.status).toBe('delivered');
    expect(row?.delivered_at).toBeTruthy();
    expect(row?.last_error).toBeNull();
  });

  it('schedules a retry with backoff on transient failures', async () => {
    const { id } = await enqueueOutbox(
      harness.db,
      OUTBOX_TOPICS.leadNotifyInternal,
      { leadId: 'x', email: 'a@b.co' },
    );
    const summary = await processOutbox(
      harness.db,
      {
        [OUTBOX_TOPICS.leadNotifyInternal]: () =>
          Promise.reject(
            new IntegrationError('brevo', 'rate limited', { status: 429 }),
          ),
      },
      { log: silentLog, now: at(0), backoff: noJitter },
    );
    expect(summary.retried).toBe(1);
    const row = await eventById(id);
    expect(row?.status).toBe('pending');
    expect(row?.attempts).toBe(1);
    expect(row?.last_error).toContain('rate limited');
    // attempt 1 → 30 s backoff (no jitter).
    expect(new Date(row?.next_attempt_at ?? 0).toISOString()).toBe(
      new Date(T0.getTime() + 30 * 1000).toISOString(),
    );
    // Not claimable again until then.
    const early = await claimDueBatch(harness.db, { now: at(10) });
    expect(early).toHaveLength(0);
    const later = await claimDueBatch(harness.db, { now: at(31) });
    expect(later.map((e) => e.id)).toEqual([id]);
  });

  it('dead-letters permanent errors immediately', async () => {
    const { id } = await enqueueOutbox(
      harness.db,
      OUTBOX_TOPICS.leadDeliverCrm,
      { leadId: 'x', email: 'a@b.co' },
    );
    const summary = await processOutbox(
      harness.db,
      {
        [OUTBOX_TOPICS.leadDeliverCrm]: () =>
          Promise.reject(
            new IntegrationError('brevo', 'invalid payload', { status: 400 }),
          ),
      },
      { log: silentLog, now: at(0) },
    );
    expect(summary.dead).toBe(1);
    const row = await eventById(id);
    expect(row?.status).toBe('dead');
    expect(row?.attempts).toBe(1);
    expect(row?.last_error).toContain('invalid payload');
  });

  it('dead-letters after exhausting max attempts', async () => {
    const { id } = await enqueueOutbox(
      harness.db,
      OUTBOX_TOPICS.leadConfirmEmail,
      { leadId: 'x', email: 'a@b.co' },
      { maxAttempts: 2 },
    );
    const failing = {
      [OUTBOX_TOPICS.leadConfirmEmail]: () =>
        Promise.reject(new IntegrationError('brevo', 'boom', { status: 503 })),
    };
    const first = await processOutbox(harness.db, failing, {
      log: silentLog,
      now: at(0),
      backoff: noJitter,
    });
    expect(first.retried).toBe(1);
    // Second run after the 30 s backoff — final attempt, exhausts max=2.
    const second = await processOutbox(harness.db, failing, {
      log: silentLog,
      now: at(31),
      backoff: noJitter,
    });
    expect(second.dead).toBe(1);
    expect((await eventById(id))?.status).toBe('dead');
  });

  it('dead-letters events whose topic has no handler', async () => {
    await enqueueOutbox(harness.db, 'topic.desconocido', { x: 1 });
    const summary = await processOutbox(
      harness.db,
      {},
      {
        log: silentLog,
        now: at(0),
      },
    );
    expect(summary.dead).toBe(1);
  });

  it('one failing event never aborts the batch', async () => {
    await enqueueOutbox(harness.db, OUTBOX_TOPICS.leadDeliverCrm, { a: 1 });
    await enqueueOutbox(harness.db, OUTBOX_TOPICS.leadNotifyInternal, {
      b: 2,
    });
    const summary = await processOutbox(
      harness.db,
      {
        [OUTBOX_TOPICS.leadDeliverCrm]: () =>
          Promise.reject(new IntegrationError('brevo', 'x', { status: 502 })),
        [OUTBOX_TOPICS.leadNotifyInternal]: () => Promise.resolve(),
      },
      { log: silentLog, now: at(0), backoff: noJitter },
    );
    expect(summary).toEqual({ claimed: 2, delivered: 1, retried: 1, dead: 0 });
  });
});
