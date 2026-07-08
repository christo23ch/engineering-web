import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Card from '@/components/ui/Card.astro';

async function render(props: Record<string, unknown>, slot = 'Contenido') {
  const container = await AstroContainer.create();
  return container.renderToString(Card, { props, slots: { default: slot } });
}

describe('Card.astro', () => {
  it('renders a plain container by default', async () => {
    const html = await render({});
    expect(html).toMatch(/<div[^>]*>[\s\S]*Contenido[\s\S]*<\/div>/);
    expect(html).not.toContain('hover:shadow-md');
  });

  it('renders a single whole-card link when href is set, interactive by default', async () => {
    const html = await render({ href: '/servicios/mep' });
    expect(html).toMatch(/<a[^>]*href="\/servicios\/mep"/);
    expect(html).toContain('hover:border-blue-600');
  });

  it('can force interactive off on a link', async () => {
    const html = await render({ href: '/x', interactive: false });
    expect(html).not.toContain('hover:shadow-md');
  });
});
