import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { APIContext, APIRoute } from 'astro';
import type { TestDb } from './helpers/db';
import { createTestDb } from './helpers/db';
import {
  loadServerConfig,
  type AiConfig,
  type EmbeddingsConfig,
} from '@/server/config';
import type { EndpointDeps } from '@/server/context';
import {
  assistantPost,
  assistantMethodNotAllowed,
} from '@/server/endpoints/assistant';
import { answerQuestion } from '@/server/ai/assistant';
import type { ClaudeClient, ClaudeResponse } from '@/server/ai/claude';
import { PgVectorStore, EMBEDDING_DIMENSIONS } from '@/server/rag/vector-store';
import { indexContent } from '@/server/rag/index-content';
import type { EmbeddingsClient } from '@/server/rag/embeddings/voyage';
import { currentSpendUsd, currentPeriod } from '@/server/ai/budget';
import { REFUSAL_SENTENCE, FALLBACK_MESSAGE } from '@/server/ai/fallback';
import { createLogger } from '@/server/logging/logger';
import type { Service } from '@/lib/content/services';

let harness: TestDb;
const silentLog = createLogger({ write: () => undefined });
const MODEL = 'voyage-3-lite';

beforeEach(async () => {
  harness = await createTestDb();
});
afterEach(async () => {
  await harness.close();
});

/** Keyword-projection embedder (deterministic, offline). */
function keywordEmbedder(): EmbeddingsClient {
  const KEYWORDS = ['energia', 'energetica', 'consumo', 'eficiencia', 'solar'];
  return {
    embed(texts: string[]) {
      const embeddings = texts.map((t) => {
        const lower = t.toLowerCase();
        const v = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
        KEYWORDS.forEach((kw, i) => {
          if (lower.includes(kw)) v[i] = 1;
        });
        v[EMBEDDING_DIMENSIONS - 1] = 0.01;
        return v;
      });
      return Promise.resolve({ embeddings, totalTokens: texts.length * 3 });
    },
  };
}

function fakeClaude(
  text: string,
  usage = { input: 100, output: 40 },
): ClaudeClient {
  return {
    createMessage(): Promise<ClaudeResponse> {
      return Promise.resolve({
        text,
        usage: { inputTokens: usage.input, outputTokens: usage.output },
        stopReason: 'end_turn',
        model: 'claude-haiku-4.5',
      });
    },
  };
}

const service: Service = {
  slug: 'eficiencia-energetica',
  name: 'Eficiencia energética',
  icon: 'zap',
  description:
    'Auditoría energetica que identifica ahorros de consumo medibles.',
  problem: 'Reducir el consumo y el coste energetica con datos.',
};

const aiConfig = (overrides: Record<string, string> = {}): AiConfig => {
  const ai = loadServerConfig({
    AI_PROVIDER_API_KEY: 'k',
    AI_MONTHLY_BUDGET: '100',
    ...overrides,
  }).ai;
  if (!ai) throw new Error('ai');
  return ai;
};
const embeddingsConfig: EmbeddingsConfig = {
  apiKey: 'v',
  provider: 'voyage',
  model: MODEL,
};

async function seed(): Promise<void> {
  await indexContent(
    { services: [service], cases: [], articles: [] },
    {
      store: new PgVectorStore(harness.db),
      embeddings: keywordEmbedder(),
      embeddingModel: MODEL,
    },
  );
}

function baseDeps(claude: ClaudeClient, ai = aiConfig()) {
  return {
    db: harness.db,
    ai,
    embeddingsConfig,
    store: new PgVectorStore(harness.db),
    embeddings: keywordEmbedder(),
    claude,
    log: silentLog,
    requestId: 'req-1',
  };
}

