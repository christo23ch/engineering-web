/**
 * Retrieval (ADR-005 / §16). Embed the user question, cosine-search pgvector,
 * and keep only chunks above a relevance floor. The floor is the
 * no-hallucination gate: if nothing clears it, retrieval returns EMPTY, and
 * the assistant must refuse rather than answer from parametric memory.
 */
import type { EmbeddingsClient } from '@/server/rag/embeddings/voyage';
import type { RetrievedChunk, VectorStore } from '@/server/rag/vector-store';

export interface RetrievalOptions {
  /** Max chunks fed to the model (top-k). */
  topK?: number;
  /** Minimum cosine similarity in [-1,1] to be considered relevant. */
  minScore?: number;
  indexVersion: string;
}

const DEFAULT_TOP_K = 6;
const DEFAULT_MIN_SCORE = 0.35;

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  /** Embedding tokens billed for the query (feeds the DA-6 ledger). */
  queryTokens: number;
  /** True when nothing cleared the relevance floor (→ refuse). */
  empty: boolean;
}

export interface RetrievalDeps {
  store: VectorStore;
  embeddings: EmbeddingsClient;
}

export async function retrieve(
  question: string,
  deps: RetrievalDeps,
  options: RetrievalOptions,
): Promise<RetrievalResult> {
  const topK = options.topK ?? DEFAULT_TOP_K;
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;

  const { embeddings, totalTokens } = await deps.embeddings.embed(
    [question],
    'query',
  );
  const queryEmbedding = embeddings[0];
  if (!queryEmbedding) {
    return { chunks: [], queryTokens: totalTokens, empty: true };
  }

  const candidates = await deps.store.search(queryEmbedding, {
    // Over-fetch, then apply the floor, so a weak top-k does not crowd out a
    // strong-but-lower-ranked chunk.
    limit: topK,
    indexVersion: options.indexVersion,
  });
  const relevant = candidates.filter((chunk) => chunk.score >= minScore);

  return {
    chunks: relevant,
    queryTokens: totalTokens,
    empty: relevant.length === 0,
  };
}
