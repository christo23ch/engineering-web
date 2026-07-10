import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Portfolio from '@/pages/proyectos/index.astro';

// Structural render test for the Portfolio screen (DESIGN_SYSTEM §13.3). With no
// case data yet, the screen must render §13.3's specified empty state (never a
// blank page) and never fabricate projects — so this locks that behaviour.
async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Portfolio);
}

describe('Portfolio (proyectos/index.astro)', () => {
  it('renders the interior hero with breadcrumbs and a single h1', async () => {
    const html = await render();
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('aria-label="Migas de pan"');
    expect(html).toContain('Casos de éxito con resultados medibles');
  });

  it('shows the specified empty state instead of fabricated cases', async () => {
    const html = await render();
    expect(html).toContain('Casos de éxito en preparación');
    // No case grid / metrics are invented while data is pending.
    expect(html).not.toContain('data-metric');
  });

  it('closes with the single primary CTA in a dark band (P3)', async () => {
    const html = await render();
    // Scope to <main>: the shared Header also carries a "Solicitar propuesta" CTA.
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
    expect(main).toContain('data-surface="dark"');
    expect(main).toContain('bg-white'); // inverted button
    // Exactly one "Solicitar propuesta" CTA in the content (single primary CTA).
    expect((main.match(/Solicitar propuesta/g) ?? []).length).toBe(1);
  });
});
