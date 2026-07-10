import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Search from '@/pages/buscar.astro';
import Gracias from '@/pages/contacto/gracias.astro';

// Auxiliary screens (DESIGN_SYSTEM §13.10 / §13.8). Interface only — no logic.
async function render(
  Component: Parameters<AstroContainer['renderToString']>[0],
) {
  const container = await AstroContainer.create();
  return container.renderToString(Component);
}

describe('Auxiliary screens', () => {
  it('search renders an accessible role=search input, logic deferred (F2)', async () => {
    const html = await render(Search);
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('role="search"');
    expect(html).toContain('name="q"');
    expect(html).toContain('próximamente');
  });

  it('contact success renders a single h1 and a way back into the site', async () => {
    const html = await render(Gracias);
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('Solicitud recibida');
    expect(html).toContain('href="/proyectos"');
  });
});
