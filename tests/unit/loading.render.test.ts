import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Loading from '@/components/ui/Loading.astro';

async function render(props: Record<string, unknown> = {}, slot?: string) {
  const container = await AstroContainer.create();
  return container.renderToString(Loading, {
    props,
    slots: slot ? { default: slot } : {},
  });
}

function attr(html: string, tag: string, name: string): string | null {
  const m = html.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1]! : null;
}

describe('Loading.astro', () => {
  it('is an accessible live region (role=status, aria-busy) with a hidden label', async () => {
    const html = await render();
    expect(attr(html, 'div', 'role')).toBe('status');
    expect(attr(html, 'div', 'aria-busy')).toBe('true');
    expect(html).toMatch(/class="sr-only"[^>]*>Cargando…/);
  });

  it('supports a custom label', async () => {
    expect(await render({ label: 'Cargando proyectos…' })).toContain(
      'Cargando proyectos…',
    );
  });

  it('defaults to a Spinner when no visual is provided', async () => {
    const html = await render();
    expect(html).toContain('animate-spin');
  });

  it('composes the provided visuals (e.g. skeletons) instead of the default spinner', async () => {
    const html = await render({}, '<div class="skeleton-marker"></div>');
    expect(html).toContain('skeleton-marker');
    expect(html).not.toContain('animate-spin');
  });

  it('inline variant lays out horizontally', async () => {
    expect(await render({ variant: 'inline' })).toContain('inline-flex');
  });
});
