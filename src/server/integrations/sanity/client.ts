/**
 * Sanity read client (Bible §49 DA-7). GROQ over plain HTTP against the
 * canonical CMS_API_URL (§38 — the full query endpoint, see .env.example),
 * with CMS_API_TOKEN as Bearer. No SDK: the query API is one GET, and staying
 * on fetch keeps the supply chain small (§17) and the client trivially
 * fakeable in tests.
 *
 * Error mapping mirrors brevo/client.ts: 429/5xx/network transient, other
 * 4xx permanent (relevant when a rebuild webhook pipeline retries content
 * pulls).
 */
import type { CmsConfig } from '@/server/config';
import { IntegrationError } from '@/server/http/errors';

export interface SanityClient {
  fetch<T>(query: string, params?: Record<string, unknown>): Promise<T>;
}

const DEFAULT_TIMEOUT_MS = 15_000;

export interface SanityClientOptions {
  timeoutMs?: number;
  /**
   * Content perspective: 'published' (default — only DA-4-approved,
   * published documents) or 'drafts' (unpublished content for the protected
   * preview deployment, F2). Requires CMS_API_TOKEN when set to 'drafts'.
   */
  perspective?: 'published' | 'drafts';
}

export function createSanityClient(
  config: CmsConfig,
  fetchImpl: typeof fetch = fetch,
  options: SanityClientOptions = {},
): SanityClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  return {
    async fetch<T>(
      query: string,
      params: Record<string, unknown> = {},
    ): Promise<T> {
      const url = new URL(config.apiUrl);
      url.searchParams.set('query', query);
      if (options.perspective) {
        url.searchParams.set('perspective', options.perspective);
      }
      for (const [key, value] of Object.entries(params)) {
        // Sanity expects GROQ params as `$name` = JSON-encoded value.
        url.searchParams.set(`$${key}`, JSON.stringify(value));
      }

      const headers: Record<string, string> = { accept: 'application/json' };
      if (config.apiToken) {
        headers['authorization'] = `Bearer ${config.apiToken}`;
      }

      let response: Response;
      try {
        response = await fetchImpl(url, {
          headers,
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (cause) {
        throw new IntegrationError('sanity', 'request failed', {
          retryable: true,
          cause,
        });
      }

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 300);
        throw new IntegrationError(
          'sanity',
          `HTTP ${String(response.status)}: ${detail}`,
          { status: response.status },
        );
      }

      const body = (await response.json()) as { result?: T };
      if (body.result === undefined) {
        throw new IntegrationError('sanity', 'response has no result', {
          retryable: false,
        });
      }
      return body.result;
    },
  };
}
