/**
 * Voyage AI embeddings client (Bible §49 DA-10; ADR-005 — Anthropic has no
 * embeddings API). Plain fetch (no SDK: smaller supply chain, §17; trivially
 * fakeable in tests). voyage-3-lite → 512 dimensions, matching the pgvector
 * column (ADR-004); the client asserts the returned dimension so a model
 * mismatch fails loudly instead of corrupting the index.
 *
 * `input_type` matters for retrieval quality: documents are embedded as
 * 'document', the user question as 'query' — Voyage optimizes each side.
 */
import { EMBEDDING_DIMENSIONS } from '@/server/rag/vector-store';
import { IntegrationError } from '@/server/http/errors';

export interface VoyageConfig {
  apiKey: string;
  model: string;
  apiBase?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export type EmbeddingInputType = 'query' | 'document';

export interface EmbeddingResult {
  embeddings: number[][];
  /** Tokens billed by the provider (exact — feeds the DA-6 ledger). */
  totalTokens: number;
}

export interface EmbeddingsClient {
  embed(
    texts: string[],
    inputType: EmbeddingInputType,
  ): Promise<EmbeddingResult>;
}

const DEFAULT_API_BASE = 'https://api.voyageai.com/v1';
const DEFAULT_TIMEOUT_MS = 20_000;
/** Voyage caps batch size; documents are chunked well under this. */
export const MAX_BATCH = 128;

interface VoyageResponse {
  data?: { embedding: number[]; index: number }[];
  usage?: { total_tokens: number };
}

export function createVoyageClient(config: VoyageConfig): EmbeddingsClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const base = (config.apiBase ?? DEFAULT_API_BASE).replace(/\/$/, '');
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async embed(
      texts: string[],
      inputType: EmbeddingInputType,
    ): Promise<EmbeddingResult> {
      if (texts.length === 0) return { embeddings: [], totalTokens: 0 };
      if (texts.length > MAX_BATCH) {
        throw new IntegrationError(
          'voyage',
          `batch of ${String(texts.length)} exceeds ${String(MAX_BATCH)}`,
          { retryable: false },
        );
      }

      let response: Response;
      try {
        response = await fetchImpl(`${base}/embeddings`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${config.apiKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            input: texts,
            input_type: inputType,
            output_dimension: EMBEDDING_DIMENSIONS,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (cause) {
        throw new IntegrationError('voyage', 'request failed', {
          retryable: true,
          cause,
        });
      }

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 300);
        throw new IntegrationError(
          'voyage',
          `HTTP ${String(response.status)}: ${detail}`,
          { status: response.status },
        );
      }

      const body = (await response.json()) as VoyageResponse;
      const data = body.data;
      if (!data || data.length !== texts.length) {
        throw new IntegrationError('voyage', 'unexpected embeddings count', {
          retryable: false,
        });
      }

      // Preserve request order (Voyage returns an explicit index).
      const ordered = [...data].sort((a, b) => a.index - b.index);
      const embeddings = ordered.map((item) => {
        if (item.embedding.length !== EMBEDDING_DIMENSIONS) {
          throw new IntegrationError(
            'voyage',
            `expected ${String(EMBEDDING_DIMENSIONS)}-dim embeddings, got ${String(
              item.embedding.length,
            )} — check EMBEDDINGS_MODEL`,
            { retryable: false },
          );
        }
        return item.embedding;
      });

      return {
        embeddings,
        totalTokens: body.usage?.total_tokens ?? 0,
      };
    },
  };
}
