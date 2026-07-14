import { describe, it, expect } from 'vitest';
import {
  createClaudeClient,
  estimateGenerationCostUsd,
  estimateEmbeddingCostUsd,
  ANTHROPIC_VERSION,
  type ClaudeRequest,
} from '@/server/ai/claude';
import { IntegrationError } from '@/server/http/errors';

interface Recorded {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

function fakeAnthropic(status: number, body: unknown) {
  const calls: Recorded[] = [];
  const impl: typeof fetch = (input, init) => {
    calls.push({
      url: String(input),
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>,
    });
    return Promise.resolve(new Response(JSON.stringify(body), { status }));
  };
  return { calls, impl };
}

const request: ClaudeRequest = {
  model: 'claude-haiku-4.5',
  system: 'Eres un asistente.',
  messages: [{ role: 'user', content: 'Hola' }],
  maxTokens: 512,
};

const client = (impl: typeof fetch) =>
  createClaudeClient({ apiKey: 'sk-ant-xxx', fetchImpl: impl });

describe('claude client (ADR-005 — Anthropic via BFF proxy)', () => {
  it('posts the Messages API shape with x-api-key + version, temp 0 default', async () => {
    const { calls, impl } = fakeAnthropic(200, {
      content: [{ type: 'text', text: 'Hola, ¿en qué ayudo?' }],
      usage: { input_tokens: 10, output_tokens: 6 },
      stop_reason: 'end_turn',
      model: 'claude-haiku-4.5',
    });
    const res = await client(impl).createMessage(request);
    expect(calls[0]?.url).toBe('https://api.anthropic.com/v1/messages');
    expect(calls[0]?.headers['x-api-key']).toBe('sk-ant-xxx');
    expect(calls[0]?.headers['anthropic-version']).toBe(ANTHROPIC_VERSION);
    expect(calls[0]?.body).toMatchObject({
      model: 'claude-haiku-4.5',
      system: 'Eres un asistente.',
      max_tokens: 512,
      temperature: 0,
    });
    expect(res.text).toBe('Hola, ¿en qué ayudo?');
    expect(res.usage).toEqual({ inputTokens: 10, outputTokens: 6 });
    expect(res.stopReason).toBe('end_turn');
  });

  it('concatenates text blocks and ignores non-text blocks', async () => {
    const { impl } = fakeAnthropic(200, {
      content: [
        { type: 'text', text: 'Parte 1. ' },
        { type: 'tool_use', text: undefined },
        { type: 'text', text: 'Parte 2.' },
      ],
      usage: { input_tokens: 3, output_tokens: 4 },
    });
    const res = await client(impl).createMessage(request);
    expect(res.text).toBe('Parte 1. Parte 2.');
  });

  it('passes stop sequences and a custom temperature when given', async () => {
    const { calls, impl } = fakeAnthropic(200, {
      content: [{ type: 'text', text: 'ok' }],
      usage: { input_tokens: 1, output_tokens: 1 },
    });
    await client(impl).createMessage({
      ...request,
      temperature: 0.2,
      stopSequences: ['\n\nFUENTES'],
    });
    expect(calls[0]?.body.temperature).toBe(0.2);
    expect(calls[0]?.body.stop_sequences).toEqual(['\n\nFUENTES']);
  });

  it('maps 429/5xx to transient and 4xx to permanent (ADR-010)', async () => {
    for (const [status, retryable] of [
      [400, false],
      [401, false],
      [429, true],
      [529, true],
    ] as const) {
      await expect(
        client(fakeAnthropic(status, { error: 'x' }).impl).createMessage(
          request,
        ),
      ).rejects.toMatchObject({ retryable });
    }
  });

  it('maps network failures to transient', async () => {
    const impl: typeof fetch = () => Promise.reject(new TypeError('down'));
    await expect(client(impl).createMessage(request)).rejects.toBeInstanceOf(
      IntegrationError,
    );
  });
});

describe('cost estimation (DA-6 ledger)', () => {
  it('prices per-model input/output tokens', () => {
    const cost = estimateGenerationCostUsd('claude-haiku-4.5', {
      inputTokens: 1_000_000,
      outputTokens: 1_000_000,
    });
    expect(cost).toBeCloseTo(1 + 5, 6);
  });

  it('falls back to the most expensive known price for unknown models (conservative)', () => {
    const cost = estimateGenerationCostUsd('claude-future-99', {
      inputTokens: 1_000_000,
      outputTokens: 0,
    });
    // Opus input rate (15) is the conservative fallback.
    expect(cost).toBeCloseTo(15, 6);
  });

  it('prices embedding tokens', () => {
    expect(estimateEmbeddingCostUsd(1_000_000)).toBeCloseTo(0.02, 6);
  });
});
