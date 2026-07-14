/**
 * DA-6 budget hard-stop (Bible §16/§49 — the decision that REQUIRES CLIENT
 * RATIFICATION). Durable monthly cost ledger in Postgres (ai_usage), so the
 * cap survives serverless invocations and is shared across instances.
 *
 * Policy (fail-closed):
 *  - Hard-stop ON + no ratified budget  → BLOCK (spend can't begin).
 *  - Hard-stop ON + month spend ≥ budget → BLOCK.
 *  - Hard-stop OFF                       → allow (spend is monitored only).
 * A blocked request degrades to the honest fallback, never an error.
 */
import type { AiConfig } from '@/server/config';
import type { DbClient } from '@/server/db/client';

export interface BudgetDecision {
  allowed: boolean;
  reason?: string;
  spentUsd: number;
  budgetUsd?: number;
}

/** UTC 'YYYY-MM' bucket for the current period. */
export function currentPeriod(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

export async function currentSpendUsd(
  db: DbClient,
  period: string,
): Promise<number> {
  const rows = await db.query<{ cost_usd: string }>(
    'select cost_usd from ai_usage where period = $1',
    [period],
  );
  return Number(rows[0]?.cost_usd ?? 0);
}

/**
 * Pre-flight check BEFORE spending. When blocked, the assistant returns the
 * honest fallback instead of calling any paid provider.
 */
export async function checkBudget(
  db: DbClient,
  ai: AiConfig,
  now: Date = new Date(),
): Promise<BudgetDecision> {
  const period = currentPeriod(now);
  const spentUsd = await currentSpendUsd(db, period);

  if (ai.monthlyBudgetUsd === undefined) {
    // No ratified budget: fail closed when the hard-stop is engaged (DA-6).
    return ai.budgetHardStop
      ? {
          allowed: false,
          reason: 'no ratified AI budget (DA-6)',
          spentUsd,
        }
      : { allowed: true, spentUsd };
  }

  if (ai.budgetHardStop && spentUsd >= ai.monthlyBudgetUsd) {
    return {
      allowed: false,
      reason: 'monthly AI budget exhausted (DA-6 hard-stop)',
      spentUsd,
      budgetUsd: ai.monthlyBudgetUsd,
    };
  }
  return { allowed: true, spentUsd, budgetUsd: ai.monthlyBudgetUsd };
}

export interface SpendRecord {
  inputTokens: number;
  outputTokens: number;
  embeddingTokens: number;
  costUsd: number;
}

/** Record actual spend AFTER a paid call (atomic accumulate). */
export async function recordSpend(
  db: DbClient,
  spend: SpendRecord,
  now: Date = new Date(),
): Promise<void> {
  const period = currentPeriod(now);
  await db.query(
    `insert into ai_usage
       (period, input_tokens, output_tokens, embedding_tokens, cost_usd,
        requests, updated_at)
     values ($1, $2, $3, $4, $5, 1, $6)
     on conflict (period) do update set
       input_tokens = ai_usage.input_tokens + excluded.input_tokens,
       output_tokens = ai_usage.output_tokens + excluded.output_tokens,
       embedding_tokens = ai_usage.embedding_tokens + excluded.embedding_tokens,
       cost_usd = ai_usage.cost_usd + excluded.cost_usd,
       requests = ai_usage.requests + 1,
       updated_at = excluded.updated_at`,
    [
      period,
      spend.inputTokens,
      spend.outputTokens,
      spend.embeddingTokens,
      spend.costUsd.toFixed(6),
      now.toISOString(),
    ],
  );
}
