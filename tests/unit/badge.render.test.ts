import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Badge from '@/components/ui/Badge.astro';

async function render(props: Record<string, unknown>, slot = 'Industrial') {
  const container = await AstroContainer.create();
  return container.renderToString(Badge, { props, slots: { default: slot } });
}

describe('Badge.astro', () => {
  it('renders a span with slotted content and default variant', async () => {
    const html = await render({});
    expect(html).toMatch(/<span[^>]*>[\s\S]*Industrial[\s\S]*<\/span>/);
    expect(html).toContain('bg-gray-100');
  });

  it('applies the requested variant', async () => {
    expect(await render({ variant: 'service' }, 'MEP')).toContain(
      'bg-blue-100',
    );
    expect(await render({ variant: 'success' }, '-32%')).toContain(
      'bg-green-50',
    );
  });
});
