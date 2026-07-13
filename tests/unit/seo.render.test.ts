import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Home from '@/pages/index.astro';
import Service from '@/pages/servicios/[slug].astro';
import Legal from '@/pages/legal/[slug].astro';
import { getService } from '@/lib/content/services';
import { getLegalPage } from '@/lib/content/legal';
import {
  organizationSchema,
  breadcrumbSchema,
  faqSchema,
} from '@/lib/seo/schema';

async function render(
  Component: Parameters<AstroContainer['renderToString']>[0],
  props?: Record<string, unknown>,
) {
  const container = await AstroContainer.create();
  return container.renderToString(Component, props ? { props } : undefined);
}

interface JsonLdBlock {
  '@type': string;
  [key: string]: unknown;
}

function jsonLdBlocks(html: string): JsonLdBlock[] {
  const blocks: JsonLdBlock[] = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    blocks.push(JSON.parse((m[1] ?? '').replace(/\\u003c/g, '<')));
  }
  return blocks;
}

describe('SEO layer — schema.org builders (lib/seo/schema.ts)', () => {
  it('organizationSchema uses the real site-wide name only (no invented logo/sameAs)', () => {
    const schema = organizationSchema('https://example.com');
    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Ingeniería que rinde',
      url: 'https://example.com',
    });
    expect(schema).not.toHaveProperty('logo');
    expect(schema).not.toHaveProperty('sameAs');
  });

  it('breadcrumbSchema omits `item` for a crumb with no href (non-clickable)', () => {
    const schema = breadcrumbSchema('https://example.com', [
      { name: 'Inicio', href: '/' },
      { name: 'Servicios' },
      {
        name: 'Eficiencia energética',
        href: '/servicios/eficiencia-energetica',
      },
    ]);
    expect(schema.itemListElement[1]).not.toHaveProperty('item');
    expect(schema.itemListElement[0]?.item).toBe('https://example.com/');
    expect(schema.itemListElement[2]?.item).toBe(
      'https://example.com/servicios/eficiencia-energetica',
    );
  });

  it('faqSchema serializes exactly the given Q&A pairs', () => {
    const schema = faqSchema([{ q: '¿Uno?', a: 'Sí.' }]);
    expect(schema.mainEntity).toHaveLength(1);
    expect(schema.mainEntity[0]?.name).toBe('¿Uno?');
    expect(schema.mainEntity[0]?.acceptedAnswer.text).toBe('Sí.');
  });
});

describe('SEO layer — rendered pages', () => {
  it('Home carries Organization JSON-LD and OG/Twitter meta, no breadcrumb (level 1)', async () => {
    const html = await render(Home);
    const blocks = jsonLdBlocks(html);
    expect(blocks.some((b) => b['@type'] === 'Organization')).toBe(true);
    expect(blocks.some((b) => b['@type'] === 'BreadcrumbList')).toBe(false);
    expect(html).toContain('property="og:title"');
    expect(html).toContain('name="twitter:card" content="summary"');
    // No fabricated image claim.
    expect(html).not.toContain('og:image');
    expect(html).not.toContain('twitter:image');
  });

  it('Service page carries BreadcrumbList + FAQPage JSON-LD matching the on-page content', async () => {
    const html = await render(Service, {
      service: getService('eficiencia-energetica'),
    });
    const blocks = jsonLdBlocks(html);
    const breadcrumb = blocks.find((b) => b['@type'] === 'BreadcrumbList') as
      ReturnType<typeof breadcrumbSchema> | undefined;
    const faq = blocks.find((b) => b['@type'] === 'FAQPage') as
      ReturnType<typeof faqSchema> | undefined;
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb?.itemListElement.at(-1)?.name).toBe(
      'Eficiencia energética',
    );
    expect(faq).toBeTruthy();
    expect(faq?.mainEntity.length).toBeGreaterThan(0);
    // The FAQ schema question text matches what's visibly rendered.
    expect(html).toContain(faq?.mainEntity[0]?.name ?? '');
  });

  it('Legal pages are BreadcrumbList-only (no FAQPage, no commercial OG type change)', async () => {
    const html = await render(Legal, { page: getLegalPage('privacidad') });
    const blocks = jsonLdBlocks(html);
    expect(blocks.some((b) => b['@type'] === 'BreadcrumbList')).toBe(true);
    expect(blocks.some((b) => b['@type'] === 'FAQPage')).toBe(false);
  });
});
