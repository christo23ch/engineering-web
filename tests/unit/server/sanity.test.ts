import { describe, it, expect } from 'vitest';
import { IntegrationError } from '@/server/http/errors';
import { createSanityClient } from '@/server/integrations/sanity/client';
import {
  loadServices,
  loadCases,
  loadArticles,
} from '@/server/integrations/sanity/content';
import { services } from '@/lib/content/services';

const CMS_URL = 'https://p.api.sanity.io/v2025-02-19/data/query/production';

function fakeFetch(status: number, body: unknown) {
  const calls: { url: URL; init?: RequestInit }[] = [];
  const impl: typeof fetch = (input, init) => {
    calls.push({ url: new URL(String(input)), init });
    return Promise.resolve(new Response(JSON.stringify(body), { status }));
  };
  return { calls, impl };
}

describe('sanity client (DA-7) — GROQ over canonical CMS_API_URL', () => {
  it('encodes the query + $params and sends the Bearer token', async () => {
    const { calls, impl } = fakeFetch(200, { result: [] });
    const client = createSanityClient(
      { apiUrl: CMS_URL, apiToken: 'cms-token' },
      impl,
    );
    await client.fetch('*[_type == "service"]', { lang: 'es' });
    const url = calls[0]?.url;
    expect(url?.origin).toBe('https://p.api.sanity.io');
    expect(url?.searchParams.get('query')).toBe('*[_type == "service"]');
    expect(url?.searchParams.get('$lang')).toBe('"es"');
    const headers = calls[0]?.init?.headers as Record<string, string>;
    expect(headers['authorization']).toBe('Bearer cms-token');
  });

  it('works tokenless for public datasets', async () => {
    const { calls, impl } = fakeFetch(200, { result: [] });
    await createSanityClient({ apiUrl: CMS_URL }, impl).fetch('*');
    const headers = calls[0]?.init?.headers as Record<string, string>;
    expect(headers['authorization']).toBeUndefined();
  });

  it('maps 401 to permanent and 503 to transient; missing result fails', async () => {
    await expect(
      createSanityClient(
        { apiUrl: CMS_URL },
        fakeFetch(401, { message: 'unauthorized' }).impl,
      ).fetch('*'),
    ).rejects.toMatchObject({ retryable: false });
    await expect(
      createSanityClient({ apiUrl: CMS_URL }, fakeFetch(503, {}).impl).fetch(
        '*',
      ),
    ).rejects.toMatchObject({ retryable: true });
    await expect(
      createSanityClient(
        { apiUrl: CMS_URL },
        fakeFetch(200, { ms: 3 }).impl,
      ).fetch('*'),
    ).rejects.toBeInstanceOf(IntegrationError);
  });
});

describe('content loaders — honest fallback (Bible §1/§3)', () => {
  it('without CMS config: local sources verbatim (6 services, 0 cases/articles)', async () => {
    expect(await loadServices()).toBe(services);
    expect(await loadServices()).toHaveLength(6);
    expect(await loadCases()).toHaveLength(0);
    expect(await loadArticles()).toHaveLength(0);
  });

  it('with CMS config: returns validated, typed services', async () => {
    const row = {
      slug: 'ingenieria-industrial',
      name: 'Ingeniería industrial',
      icon: 'factory',
      description: 'Desc.',
      problem: 'Problema.',
    };
    const { impl } = fakeFetch(200, { result: [row] });
    const loaded = await loadServices({
      cms: { apiUrl: CMS_URL },
      fetchImpl: impl,
    });
    expect(loaded).toEqual([row]);
  });

  it('rejects CMS content with an unknown icon (loud build failure)', async () => {
    const { impl } = fakeFetch(200, {
      result: [
        {
          slug: 'x',
          name: 'X',
          icon: 'no-such-icon',
          description: 'D',
          problem: 'P',
        },
      ],
    });
    await expect(
      loadServices({ cms: { apiUrl: CMS_URL }, fetchImpl: impl }),
    ).rejects.toMatchObject({
      retryable: false,
      message: expect.stringContaining('unknown icon name') as string,
    });
  });

  it('maps a full case study, dropping nullish optionals', async () => {
    const { impl } = fakeFetch(200, {
      result: [
        {
          slug: 'caso-uno',
          title: 'Caso uno',
          client: null,
          sector: 'Industria',
          services: ['ingenieria-industrial'],
          summary: 'Resumen.',
          icon: 'factory',
          metrics: [{ value: '-32', unit: '%', label: 'Ahorro' }],
          challenge: 'Reto.',
          solution: 'Solución.',
          results: 'Resultados.',
          gallery: null,
          testimonial: null,
        },
      ],
    });
    const [loaded] = await loadCases({
      cms: { apiUrl: CMS_URL },
      fetchImpl: impl,
    });
    expect(loaded?.slug).toBe('caso-uno');
    expect(loaded?.gallery).toEqual([]);
    expect(loaded?.testimonial).toBeUndefined();
    expect(loaded && 'client' in loaded && loaded.client).toBeFalsy();
    expect(loaded?.metrics[0]).toEqual({
      value: '-32',
      unit: '%',
      label: 'Ahorro',
    });
  });

  it('maps articles with author and sections', async () => {
    const { impl } = fakeFetch(200, {
      result: [
        {
          slug: 'articulo-uno',
          title: 'Artículo uno',
          category: 'Eficiencia',
          excerpt: 'Extracto.',
          updated: '2026-07-01',
          author: { name: 'Autora', role: null, bio: null },
          sections: [{ heading: 'Sección', body: ['Párrafo.'] }],
        },
      ],
    });
    const [article] = await loadArticles({
      cms: { apiUrl: CMS_URL },
      fetchImpl: impl,
    });
    expect(article?.author).toEqual({ name: 'Autora' });
    expect(article?.sections[0]?.body).toEqual(['Párrafo.']);
  });

  it('rejects malformed article payloads with per-field detail', async () => {
    const { impl } = fakeFetch(200, {
      result: [{ slug: 'BAD SLUG', title: '' }],
    });
    await expect(
      loadArticles({ cms: { apiUrl: CMS_URL }, fetchImpl: impl }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('invalid article content') as string,
    });
  });
});
