/**
 * Assistant orchestrator (Bible §16, ADR-005) — the RAG use-case that ties
 * retrieval, budget, generation, citation verification, cache and telemetry
 * into one honest pipeline. Order matters (cheap/safe checks first):
 *
 *   cache hit → budget gate (DA-6, fail-closed) → retrieve (relevance floor)
 *   → prompt → Claude → verify citations → record spend + telemetry → cache.
 *
 * Every terminal state is honest: `answered` (cited), `refused` (on-domain,
 * no answer), or `fallback` (unavailable / guardrail rejection). It never
 * fabricates and never lets a provider error surface as a broken answer.
 */
import type { AiConfig, EmbeddingsConfig } from '@/server/config';
import type { DbClient } from '@/server/db/client';
import type { Logger } from '@/server/logging/logger';
import { isRetryableError } from '@/server/http/errors';
import type { ClaudeClient } from '@/server/ai/claude';
import {
  estimateEmbeddingCostUsd,
  estimateGenerationCostUsd,
} from '@/server/ai/claude';
import type { EmbeddingsClient } from '@/server/rag/embeddings/voyage';
import type { VectorStore } from '@/server/rag/vector-store';
import { retrieve } from '@/server/rag/retrieval';
import { resolveIndexVersion } from '@/server/rag/index-content';
import { buildRagPrompt } from '@/server/ai/prompt';
import { checkCitations, type Citation } from '@/server/ai/citations';
import { checkBudget, recordSpend } from '@/server/ai/budget';
import { getCachedAnswer, putCachedAnswer } from '@/server/ai/cache';
import { FALLBACK_MESSAGE, REFUSAL_SENTENCE } from '@/server/ai/fallback';
import { recordAiEvent, type AiOutcome } from '@/server/ai/telemetry';

export interface AssistantResult {
  outcome: AiOutcome;
  message: string;
  citations: Citation[];
  cacheHit: boolean;
}

export interface AssistantDeps {
  db: DbClient;
  ai: AiConfig;
  embeddingsConfig: EmbeddingsConfig;
  store: VectorStore;
  embeddings: EmbeddingsClient;
  claude: ClaudeClient;
  log: Logger;
  requestId: string;
  now?: () => Date;
  /** Generation cap; RAG answers are short. */
  maxTokens?: number;
}

const DEFAULT_MAX_TOKENS = 700;

export async function answerQuestion(
  question: string,
  deps: AssistantDeps,
): Promise<AssistantResult> {
  const now = deps.now ?? (() => new Date());
  const startedAt = performance.now();
  const indexVersion = resolveIndexVersion(deps.embeddingsConfig.model);

  let outcome: AiOutcome = 'fallback';
  let result: AssistantResult = {
    outcome: 'fallback',
    message: FALLBACK_MESSAGE,
    citations: [],
    cacheHit: false,
  };
  let model: string | undefined;
  let inputTokens = 0;
  let outputTokens = 0;
  let costUsd = 0;
  let retrievedCount = 0;
  let cacheHit = false;

  try {
    // 1. Cache — a hit avoids all spend.
    const cached = await getCachedAnswer(
      deps.db,
      question,
      indexVersion,
      now(),
    );
    if (cached) {
      cacheHit = true;
      outcome = 'answered';
      result = {
        outcome: 'answered',
        message: cached.answer,
        citations: cached.citations,
        cacheHit: true,
      };
      return result;
    }

    // 2. Budget gate (DA-6, fail-closed) — blocked → honest fallback.
    const budget = await checkBudget(deps.db, deps.ai, now());
    if (!budget.allowed) {
      deps.log.warn('ai budget blocked request', { reason: budget.reason });
      outcome = 'fallback';
      return result;
    }

    // 3. Retrieve — nothing relevant → refuse (no hallucination).
    const retrieval = await retrieve(
      question,
      { store: deps.store, embeddings: deps.embeddings },
      { indexVersion },
    );
    retrievedCount = retrieval.chunks.length;
    costUsd += estimateEmbeddingCostUsd(retrieval.queryTokens);
    if (retrieval.empty) {
      outcome = 'refused';
      result = {
        outcome: 'refused',
        message: REFUSAL_SENTENCE,
        citations: [],
        cacheHit: false,
      };
      return result;
    }

    // 4. Generate.
    const prompt = buildRagPrompt(question, retrieval.chunks);
    const completion = await deps.claude.createMessage({
      model: deps.ai.modelDefault,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.userMessage }],
      maxTokens: deps.maxTokens ?? DEFAULT_MAX_TOKENS,
    });
    model = completion.model;
    inputTokens = completion.usage.inputTokens;
    outputTokens = completion.usage.outputTokens;
    costUsd += estimateGenerationCostUsd(completion.model, completion.usage);

    // 5. Verify citations (guardrail) — hallucinated/uncited → fallback.
    const check = checkCitations(completion.text, prompt.sources);
    if (check.outcome === 'refused') {
      outcome = 'refused';
      result = {
        outcome: 'refused',
        message: REFUSAL_SENTENCE,
        citations: [],
        cacheHit: false,
      };
    } else if (check.outcome === 'invalid') {
      deps.log.warn('ai answer failed citation check', {
        reason: check.reason,
      });
      outcome = 'fallback';
      result = {
        outcome: 'fallback',
        message: FALLBACK_MESSAGE,
        citations: [],
        cacheHit: false,
      };
    } else {
      outcome = 'answered';
      result = {
        outcome: 'answered',
        message: completion.text,
        citations: check.citations,
        cacheHit: false,
      };
      // 6. Cache only verified answers.
      await putCachedAnswer(
        deps.db,
        question,
        indexVersion,
        {
          answer: completion.text,
          citations: check.citations,
          model: completion.model,
        },
        { now: now() },
      );
    }
    return result;
  } catch (error) {
    // Any provider/DB failure degrades honestly — never a broken answer.
    deps.log.error('ai assistant error', {
      error,
      retryable: isRetryableError(error),
    });
    outcome = 'error';
    result = {
      outcome: 'error',
      message: FALLBACK_MESSAGE,
      citations: [],
      cacheHit: false,
    };
    return result;
  } finally {
    // 7. Record spend (only when a paid call happened) + telemetry.
    if (!cacheHit && (inputTokens > 0 || outputTokens > 0 || costUsd > 0)) {
      await recordSpend(
        deps.db,
        {
          inputTokens,
          outputTokens,
          embeddingTokens: 0,
          costUsd,
        },
        now(),
      ).catch((error: unknown) =>
        deps.log.error('ai spend record failed', { error }),
      );
    }
    await recordAiEvent(deps.db, {
      requestId: deps.requestId,
      outcome,
      model,
      retrievedCount,
      inputTokens,
      outputTokens,
      costUsd,
      cacheHit,
      latencyMs: Math.round(performance.now() - startedAt),
    }).catch((error: unknown) =>
      deps.log.error('ai telemetry record failed', { error }),
    );
  }
}
