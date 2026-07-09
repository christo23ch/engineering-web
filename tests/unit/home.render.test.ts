import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Home from '@/pages/index.astro';

// Structural render test for the Home screen (DESIGN_SYSTEM §13.1). Asserts the
// document skeleton, heading hierarchy and the SSOT-derived content that the
// screen must always carry, so accidental regressions surface fast.
async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Home);
}

describe('Home (index.astro)', () => {
  it('has a single h1 with the value proposition', async () => {
    const html = await render();
    const h1s = html.match(/<h1[\s>]/g) ?? [];
    expect(h1s).toHaveLength(1);
    expect(html).toContain('Ingeniería que rinde');
    expect(html).toContain('<main');
  });

  it('keeps a semantic heading order (one h1, three section h2s)', async () => {
    const html = await render();
    expect((html.match(/<h2[\s>]/g) ?? []).length).toBe(3);
    // Service names render as h3 (subsection/card titles, §4).
    expect((html.match(/<h3[\s>]/g) ?? []).length).toBe(6);
  });

  it('renders the six service lines linking to their routes (Bible §24)', async () => {
    const html = await render();
    for (const slug of [
      'ingenieria-industrial',
      'eficiencia-energetica',
      'energias-renovables',
      'instalaciones-mep',
      'consultoria-tecnica',
      'digitalizacion-bim',
    ]) {
      expect(html).toContain(`/servicios/${slug}`);
    }
  });

  it('closes with a dark CTA band using the inverted button (§11.5)', async () => {
    const html = await render();
    expect(html).toContain('data-surface="dark"');
    // Inverted variant treatment (white fill) inside the dark band.
    expect(html).toContain('bg-white');
    expect(html).toContain('text-on-dark');
  });
});
