import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { TestDb } from './helpers/db';
import { createTestDb } from './helpers/db';
import { PgVectorStore, EMBEDDING_DIMENSIONS } from '@/server/rag/vector-store';
import type { EmbeddingsClient } from '@/server/rag/embeddings/voyage';
import {
  indexContent,
  resolveIndexVersion,
  type ContentBundle,
} from '@/server/rag/index-content';
import { retrieve } from '@/server/rag/retrieval';
import type { Service } from '@/lib/content/services';

let harness: TestDb;

beforeEach(async () => {
  harness = await createTestDb();
});

afterEach(async () => {
  await harness.close();
});

const MODEL = 'voyage-3-lite';
const INDEX = resolveIndexVersion(MODEL);

/**
 * Deterministic fake embedder: a tiny "bag of keywords" projection into the
 * 512-dim space. Same words → same direction, so chunks mentioning a term
 * cluster near a query about that term — enough to exercise real cosine
 * ranking and the relevance floor without a network call.
 */
function keywordEmbedder(): EmbeddingsClient & { calls: number } {
  const KEYWORDS = [
    'energia',
    'energetica',
    'solar',
    'industrial',
    'eficiencia',
    'consumo',
    'renovable',
    'coste',
  ];
  const client = {
    calls: 0,
    embed(texts: string[]) {
      client.calls += 1;
      const embeddings = texts.map((text) => {
        const lower = text.toLowerCase();
        const v = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
        KEYWORDS.forEach((kw, i) => {
          if (lower.includes(kw)) v[i] = 1;
        });
        // Guarantee a nonzero vector so cosine is defined.
        v[EMBEDDING_DIMENSIONS - 1] = 0.01;
        return v;
      });
      return Promise.resolve({
        embeddings,
        totalTokens: texts.length * 3,
      });
    },
  };
  return client;
}

const energyService: Service = {
  slug: 'eficiencia-energetica',
  name: 'Eficiencia energética',
  icon: 'zap',
  description:
    'Auditoría y mejora del rendimiento energetica de instalaciones.',
  problem: 'Reducir el consumo y el coste energetica con datos.',
};
const renewablesService: Service = {
  slug: 'energias-renovables',
  name: 'Energías renovables',
  icon: 'sun',
  description: 'Proyectos de generación solar renovable y autoconsumo.',
  problem: 'Incorporar generación solar renovable con rentabilidad.',
};

const bundle: ContentBundle = {
  services: [energyService, renewablesService],
  cases: [],
  articles: [],
};

describe('RAG indexing pipeline (real pgvector)', () => {
  it('embeds all chunks on the first run and stores them under the version', async () => {
    const embedder = keywordEmbedder();
    const store = new PgVectorStore(harness.db);
    const stats = await indexContent(bundle, {
      store,
      embeddings: embedder,
      embeddingModel: MODEL,
    });
    expect(stats.indexVersion).toBe(INDEX);
    expect(stats.embedded).toBeGreaterThan(0);
    expect(stats.skipped).toBe(0);
    expect(stats.embeddingTokens).toBeGreaterThan(0);
    expect(await store.count(INDEX)).toBe(stats.totalChunks);
  });

  it('is idempotent: a second unchanged run embeds nothing', async () => {
    const embedder = keywordEmbedder();
    const store = new PgVectorStore(harness.db);
    await indexContent(bundle, {
      store,
      embeddings: embedder,
      embeddingModel: MODEL,
    });
    const callsAfterFirst = embedder.calls;
    const second = await indexContent(bundle, {
      store,
      embeddings: embedder,
      embeddingModel: MODEL,
    });
    expect(second.embedded).toBe(0);
    expect(second.skipped).toBe(second.totalChunks);
    // No new embedding batches were issued.
    expect(embedder.calls).toBe(callsAfterFirst);
  });

  it('re-embeds only changed chunks and prunes removed content', async () => {
    const embedder = keywordEmbedder();
    const store = new PgVectorStore(harness.db);
    await indexContent(bundle, {
      store,
      embeddings: embedder,
      embeddingModel: MODEL,
    });
    const full = await store.count(INDEX);

    // Edit one service, drop the other entirely.
    const edited = await indexContent(
      {
        services: [
          { ...energyService, description: 'Nueva descripción energetica.' },
        ],
        cases: [],
        articles: [],
      },
      { store, embeddings: embedder, embeddingModel: MODEL },
    );
    expect(edited.embedded).toBeGreaterThan(0);
    expect(edited.embedded).toBeLessThan(full); // not the whole corpus
    expect(edited.pruned).toBeGreaterThan(0); // renewables chunks removed
    expect(await store.count(INDEX)).toBe(edited.totalChunks);
  });
});

describe('retrieval + relevance floor (§16 no-hallucination gate)', () => {
  it('returns source-attributed chunks ranked for an on-domain query', async () => {
    const embedder = keywordEmbedder();
    const store = new PgVectorStore(harness.db);
    await indexContent(bundle, {
      store,
      embeddings: embedder,
      embeddingModel: MODEL,
    });

    const result = await retrieve(
      '¿Cómo reducir el consumo energetica de una instalación?',
      { store, embeddings: embedder },
      { indexVersion: INDEX, minScore: 0.3, topK: 4 },
    );
    expect(result.empty).toBe(false);
    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.queryTokens).toBeGreaterThan(0);
    // Every retrieved chunk carries provenance for a citation.
    for (const chunk of result.chunks) {
      expect(['service', 'caseStudy', 'article']).toContain(chunk.sourceType);
      expect(chunk.sourceSlug).toBeTruthy();
      expect(chunk.sourceTitle).toBeTruthy();
    }
    // The energy service should surface for an energy question.
    expect(
      result.chunks.some((c) => c.sourceSlug === 'eficiencia-energetica'),
    ).toBe(true);
  });

  it('returns EMPTY when nothing clears the floor (→ assistant must refuse)', async () => {
    const embedder = keywordEmbedder();
    const store = new PgVectorStore(harness.db);
    await indexContent(bundle, {
      store,
      embeddings: embedder,
      embeddingModel: MODEL,
    });

    const offTopic = await retrieve(
      '¿Cuál es la capital de Francia?',
      { store, embeddings: embedder },
      { indexVersion: INDEX, minScore: 0.5, topK: 4 },
    );
    expect(offTopic.empty).toBe(true);
    expect(offTopic.chunks).toHaveLength(0);
  });
});
