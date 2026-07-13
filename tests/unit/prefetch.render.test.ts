import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Home from '@/pages/index.astro';
import Contact from '@/pages/contacto.astro';

// Performance hardening (Hardening 3): a static, zero-JS <link rel="prefetch">
// hint for the single primary CTA target (/contacto), present everywhere except
// on /contacto itself.
async function render(
  Component: Parameters<AstroContainer['renderToString']>[0],
) {
  const container = await AstroContainer.create();
  return container.renderToString(Component);
}

describe('Prefetch hint (BaseLayout)', () => {
  it('prefetches /contacto on other pages', async () => {
    const html = await render(Home);
    expect(html).toContain('<link rel="prefetch" href="/contacto">');
  });

  it('is not self-referential on /contacto', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Contact, {
      request: new Request('https://example.com/contacto'),
    });
    expect(html).not.toContain('rel="prefetch"');
  });

  it('is a plain <link> hint, not client-side JS', async () => {
    const html = await render(Home);
    expect(html).not.toContain('<script');
  });
});
