/**
 * Assistant observability (Bible §34 — operational telemetry, not a §28
 * domain entity). One ai_events row per request: outcome, model, retrieval
 * size, token usage, cost, cache hit and latency. No PII beyond the question
 * text, retained for the quality review the IA policy calls for (§16); apply
 * the retention/rotation policy operationally.
 */
import type { DbClient } from '@/server/db/client';

export type AiOutcome = 'answered' | 'refused' | 'fallback' | 'error';

export interface AiEvent {
  requestId: string;
  outcome: AiOutcome;
  model?: string;
  retrievedCount: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  cacheHit: boolean;
  latencyMs: number;
}

export async function recordAiEvent(
  db: DbClient,
  event: AiEvent,
): Promise<void> {
  await db.query(
    `insert into ai_events
       (request_id, outcome, model, retrieved_count, input_tokens,
        output_tokens, cost_usd, cache_hit, latency_ms)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      event.requestId,
      event.outcome,
      event.model ?? null,
      event.retrievedCount,
      event.inputTokens,
      event.outputTokens,
      event.costUsd.toFixed(6),
      event.cacheHit,
      event.latencyMs,
    ],
  );
}
