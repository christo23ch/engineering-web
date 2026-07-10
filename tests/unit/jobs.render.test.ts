import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Jobs from '@/pages/empleo.astro';

// Structural render test for Empleo (DESIGN_SYSTEM §13.7). With no open
// positions, the screen must render the specified no-offers state (spontaneous
// application) and never fabricate job offers.
async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Jobs);
}

describe('Empleo (empleo.astro)', () => {
  it('renders the hero with breadcrumbs and a single h1', async () => {
    const html = await render();
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('aria-label="Migas de pan"');
    expect(html).toContain('Trabaja en ingeniería que rinde');
  });

  it('shows the no-offers state (spontaneous application)', async () => {
    const html = await render();
    expect(html).toContain('No hay ofertas abiertas ahora mismo');
    expect(html).toContain('candidatura espontánea');
  });

  it('closes with the single primary CTA routing to contact (P3)', async () => {
    const html = await render();
    expect(html).toContain('data-surface="dark"');
    expect(html).toContain('bg-white'); // inverted button
    expect(html).toContain('href="/contacto"');
    expect((html.match(/Enviar candidatura espontánea/g) ?? []).length).toBe(1);
  });
});
