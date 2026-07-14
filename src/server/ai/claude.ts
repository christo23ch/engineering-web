/**
 * Claude client (ADR-005: Anthropic, generation only, via the BFF proxy —
 * the API key never reaches the browser, §17). Plain fetch against the
 * Messages API (no SDK: smaller supply chain; trivially fakeable in tests).
 *
 * The caller picks the model (Haiku default, Sonnet/Opus for complex Q&A —
 * ADR-005 model strategy) and supplies the system prompt + messages built by
 * the prompt builder. This client is transport only: it does not know about
 * RAG, citations or budgets — those are enforced above it.
 */
import { IntegrationError } from '@/server/http/errors';

export const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_API_BASE = 'https://api.anthropic.com/v1';
const DEFAULT_TIMEOUT_MS = 30_000;

export interface ClaudeConfig {
  apiKey: string;
  apiBase?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequest {
  model: string;
  system: string;
  messages: ClaudeMessage[];
  maxTokens: number;
  /** Low by default for factual RAG answers; caller may override. */
  temperature?: number;
  /** Hard stop sequences (e.g. to bound tool-free output). */
  stopSequences?: string[];
}

export interface ClaudeUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface ClaudeResponse {
  text: string;
  usage: ClaudeUsage;
  stopReason: string | null;
  model: string;
}

interface AnthropicResponseBody {
  content?: { type: string; text?: string }[];
  usage?: { input_tokens: number; output_tokens: number };
  stop_reason?: string | null;
  model?: string;
}

export interface ClaudeClient {
  createMessage(request: ClaudeRequest): Promise<ClaudeResponse>;
}

export function createClaudeClient(config: ClaudeConfig): ClaudeClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const base = (config.apiBase ?? DEFAULT_API_BASE).replace(/\/$/, '');
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async createMessage(request: ClaudeRequest): Promise<ClaudeResponse> {
      let response: Response;
      try {
        response = await fetchImpl(`${base}/messages`, {
          method: 'POST',
          headers: {
            'x-api-key': config.apiKey,
            'anthropic-version': ANTHROPIC_VERSION,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: request.model,
            system: request.system,
            messages: request.messages,
            max_tokens: request.maxTokens,
            temperature: request.temperature ?? 0,
            ...(request.stopSequences
              ? { stop_sequences: request.stopSequences }
              : {}),
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (cause) {
        throw new IntegrationError('anthropic', 'request failed', {
          retryable: true,
          cause,
        });
      }

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 300);
        throw new IntegrationError(
          'anthropic',
          `HTTP ${String(response.status)}: ${detail}`,
          { status: response.status },
        );
      }

      const body = (await response.json()) as AnthropicResponseBody;
      const text = (body.content ?? [])
        .filter((block) => block.type === 'text')
        .map((block) => block.text ?? '')
        .join('')
        .trim();

      return {
        text,
        usage: {
          inputTokens: body.usage?.input_tokens ?? 0,
          outputTokens: body.usage?.output_tokens ?? 0,
        },
        stopReason: body.stop_reason ?? null,
        model: body.model ?? request.model,
      };
    },
  };
}

/**
 * Approximate USD cost from token usage (DA-6 ledger). Anthropic prices are
 * per 1M tokens and model-specific; this table is a conservative default,
 * overridable so the client can ratify real numbers without a code change.
 */
export interface ModelPricing {
  inputPerMTok: number;
  outputPerMTok: number;
}

export const DEFAULT_PRICING: Record<string, ModelPricing> = {
  'claude-haiku-4.5': { inputPerMTok: 1, outputPerMTok: 5 },
  'claude-opus-4-8': { inputPerMTok: 15, outputPerMTok: 75 },
};

/** Voyage voyage-3-lite embeddings price (per 1M tokens). */
export const EMBEDDING_PRICE_PER_MTOK = 0.02;

export function estimateGenerationCostUsd(
  model: string,
  usage: ClaudeUsage,
  pricing: Record<string, ModelPricing> = DEFAULT_PRICING,
): number {
  // Unknown models fall back to the most expensive known price (conservative
  // for a budget guard — never under-count spend).
  const known = pricing[model];
  const rate =
    known ??
    Object.values(pricing).reduce(
      (max, p) => (p.outputPerMTok > max.outputPerMTok ? p : max),
      { inputPerMTok: 0, outputPerMTok: 0 },
    );
  return (
    (usage.inputTokens / 1_000_000) * rate.inputPerMTok +
    (usage.outputTokens / 1_000_000) * rate.outputPerMTok
  );
}

export function estimateEmbeddingCostUsd(tokens: number): number {
  return (tokens / 1_000_000) * EMBEDDING_PRICE_PER_MTOK;
}
