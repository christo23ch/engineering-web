import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Article from '@/pages/recursos/[slug].astro';
import {
  articles,
  sectionId,
  type Article as ArticleType,
} from '@/lib/content/articles';

// Article detail template (§13.6) validated with a TEST FIXTURE — never shipped
// as content. Real articles come from the CMS (DA-7); the source stays empty.
const fixture: ArticleType = {
  slug: 'eficiencia-en-plantas-industriales',
  title: 'Eficiencia energética en plantas industriales',
  category: 'Eficiencia energética',
  excerpt: 'Cómo priorizar medidas de ahorro con criterio de ingeniería.',
  updated: '2026-07-10',
  author: {
    name: 'Equipo de ingeniería',
    role: 'Energía',
    bio: 'Ingeniería especializada en eficiencia y sostenibilidad.',
  },
  sections: [
    { heading: 'Diagnóstico', body: ['Medir antes de actuar.'] },
    { heading: 'Medidas', body: ['Priorizar por retorno.'] },
  ],
};

async function render(article: ArticleType) {
  const container = await AstroContainer.create();
  return container.renderToString(Article, { props: { article } });
}

describe('Article detail ([slug].astro)', () => {
  it('ships no fabricated articles (CMS-driven, DA-7)', () => {
    expect(articles).toHaveLength(0);
  });

  it('renders hero, author (E-E-A-T) and a ToC linked to section anchors', async () => {
    const html = await render(fixture);
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('Eficiencia energética en plantas industriales');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Sobre el autor');
    // ToC anchor matches the section heading id.
    expect(html).toContain(`href="#${sectionId('Diagnóstico')}"`);
    expect(html).toContain(`id="${sectionId('Diagnóstico')}"`);
  });

  it('intersperses the lead-magnet capture (RF-13)', async () => {
    const html = await render(fixture);
    expect(html).toContain('name="email"');
    expect(html).toContain('name="consentimiento"');
  });
});
