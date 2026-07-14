/**
 * Brevo HTTP client (Bible §49: DA-2 CRM + DA-8 transactional email — one
 * vendor, two capabilities, separate §38 credentials). Plain fetch, no SDK:
 * fewer supply-chain dependencies (§17) and trivial to fake in tests.
 *
 * Error mapping feeds the ADR-010 retry policy: 429/5xx/network/timeout are
 * transient (IntegrationError retryable), other 4xx are permanent. Response
 * bodies are truncated into the error message — they can contain vendor
 * diagnostics but never our secrets.
 */
import { IntegrationError } from '@/server/http/errors';

export interface BrevoClientOptions {
  apiBase: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface BrevoClient {
  post(path: string, body: Record<string, unknown>): Promise<unknown>;
}

const DEFAULT_TIMEOUT_MS = 10_000;

export function createBrevoClient(options: BrevoClientOptions): BrevoClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const base = options.apiBase.replace(/\/$/, '');

  return {
    async post(path: string, body: Record<string, unknown>): Promise<unknown> {
      let response: Response;
      try {
        response = await fetchImpl(`${base}${path}`, {
          method: 'POST',
          headers: {
            'api-key': options.apiKey,
            'content-type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (cause) {
        // Network failure / DNS / timeout — always worth retrying.
        throw new IntegrationError('brevo', 'request failed', {
          retryable: true,
          cause,
        });
      }

      if (response.ok) {
        if (response.status === 204) return undefined;
        const text = await response.text();
        if (text === '') return undefined;
        try {
          return JSON.parse(text) as unknown;
        } catch {
          return undefined;
        }
      }

      const detail = (await response.text()).slice(0, 300);
      throw new IntegrationError(
        'brevo',
        `HTTP ${String(response.status)} on ${path}: ${detail}`,
        { status: response.status },
      );
    },
  };
}
