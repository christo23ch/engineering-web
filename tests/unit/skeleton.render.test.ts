import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Skeleton from '@/components/ui/Skeleton.astro';

async function render(props: Record<string, unknown> = {}) {
  const container = await AstroContainer.create();
  return container.renderToString(Skeleton, { props });
}

describe('Skeleton.astro', () => {
  it('renders a decorative pulsing block (aria-hidden, gray-100)', async () => {
    const html = await render();
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('animate-pulse');
    expect(html).toContain('bg-gray-100');
  });

  it('applies the requested variant and consumer sizing', async () => {
    expect(await render({ variant: 'text', class: 'w-40' })).toContain(
      'rounded-sm',
    );
    expect(await render({ variant: 'circle', class: 'size-10' })).toContain(
      'rounded-full',
    );
    expect(await render({ variant: 'circle', class: 'size-10' })).toContain(
      'size-10',
    );
  });

  it('has no interactive/labelled semantics (purely presentational)', async () => {
    const html = await render();
    expect(html).not.toContain('role=');
    expect(html).not.toContain('aria-label');
  });
});
