import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import CaseDetail from '@/pages/proyectos/[slug].astro';
import { cases, type CaseStudy } from '@/lib/content/cases';

// The case-detail template (§13.4) is validated with a TEST FIXTURE — a case
// built here, never shipped as content. Real cases come from the CMS (DA-7);
// the shipped source stays empty so no project is ever fabricated.
const fixture: CaseStudy = {
  slug: 'planta-fotovoltaica-demo',
  title: 'Planta fotovoltaica de autoconsumo',
  client: 'Cliente industrial',
  sector: 'Industria',
  services: ['energias-renovables', 'eficiencia-energetica'],
  summary: 'Autoconsumo solar para reducir el coste energético de la planta.',
  icon: 'sun',
  metrics: [
    { value: '-32', unit: '%', label: 'Coste energético' },
    { value: '1,2', unit: 'GWh/año', label: 'Generación' },
    { value: '6', unit: 'meses', label: 'Plazo' },
  ],
  challenge: 'Un coste energético elevado y creciente.',
  solution: 'Instalación fotovoltaica dimensionada por datos de consumo.',
  results: 'Reducción verificada del coste y de las emisiones.',
  gallery: [
    {
      src: '/img/demo.avif',
      alt: 'Vista de la instalación',
      width: 1200,
      height: 800,
    },
  ],
  testimonial: {
    quote: 'Un equipo riguroso y orientado a resultados.',
    author: 'Dirección de operaciones',
  },
};

async function render(caseStudy: CaseStudy) {
  const container = await AstroContainer.create();
  return container.renderToString(CaseDetail, { props: { caseStudy } });
}

describe('Case detail ([slug].astro)', () => {
  it('ships no fabricated cases (CMS-driven, DA-7)', () => {
    expect(cases).toHaveLength(0);
  });

  it('renders the §13.4 skeleton: hero, chips, metrics, story, CTA', async () => {
    const html = await render(fixture);
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('Planta fotovoltaica de autoconsumo');
    expect(html).toContain('aria-current="page"');
    // Sector + both applied-service chips.
    expect(html).toContain('Industria');
    expect(html).toContain('Energías renovables');
    // Metrics band + story sections.
    expect(html).toContain('GWh/año');
    for (const h of ['El reto', 'La solución', 'Los resultados']) {
      expect(html).toContain(h);
    }
    // Dark CTA band with the inverted button.
    expect(html).toContain('data-surface="dark"');
    expect(html).toContain('bg-white');
  });

  it('renders a lazy, dimensioned gallery image and the testimonial', async () => {
    const html = await render(fixture);
    expect(html).toMatch(/<img[^>]+loading="lazy"/);
    expect(html).toMatch(/<img[^>]+width="1200"[^>]+height="800"/);
    expect(html).toContain('<blockquote');
    expect(html).toContain('Un equipo riguroso');
  });

  it('omits data-dependent sections gracefully when absent', async () => {
    const bare: CaseStudy = {
      ...fixture,
      gallery: [],
      testimonial: undefined,
    };
    const html = await render(bare);
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<blockquote');
    // Core sections still render.
    expect(html).toContain('El reto');
  });
});
