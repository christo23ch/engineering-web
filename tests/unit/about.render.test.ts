import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import About from '@/pages/sobre-nosotros.astro';

// Structural render test for "Sobre nosotros" (DESIGN_SYSTEM §13.5). Locks the
// SSOT-derived sections and confirms the data/hypothesis-dependent sections
// (company metrics, team grid, ISO certifications) are NOT fabricated.
async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(About);
}

describe('Sobre nosotros (sobre-nosotros.astro)', () => {
  it('renders the interior hero with breadcrumbs and a single h1', async () => {
    const html = await render();
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('aria-label="Migas de pan"');
    expect(html).toContain('Ingeniería orientada a resultados');
  });

  it('renders the values without fabricating credentials', async () => {
    const html = await render();
    expect(html).toContain('Cómo trabajamos');
    // No specific ISO certification is asserted while H6 is unvalidated.
    expect(html).not.toMatch(/ISO\s?\d{4,5}/);
  });

  it('closes with the CTA band, single primary CTA, and Empleo link', async () => {
    const html = await render();
    // Scope to <main>: the shared Header also carries a "Solicitar propuesta" CTA.
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
    expect(main).toContain('data-surface="dark"');
    expect(main).toContain('bg-white'); // inverted button
    expect((main.match(/Solicitar propuesta/g) ?? []).length).toBe(1);
    expect(main).toContain('href="/empleo"');
  });
});
