import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '@/components/layout/Footer.astro';

// Footer chrome (DESIGN_SYSTEM §11.4). Dark surface with the site map + legal
// links; no fabricated certifications/social links.
async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Footer);
}

describe('Footer (layout/Footer.astro)', () => {
  it('is a dark-surface landmark with the site map and legal links', async () => {
    const html = await render();
    expect(html).toContain('<footer');
    expect(html).toContain('data-surface="dark"');
    // Site map: the six services + main routes.
    expect(html).toContain('/servicios/ingenieria-industrial');
    expect(html).toContain('/contacto');
    // Legal links.
    expect(html).toContain('/legal/privacidad');
  });

  it('does not fabricate certifications or social links', async () => {
    const html = await render();
    expect(html).not.toMatch(/ISO\s?\d{4,5}/);
  });
});
