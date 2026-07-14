import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { TestDb } from './helpers/db';
import { createTestDb } from './helpers/db';
import { loadServerConfig, type AiConfig } from '@/server/config';
import {
  checkBudget,
  recordSpend,
  currentSpendUsd,
  currentPeriod,
} from '@/server/ai/budget';
import {
  getCachedAnswer,
  putCachedAnswer,
  normalizeQuestion,
  cacheKey,
} from '@/server/ai/cache';

let harness: TestDb;

beforeEach(async () => {
  harness = await createTestDb();
});

afterEach(async () => {
  await harness.close();
});

const NOW = new Date('2026-07-14T12:00:00Z');

function aiConfig(overrides: Record<string, string>): AiConfig {
  const ai = loadServerConfig({
    AI_PROVIDER_API_KEY: 'k',
    ...overrides,
  }).ai;
  if (!ai) throw new Error('ai config expected');
  return ai;
}

describe('DA-6 budget hard-stop ledger (real SQL)', () => {
  it('BLOCKS when the AI is configured but no budget is ratified (fail-closed)', async () => {
    const decision = await checkBudget(harness.db, aiConfig({}), NOW);
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('DA-6');
  });

  it('allows within budget and BLOCKS once the month spend reaches the cap', async () => {
    const ai = aiConfig({ AI_MONTHLY_BUDGET: '1' });
    expect((await checkBudget(harness.db, ai, NOW)).allowed).toBe(true);

    await recordSpend(
      harness.db,
      {
        inputTokens: 1000,
        outputTokens: 500,
        embeddingTokens: 20,
        costUsd: 0.6,
      },
      NOW,
    );
    expect((await checkBudget(harness.db, ai, NOW)).allowed).toBe(true);

    await recordSpend(
      harness.db,
      {
        inputTokens: 1000,
        outputTokens: 500,
        embeddingTokens: 20,
        costUsd: 0.6,
      },
      NOW,
    );
    const blocked = await checkBudget(harness.db, ai, NOW);
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toContain('exhausted');
    expect(blocked.spentUsd).toBeCloseTo(1.2, 6);
  });

  it('accumulates spend per UTC month and rolls over the next month', async () => {
    const ai = aiConfig({ AI_MONTHLY_BUDGET: '5' });
    await recordSpend(
      harness.db,
      { inputTokens: 10, outputTokens: 10, embeddingTokens: 0, costUsd: 4 },
      NOW,
    );
    expect(await currentSpendUsd(harness.db, currentPeriod(NOW))).toBeCloseTo(
      4,
      6,
    );
    // Next month starts fresh.
    const nextMonth = new Date('2026-08-01T00:00:00Z');
    expect((await checkBudget(harness.db, ai, nextMonth)).allowed).toBe(true);
    expect(await currentSpendUsd(harness.db, currentPeriod(nextMonth))).toBe(0);
  });

  it('does NOT block when the hard-stop is disabled (monitor only)', async () => {
    const ai = aiConfig({ AI_BUDGET_HARD_STOP: 'false' });
    expect((await checkBudget(harness.db, ai, NOW)).allowed).toBe(true);
  });
});

describe('durable answer cache (real SQL)', () => {
  const INDEX = 'voyage-3-lite#r1';
  const answer = {
    answer: 'La auditoría reduce el consumo [1].',
    citations: [
      {
        marker: 1,
        sourceType: 'service' as const,
        sourceSlug: 'eficiencia-energetica',
        sourceTitle: 'Eficiencia energética',
        url: '/servicios/eficiencia-energetica',
      },
    ],
    model: 'claude-haiku-4.5',
  };

  it('normalizes questions so trivial variants share a key', () => {
    expect(normalizeQuestion('  ¿Cómo AHORRO energía?  ')).toBe(
      'cómo ahorro energía',
    );
    expect(cacheKey('¿Cómo ahorro energía?', INDEX)).toBe(
      cacheKey('cómo ahorro   energía', INDEX),
    );
  });

  it('stores and retrieves an answer, counting hits', async () => {
    await putCachedAnswer(harness.db, '¿Cómo ahorro?', INDEX, answer, {
      now: NOW,
    });
    const hit = await getCachedAnswer(harness.db, '¿cómo ahorro?', INDEX, NOW);
    expect(hit?.answer).toBe(answer.answer);
    expect(hit?.citations[0]?.url).toBe('/servicios/eficiencia-energetica');
    // A second read bumps the hit counter.
    await getCachedAnswer(harness.db, '¿Cómo ahorro?', INDEX, NOW);
    const rows = await harness.db.query<{ hits: number }>(
      'select hits from ai_answer_cache',
    );
    expect(rows[0]?.hits).toBe(2);
  });

  it('misses across a different index version (content re-index invalidates)', async () => {
    await putCachedAnswer(harness.db, 'q', INDEX, answer, { now: NOW });
    expect(
      await getCachedAnswer(harness.db, 'q', 'voyage-3-lite#r2', NOW),
    ).toBeUndefined();
  });

  it('misses once the entry has expired (TTL)', async () => {
    await putCachedAnswer(harness.db, 'q', INDEX, answer, {
      now: NOW,
      ttlSeconds: 60,
    });
    const later = new Date(NOW.getTime() + 61 * 1000);
    expect(
      await getCachedAnswer(harness.db, 'q', INDEX, later),
    ).toBeUndefined();
  });
});
