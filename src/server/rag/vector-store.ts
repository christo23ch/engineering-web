/**
 * Vector store seam (ADR-004/005). Retrieval and indexing depend only on this
 * interface, so the production pgvector store (`PgVectorStore`, real
 * `vector(512)` + `<=>` cosine search on Supabase) and a portable in-memory
 * store (identical cosine semantics, used where pgvector is unavailable)
 * are interchangeable.
 */
import type { DbClient } from '@/server/db/client';

export const EMBEDDING_DIMENSIONS = 512;

export interface EmbeddingRecord {
  sourceType: 'service' | 'caseStudy' | 'article';
  sourceSlug: string;
  sourceTitle: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embedding: number[];
  contentHash: string;
  embeddingModel: string;
  indexVersion: string;
}

export interface RetrievedChunk {
  sourceType: 'service' | 'caseStudy' | 'article';
  sourceSlug: string;
  sourceTitle: string;
  chunkIndex: number;
  content: string;
  /** Cosine similarity in [-1, 1]; higher is closer. */
  score: number;
}

export interface SearchOptions {
  limit: number;
  indexVersion: string;
}

export interface VectorStore {
  /** Replace all rows for an index version's sources, transactionally. */
  upsertBatch(records: EmbeddingRecord[]): Promise<void>;
  /** Cosine-nearest chunks to the query embedding. */
  search(
    queryEmbedding: number[],
    options: SearchOptions,
  ): Promise<RetrievedChunk[]>;
  /** Row count for an index version (indexing/observability). */
  count(indexVersion: string): Promise<number>;
}

function assertDimensions(embedding: number[]): void {
  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `embedding must have ${String(EMBEDDING_DIMENSIONS)} dimensions, got ${String(
        embedding.length,
      )}`,
    );
  }
}

/** pgvector literal: `[0.1,0.2,…]` (no spaces). */
function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

export class PgVectorStore implements VectorStore {
  constructor(private readonly db: DbClient) {}

  async upsertBatch(records: EmbeddingRecord[]): Promise<void> {
    if (records.length === 0) return;
    for (const record of records) assertDimensions(record.embedding);

    await this.db.transaction(async (tx) => {
      for (const record of records) {
        await tx.query(
          `insert into embeddings
             (source_type, source_slug, source_title, chunk_index, content,
              token_count, embedding, content_hash, embedding_model,
              index_version)
           values ($1, $2, $3, $4, $5, $6, $7::vector, $8, $9, $10)
           on conflict (source_type, source_slug, chunk_index, index_version)
             do update set
               source_title = excluded.source_title,
               content = excluded.content,
               token_count = excluded.token_count,
               embedding = excluded.embedding,
               content_hash = excluded.content_hash,
               embedding_model = excluded.embedding_model`,
          [
            record.sourceType,
            record.sourceSlug,
            record.sourceTitle,
            record.chunkIndex,
            record.content,
            record.tokenCount,
            toVectorLiteral(record.embedding),
            record.contentHash,
            record.embeddingModel,
            record.indexVersion,
          ],
        );
      }
    });
  }

  async search(
    queryEmbedding: number[],
    options: SearchOptions,
  ): Promise<RetrievedChunk[]> {
    assertDimensions(queryEmbedding);
    const rows = await this.db.query<{
      source_type: RetrievedChunk['sourceType'];
      source_slug: string;
      source_title: string;
      chunk_index: number;
      content: string;
      score: number;
    }>(
      `select source_type, source_slug, source_title, chunk_index, content,
              1 - (embedding <=> $1::vector) as score
       from embeddings
       where index_version = $2
       order by embedding <=> $1::vector
       limit $3`,
      [toVectorLiteral(queryEmbedding), options.indexVersion, options.limit],
    );
    return rows.map((row) => ({
      sourceType: row.source_type,
      sourceSlug: row.source_slug,
      sourceTitle: row.source_title,
      chunkIndex: row.chunk_index,
      content: row.content,
      score: Number(row.score),
    }));
  }

  async count(indexVersion: string): Promise<number> {
    const rows = await this.db.query<{ n: string }>(
      'select count(*)::text as n from embeddings where index_version = $1',
      [indexVersion],
    );
    return Number(rows[0]?.n ?? 0);
  }
}

/** Cosine similarity for the in-memory store + score assertions in tests. */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * In-memory vector store — identical cosine ranking to PgVectorStore, for
 * environments without pgvector and for fast deterministic pipeline tests.
 */
export class InMemoryVectorStore implements VectorStore {
  private rows: (EmbeddingRecord & { key: string })[] = [];

  // `async` (not a bare Promise) so dimension violations reject rather than
  // throwing synchronously — matching PgVectorStore's behavior exactly.
  async upsertBatch(records: EmbeddingRecord[]): Promise<void> {
    await Promise.resolve();
    for (const record of records) {
      assertDimensions(record.embedding);
      const key = `${record.sourceType}:${record.sourceSlug}:${String(
        record.chunkIndex,
      )}:${record.indexVersion}`;
      this.rows = this.rows.filter((row) => row.key !== key);
      this.rows.push({ ...record, key });
    }
  }

  async search(
    queryEmbedding: number[],
    options: SearchOptions,
  ): Promise<RetrievedChunk[]> {
    await Promise.resolve();
    assertDimensions(queryEmbedding);
    return this.rows
      .filter((row) => row.indexVersion === options.indexVersion)
      .map((row) => ({
        sourceType: row.sourceType,
        sourceSlug: row.sourceSlug,
        sourceTitle: row.sourceTitle,
        chunkIndex: row.chunkIndex,
        content: row.content,
        score: cosineSimilarity(queryEmbedding, row.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, options.limit);
  }

  count(indexVersion: string): Promise<number> {
    return Promise.resolve(
      this.rows.filter((row) => row.indexVersion === indexVersion).length,
    );
  }
}
