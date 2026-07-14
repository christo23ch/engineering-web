/**
 * Outbox drain worker (ADR-010). Invoked by the scheduled internal endpoint
 * (Vercel cron per DA-3 — host-agnostic here): claims due events, dispatches
 * each to its topic handler, and settles the outcome:
 *
 * - success            → delivered
 * - transient failure  → pending again, next attempt after exponential
 *   backoff with jitter (IntegrationError 429/5xx/network — see errors.ts)
 * - permanent failure  → dead immediately (4xx: retrying cannot fix it)
 * - attempts exhausted → dead (kept with last_error for audit/replay)
 * - unknown topic      → dead (a code bug, not a delivery problem)
 *
 * One event failing never aborts the batch.
 */
import type { DbClient } from '@/server/db/client';
import { isRetryableError } from '@/server/http/errors';
import type { Logger } from '@/server/logging/logger';
import { backoffSeconds, type BackoffOptions } from '@/server/outbox/backoff';
import {
  claimDueBatch,
  markDead,
  markDelivered,
  markRetry,
  type OutboxEventRow,
} from '@/server/outbox/repository';

export interface OutboxHandlerMeta {
  id: string;
  topic: string;
  attempts: number;
  log: Logger;
}

export type OutboxHandler = (
  payload: Record<string, unknown>,
  meta: OutboxHandlerMeta,
) => Promise<void>;

export type OutboxHandlerRegistry = Record<string, OutboxHandler>;

export interface ProcessOutboxOptions {
  batchSize?: number;
  visibilityTimeoutSeconds?: number;
  now?: () => Date;
  backoff?: BackoffOptions;
  log: Logger;
}

export interface OutboxRunSummary {
  claimed: number;
  delivered: number;
  retried: number;
  dead: number;
}

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

export async function processOutbox(
  db: DbClient,
  registry: OutboxHandlerRegistry,
  options: ProcessOutboxOptions,
): Promise<OutboxRunSummary> {
  const now = options.now ?? (() => new Date());
  const events = await claimDueBatch(db, {
    batchSize: options.batchSize,
    visibilityTimeoutSeconds: options.visibilityTimeoutSeconds,
    now,
  });

  const summary: OutboxRunSummary = {
    claimed: events.length,
    delivered: 0,
    retried: 0,
    dead: 0,
  };

  for (const event of events) {
    const log = options.log.child({ outboxId: event.id, topic: event.topic });
    const outcome = await settle(
      db,
      registry,
      event,
      now,
      options.backoff,
      log,
    );
    summary[outcome] += 1;
  }

  if (summary.claimed > 0) options.log.info('outbox run', { ...summary });
  return summary;
}

async function settle(
  db: DbClient,
  registry: OutboxHandlerRegistry,
  event: OutboxEventRow,
  now: () => Date,
  backoff: BackoffOptions | undefined,
  log: Logger,
): Promise<'delivered' | 'retried' | 'dead'> {
  const handler = registry[event.topic];
  if (!handler) {
    await markDead(db, event.id, `no handler for topic ${event.topic}`);
    log.error('outbox event dead — unknown topic');
    return 'dead';
  }

  try {
    await handler(event.payload, {
      id: event.id,
      topic: event.topic,
      attempts: event.attempts,
      log,
    });
    await markDelivered(db, event.id, now);
    return 'delivered';
  } catch (error) {
    const attemptsMade = event.attempts + 1;
    const text = errorText(error);
    const retryable = isRetryableError(error);

    if (!retryable) {
      await markDead(db, event.id, text);
      log.error('outbox event dead — permanent error', { error });
      return 'dead';
    }
    if (attemptsMade >= event.max_attempts) {
      await markDead(db, event.id, text);
      log.error('outbox event dead — attempts exhausted', {
        error,
        attempts: attemptsMade,
      });
      return 'dead';
    }

    const delay = backoffSeconds(attemptsMade, backoff);
    const nextAttemptAt = new Date(now().getTime() + delay * 1000);
    await markRetry(db, event.id, text, nextAttemptAt);
    log.warn('outbox event retried', {
      error,
      attempts: attemptsMade,
      nextAttemptInSeconds: delay,
    });
    return 'retried';
  }
}
