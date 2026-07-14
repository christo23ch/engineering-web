/**
 * Outbox persistence (ADR-010). State machine (enforced by the DB CHECK):
 *   pending → processing → delivered
 *                        → pending (transient failure, future next_attempt_at)
 *                        → dead    (permanent failure or attempts exhausted)
 *
 * Claiming uses FOR UPDATE SKIP LOCKED so concurrent worker runs never
 * double-deliver, plus a visibility timeout: `processing` rows whose lock is
 * older than the timeout are considered abandoned (crashed instance) and
 * become claimable again.
 */
import type { DbClient } from '@/server/db/client';

export interface OutboxEventRow {
  id: string;
  topic: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'delivered' | 'dead';
  attempts: number;
  max_attempts: number;
  next_attempt_at: string;
  locked_at: string | null;
  last_error: string | null;
  created_at: string;
  delivered_at: string | null;
}

export const DEFAULT_MAX_ATTEMPTS = 8;
export const DEFAULT_VISIBILITY_TIMEOUT_SECONDS = 300;

/**
 * Enqueue a delivery job. MUST be called with the same transaction handle
 * that persists the business row — that is the whole point of the pattern.
 */
export async function enqueueOutbox(
  db: DbClient,
  topic: string,
  payload: Record<string, unknown>,
  options: { maxAttempts?: number } = {},
): Promise<{ id: string }> {
  const rows = await db.query<{ id: string }>(
    `insert into outbox_events (topic, payload, max_attempts)
     values ($1, $2::jsonb, $3)
     returning id`,
    [
      topic,
      JSON.stringify(payload),
      options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    ],
  );
  const row = rows[0];
  if (!row) throw new Error('insert outbox_events returned no row');
  return row;
}

export interface ClaimOptions {
  batchSize?: number;
  visibilityTimeoutSeconds?: number;
  now?: () => Date;
}

export async function claimDueBatch(
  db: DbClient,
  options: ClaimOptions = {},
): Promise<OutboxEventRow[]> {
  const batchSize = options.batchSize ?? 20;
  const visibility =
    options.visibilityTimeoutSeconds ?? DEFAULT_VISIBILITY_TIMEOUT_SECONDS;
  const now = (options.now ?? (() => new Date()))().toISOString();

  return db.transaction(async (tx) => {
    const rows = await tx.query<OutboxEventRow>(
      `update outbox_events
         set status = 'processing', locked_at = $1
       where id in (
         select id from outbox_events
         where (status = 'pending' and next_attempt_at <= $1)
            or (status = 'processing'
                and locked_at < $1::timestamptz - make_interval(secs => $2))
         order by created_at
         limit $3
         for update skip locked
       )
       returning *`,
      [now, visibility, batchSize],
    );
    return rows;
  });
}

export async function markDelivered(
  db: DbClient,
  id: string,
  now: () => Date = () => new Date(),
): Promise<void> {
  await db.query(
    `update outbox_events
       set status = 'delivered', delivered_at = $2, locked_at = null,
           last_error = null
     where id = $1`,
    [id, now().toISOString()],
  );
}

/** Transient failure: back to pending with a future attempt. */
export async function markRetry(
  db: DbClient,
  id: string,
  error: string,
  nextAttemptAt: Date,
): Promise<void> {
  await db.query(
    `update outbox_events
       set status = 'pending', attempts = attempts + 1, locked_at = null,
           last_error = $2, next_attempt_at = $3
     where id = $1`,
    [id, error, nextAttemptAt.toISOString()],
  );
}

/** Permanent failure or attempts exhausted: dead-letter (kept for audit). */
export async function markDead(
  db: DbClient,
  id: string,
  error: string,
): Promise<void> {
  await db.query(
    `update outbox_events
       set status = 'dead', attempts = attempts + 1, locked_at = null,
           last_error = $2
     where id = $1`,
    [id, error],
  );
}

/** Operational snapshot (worker response / health): counts per status. */
export async function outboxCounts(
  db: DbClient,
): Promise<Record<string, number>> {
  const rows = await db.query<{ status: string; n: string }>(
    'select status, count(*)::text as n from outbox_events group by status',
  );
  return Object.fromEntries(rows.map((row) => [row.status, Number(row.n)]));
}
