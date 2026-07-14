import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { TestDb } from './helpers/db';
import { createTestDb } from './helpers/db';
import {
  PgVectorStore,
  InMemoryVectorStore,
  cosineSimilarity,
  EMBEDDING_DIMENSIONS,
  type EmbeddingRecord,
  type VectorStore,
} from '@/server/rag/vector-store';

let harness: TestDb;

beforeEach(async () => {
  harness = await createTestDb();
});

afterEach(async () => {
  await harness.close();
});

const INDEX = 'test-v1';

/** A 512-dim vector that is mostly zero except a few set positions. */
function vec(entries: Record<number, number>): number[] {
  const v = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  for (const [i, value] of Object.entries(entries)) v[Number(i)] = value;
  return v;
}

function record(
  slug: string,
  chunkIndex: number,
  embedding: number[],
  overrides: Partial<EmbeddingRecord> = {},
): EmbeddingRecord {
  return {
    sourceType: 'service',
    sourceSlug: slug,
    sourceTitle: `Título ${slug}`,
    chunkIndex,
    content: `Contenido ${slug}#${String(chunkIndex)}`,
    tokenCount: 12,
    embedding,
    contentHash: `hash-${slug}-${String(chunkIndex)}`,
    embeddingModel: 'voyage-3-lite',
    indexVersion: INDEX,
    ...overrides,
  };
}

describe('cosineSimilarity', () => {
  it('is 1 for identical directions and 0 for orthogonal', () => {
    expect(cosineSimilarity(vec({ 0: 1 }), vec({ 0: 3 }))).toBeCloseTo(1, 6);
    expect(cosineSimilarity(vec({ 0: 1 }), vec({ 1: 1 }))).toBeCloseTo(0, 6);
  });

  it('returns 0 when either vector is all zeros (no NaN)', () => {
    expect(cosineSimilarity(vec({}), vec({ 0: 1 }))).toBe(0);
  });
});

// Run the SAME contract against both implementations — the in-memory store
// must rank identically to real pgvector.
const stores: [string, (db: TestDb['db']) => VectorStore][] = [
  ['PgVectorStore (real pgvector)', (db) => new PgVectorStore(db)],
  ['InMemoryVectorStore', () => new InMemoryVectorStore()],
];

describe.each(stores)('VectorStore contract — %s', (_name, make) => {
  it('rejects wrong-dimension embeddings', async () => {
    const store = make(harness.db);
    await expect(
      store.upsertBatch([record('x', 0, [1, 2, 3])]),
    ).rejects.toThrow(/512 dimensions/);
    await expect(
      store.search([1, 2, 3], { limit: 3, indexVersion: INDEX }),
    ).rejects.toThrow(/512 dimensions/);
  });

  it('ranks by cosine proximity and returns provenance for citations', async () => {
    const store = make(harness.db);
    await store.upsertBatch([
      record('energia', 0, vec({ 0: 1 })),
      record('industria', 0, vec({ 1: 1 })),
      record('energia', 1, vec({ 0: 0.9, 2: 0.1 })),
    ]);
    const results = await store.search(vec({ 0: 1 }), {
      limit: 2,
      indexVersion: INDEX,
    });
    expect(results).toHaveLength(2);
    expect(results[0]?.sourceSlug).toBe('energia');
    expect(results[0]?.chunkIndex).toBe(0);
    expect(results[0]?.score).toBeCloseTo(1, 4);
    expect(results[0]?.sourceTitle).toBe('Título energia');
    // Second best is the near-parallel chunk, not the orthogonal one.
    expect(results[1]?.sourceSlug).toBe('energia');
    expect(results[1]?.chunkIndex).toBe(1);
  });

  it('scopes results to the requested index version', async () => {
    const store = make(harness.db);
    await store.upsertBatch([
      record('a', 0, vec({ 0: 1 })),
      record('b', 0, vec({ 0: 1 }), { indexVersion: 'other-v2' }),
    ]);
    const results = await store.search(vec({ 0: 1 }), {
      limit: 5,
      indexVersion: INDEX,
    });
    expect(results.map((r) => r.sourceSlug)).toEqual(['a']);
    expect(await store.count(INDEX)).toBe(1);
    expect(await store.count('other-v2')).toBe(1);
  });

  it('upsert is idempotent on (source, chunk, version)', async () => {
    const store = make(harness.db);
    await store.upsertBatch([record('a', 0, vec({ 0: 1 }))]);
    await store.upsertBatch([
      record('a', 0, vec({ 0: 1 }), { content: 'Contenido actualizado' }),
    ]);
    expect(await store.count(INDEX)).toBe(1);
    const [top] = await store.search(vec({ 0: 1 }), {
      limit: 1,
      indexVersion: INDEX,
    });
    expect(top?.content).toBe('Contenido actualizado');
  });
});
