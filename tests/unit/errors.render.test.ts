import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import NotFound from '@/pages/404.astro';
import ServerError from '@/pages/500.astro';

// System error pages (DESIGN_SYSTEM §13.10 / §11.6). Each must have a single h1
// and a single primary way back home. No functionality.
async function render(
  Component: Parameters<AstroContainer['renderToString']>[0],
) {
  const container = await AstroContainer.create();
  return container.renderToString(Component);
}

describe('System error pages', () => {
  it('404 renders a single h1 and a single "Volver al inicio" CTA', async () => {
    const html = await render(NotFound);
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('Página no encontrada');
    expect((html.match(/Volver al inicio/g) ?? []).length).toBe(1);
    expect(html).toContain('href="/"');
  });

  it('500 renders a single h1 and a single "Volver al inicio" CTA', async () => {
    const html = await render(ServerError);
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('Algo ha ido mal');
    expect((html.match(/Volver al inicio/g) ?? []).length).toBe(1);
  });
});
