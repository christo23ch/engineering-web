import { describe, it, expect } from 'vitest';
import { createVoyageClient, MAX_BATCH } from '@/server/rag/embeddings/voyage';
import { EMBEDDING_DIMENSIONS } from '@/server/rag/vector-store';
import { IntegrationError } from '@/server/http/errors';

function dim(fill: number): number[] {
  return new Array<number>(EMBEDDING_DIMENSIONS).fill(fill);
}

interface Recorded {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

function fakeVoyage(
  status: number,
  body: unknown,
): { calls: Recorded[]; impl: typeof fetch } {
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

const client = (impl: typeof fetch) =>
  createVoyageClient({
    apiKey: 'voy-key',
    model: 'voyage-3-lite',
    fetchImpl: impl,
  });

describe('voyage embeddings client (DA-10)', () => {
  it('posts model + input_type + 512 output_dimension with Bearer auth', async () => {
    const { calls, impl } = fakeVoyage(200, {
      data: [{ embedding: dim(0.1), index: 0 }],
      usage: { total_tokens: 7 },
    });
    const result = await client(impl).embed(['hola'], 'query');
    expect(calls[0]?.url).toBe('https://api.voyageai.com/v1/embeddings');
    expect(calls[0]?.headers.authorization).toBe('Bearer voy-key');
    expect(calls[0]?.body).toMatchObject({
      model: 'voyage-3-lite',
      input: ['hola'],
      input_type: 'query',
      output_dimension: EMBEDDING_DIMENSIONS,
    });
    expect(result.embeddings).toHaveLength(1);
    expect(result.totalTokens).toBe(7);
  });

  it('reorders results by the provider index', async () => {
    const { impl } = fakeVoyage(200, {
      data: [
        { embedding: dim(0.2), index: 1 },
        { embedding: dim(0.1), index: 0 },
      ],
      usage: { total_tokens: 4 },
    });
    const result = await client(impl).embed(['a', 'b'], 'document');
    expect(result.embeddings[0]?.[0]).toBe(0.1);
    expect(result.embeddings[1]?.[0]).toBe(0.2);
  });

  it('short-circuits an empty batch without calling the API', async () => {
    const { calls, impl } = fakeVoyage(200, {});
    const result = await client(impl).embed([], 'document');
    expect(result).toEqual({ embeddings: [], totalTokens: 0 });
    expect(calls).toHaveLength(0);
  });

  it('rejects oversized batches (permanent) and wrong dimensions (permanent)', async () => {
    const big = new Array<string>(MAX_BATCH + 1).fill('x');
    await expect(
      client(fakeVoyage(200, {}).impl).embed(big, 'document'),
    ).rejects.toMatchObject({ retryable: false });

    const wrongDim = fakeVoyage(200, {
      data: [{ embedding: [1, 2, 3], index: 0 }],
      usage: { total_tokens: 1 },
    });
    await expect(
      client(wrongDim.impl).embed(['x'], 'query'),
    ).rejects.toMatchObject({
      retryable: false,
      message: expect.stringContaining('EMBEDDINGS_MODEL') as string,
    });
  });

  it('maps 429/5xx to transient and 4xx to permanent (ADR-010 policy)', async () => {
    for (const [status, retryable] of [
      [400, false],
      [401, false],
      [429, true],
      [500, true],
    ] as const) {
      await expect(
        client(fakeVoyage(status, { detail: 'x' }).impl).embed(['q'], 'query'),
      ).rejects.toMatchObject({ retryable });
    }
  });

  it('maps network failures to transient', async () => {
    const impl: typeof fetch = () => Promise.reject(new TypeError('boom'));
    await expect(client(impl).embed(['q'], 'query')).rejects.toBeInstanceOf(
      IntegrationError,
    );
    await expect(client(impl).embed(['q'], 'query')).rejects.toMatchObject({
      retryable: true,
    });
  });

  it('fails on a mismatched result count', async () => {
    const { impl } = fakeVoyage(200, {
      data: [{ embedding: dim(0.1), index: 0 }],
      usage: { total_tokens: 2 },
    });
    await expect(
      client(impl).embed(['a', 'b'], 'document'),
    ).rejects.toMatchObject({ retryable: false });
  });
});
