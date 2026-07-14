/**
 * Indexing pipeline (ADR-005). Content → chunks → embeddings → pgvector.
 *
 * Idempotent + cheap on re-run: only chunks whose content hash changed (or
 * are new) are re-embedded — unchanged chunks are skipped, so a rebuild after
 * a small edit costs a few embeddings, not the whole corpus. Chunks that no
 * longer exist are pruned. Embedding spend is metered into the DA-6 ledger by
 * the caller via the returned `embeddingTokens`.
 */
import type { Article } from '@/lib/content/articles';
import type { CaseStudy } from '@/lib/content/cases';
import type { Service } from '@/lib/content/services';
import {
  chunkArticle,
  chunkCase,
  chunkService,
  type Chunk,
} from '@/server/rag/chunker';
import type { EmbeddingsClient } from '@/server/rag/embeddings/voyage';
import { MAX_BATCH } from '@/server/rag/embeddings/voyage';
import {
  chunkKey,
  type EmbeddingRecord,
  type VectorStore,
} from '@/server/rag/vector-store';
import type { Logger } from '@/server/logging/logger';

export interface ContentBundle {
  services: Service[];
  cases: CaseStudy[];
  articles: Article[];
}

/**
 * The index version binds the embedding model to a manual corpus revision.
 * Bump CORPUS_REVISION when the chunking strategy changes so a rebuild
 * re-embeds everything under a fresh version instead of mixing schemes.
 */
export const CORPUS_REVISION = 'r1';

export function resolveIndexVersion(embeddingModel: string): string {
  return `${embeddingModel}#${CORPUS_REVISION}`;
}

export interface IndexStats {
  totalChunks: number;
  embedded: number;
  skipped: number;
  pruned: number;
  embeddingTokens: number;
  indexVersion: string;
}

function allChunks(content: ContentBundle): Chunk[] {
  return [
    ...content.services.flatMap((s) => chunkService(s)),
    ...content.cases.flatMap((c) => chunkCase(c)),
    ...content.articles.flatMap((a) => chunkArticle(a)),
  ];
}

export interface IndexDeps {
  store: VectorStore;
  embeddings: EmbeddingsClient;
  embeddingModel: string;
  log?: Logger;
}

export async function indexContent(
  content: ContentBundle,
  deps: IndexDeps,
): Promise<IndexStats> {
  const indexVersion = resolveIndexVersion(deps.embeddingModel);
  const chunks = allChunks(content);
  const existing = await deps.store.existingHashes(indexVersion);

  // Only (re)embed new or changed chunks.
  const changed = chunks.filter((chunk) => {
    const key = chunkKey(chunk.sourceType, chunk.sourceSlug, chunk.chunkIndex);
    return existing.get(key) !== chunk.contentHash;
  });

  let embeddingTokens = 0;
  for (let i = 0; i < changed.length; i += MAX_BATCH) {
    const batch = changed.slice(i, i + MAX_BATCH);
    const { embeddings, totalTokens } = await deps.embeddings.embed(
      batch.map((chunk) => chunk.content),
      'document',
    );
    embeddingTokens += totalTokens;
    const records: EmbeddingRecord[] = batch.map((chunk, j) => {
      const embedding = embeddings[j];
      if (!embedding) throw new Error('embedding missing for chunk');
      return {
        sourceType: chunk.sourceType,
        sourceSlug: chunk.sourceSlug,
        sourceTitle: chunk.sourceTitle,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        embedding,
        contentHash: chunk.contentHash,
        embeddingModel: deps.embeddingModel,
        indexVersion,
      };
    });
    await deps.store.upsertBatch(records);
  }

  // Prune chunks that no longer exist in the current content.
  const validKeys = new Set(
    chunks.map((chunk) =>
      chunkKey(chunk.sourceType, chunk.sourceSlug, chunk.chunkIndex),
    ),
  );
  const pruned = await deps.store.prune(indexVersion, validKeys);

  const stats: IndexStats = {
    totalChunks: chunks.length,
    embedded: changed.length,
    skipped: chunks.length - changed.length,
    pruned,
    embeddingTokens,
    indexVersion,
  };
  deps.log?.info('rag index run', { ...stats });
  return stats;
}