describe('assistant orchestrator (real pgvector, faked providers)', () => {
  it('answers on-domain questions with citations and records spend + telemetry', async () => {
    await seed();
    const result = await answerQuestion(
      '¿Cómo reducir el consumo energetica?',
      baseDeps(
        fakeClaude(
          'La auditoría energética identifica ahorros de consumo medibles [1].',
        ),
      ),
    );
    expect(result.outcome).toBe('answered');
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0]?.url).toBe('/servicios/eficiencia-energetica');
    // Spend was ledgered (DA-6) and one telemetry row written.
    expect(await currentSpendUsd(harness.db, currentPeriod())).toBeGreaterThan(
      0,
    );
    const events = await harness.db.query<{
      outcome: string;
      cache_hit: boolean;
    }>('select outcome, cache_hit from ai_events');
    expect(events).toHaveLength(1);
    expect(events[0]?.outcome).toBe('answered');
  });

  it('serves a second identical question from cache without new spend', async () => {
    await seed();
    const q = '¿Cómo reducir el consumo energetica?';
    const claude = fakeClaude('Respuesta con cita [1].');
    await answerQuestion(q, baseDeps(claude));
    const spendAfterFirst = await currentSpendUsd(harness.db, currentPeriod());

    const second = await answerQuestion(q, baseDeps(claude));
    expect(second.cacheHit).toBe(true);
    expect(second.outcome).toBe('answered');
    // No additional spend on the cached hit.
    expect(await currentSpendUsd(harness.db, currentPeriod())).toBe(
      spendAfterFirst,
    );
  });

  it('refuses (no hallucination) when nothing is retrieved', async () => {
    await seed();
    const result = await answerQuestion(
      '¿Cuál es la capital de Francia?',
      baseDeps(fakeClaude('no debería llamarse')),
    );
    expect(result.outcome).toBe('refused');
    expect(result.message).toBe(REFUSAL_SENTENCE);
    expect(result.citations).toHaveLength(0);
  });

  it('falls back when the model returns a hallucinated citation', async () => {
    await seed();
    const result = await answerQuestion(
      '¿Cómo reducir el consumo energetica?',
      baseDeps(fakeClaude('Afirmación con fuente inexistente [9].')),
    );
    expect(result.outcome).toBe('fallback');
    expect(result.message).toBe(FALLBACK_MESSAGE);
  });

  it('falls back (no spend) when the DA-6 budget is exhausted', async () => {
    await seed();
    // Budget of 0 with hard-stop → always blocked.
    const result = await answerQuestion(
      '¿Cómo reducir el consumo energetica?',
      baseDeps(
        fakeClaude('no debería llamarse'),
        aiConfig({ AI_MONTHLY_BUDGET: '0' }),
      ),
    );
    expect(result.outcome).toBe('fallback');
    const events = await harness.db.query<{ outcome: string }>(
      'select outcome from ai_events',
    );
    expect(events[0]?.outcome).toBe('fallback');
  });

  it('degrades to fallback on an upstream generation error', async () => {
    await seed();
    const throwingClaude: ClaudeClient = {
      createMessage: () => Promise.reject(new Error('anthropic 529')),
    };
    const result = await answerQuestion(
      '¿Cómo reducir el consumo energetica?',
      baseDeps(throwingClaude),
    );
    expect(result.outcome).toBe('error');
    expect(result.message).toBe(FALLBACK_MESSAGE);
  });
});

describe('POST /api/ia/consulta endpoint', () => {
  const workerConfig = () =>
    loadServerConfig({
      DATABASE_URL: 'postgresql://x/db',
      AI_PROVIDER_API_KEY: 'k',
      AI_MONTHLY_BUDGET: '100',
      EMBEDDINGS_API_KEY: 'v',
      AI_RATE_LIMIT_MAX: '2',
    });

  function endpointDeps(): () => EndpointDeps {
    return () => ({
      config: workerConfig(),
      db: () => harness.db,
      log: silentLog,
      // The endpoint builds Voyage/Claude clients from config with this fetch;
      // seed uses the same keyword projection so retrieval is meaningful.
      fetchImpl: (() => {
        throw new Error('network disabled in test');
      }) as unknown as typeof fetch,
    });
  }

  function invoke(route: APIRoute, request: Request): Promise<Response> {
    return Promise.resolve(
      route({
        request,
        clientAddress: '203.0.113.5',
      } as APIContext) as Response,
    );
  }

  const ask = (pregunta: unknown, headers: Record<string, string> = {}) =>
    new Request('https://bff.test/api/ia/consulta', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({ pregunta }),
    });

  it('validates the question (400 on too short)', async () => {
    const res = await invoke(assistantPost(endpointDeps()), ask('a'));
    expect(res.status).toBe(400);
  });

  it('rate limits the IA scope independently (max 2)', async () => {
    // The real Voyage/Claude clients will throw (network disabled) → the
    // orchestrator returns an honest fallback (200), but the rate limiter
    // still counts each call.
    const route = assistantPost(endpointDeps());
    expect((await invoke(route, ask('pregunta válida uno'))).status).toBe(200);
    expect((await invoke(route, ask('pregunta válida dos'))).status).toBe(200);
    expect((await invoke(route, ask('pregunta válida tres'))).status).toBe(429);
  });

  it('answers 405 with Allow: POST', async () => {
    const res = await invoke(
      assistantMethodNotAllowed(),
      new Request('https://bff.test/api/ia/consulta'),
    );
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
  });

  it('returns a 200 honest fallback when the AI capability is unconfigured', async () => {
    const unconfigured = (): EndpointDeps => ({
      config: loadServerConfig({ DATABASE_URL: 'postgresql://x/db' }),
      db: () => harness.db,
      log: silentLog,
    });
    const res = await invoke(
      assistantPost(unconfigured),
      ask('una pregunta válida'),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { outcome: string } };
    expect(body.data.outcome).toBe('fallback');
  });
});
