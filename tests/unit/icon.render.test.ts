import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Icon from '@/components/ui/Icon.astro';

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(Icon, { props });
}

function attr(html: string, name: string): string | null {
  const m = html.match(new RegExp(`<svg\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1]! : null;
}

describe('Icon.astro (DESIGN_SYSTEM §7 contract)', () => {
  it('renders a 24×24 grid, 1.75 stroke, currentColor svg', async () => {
    const html = await render({ name: 'chevron-down' });
    expect(attr(html, 'viewBox')).toBe('0 0 24 24');
    expect(attr(html, 'stroke-width')).toBe('1.75');
    expect(attr(html, 'stroke')).toBe('currentColor');
    expect(html).toContain('<path'); // chevron geometry rendered
  });

  it('is decorative by default (aria-hidden, no role)', async () => {
    const html = await render({ name: 'x' });
    expect(attr(html, 'aria-hidden')).toBe('true');
    expect(html).not.toContain('role="img"');
  });

  it('becomes meaningful with a label (role=img + aria-label, not hidden)', async () => {
    const html = await render({ name: 'x', label: 'Cerrar' });
    expect(attr(html, 'role')).toBe('img');
    expect(attr(html, 'aria-label')).toBe('Cerrar');
    expect(html).not.toContain('aria-hidden');
  });

  it('maps allowed sizes to the 4px scale', async () => {
    expect(await render({ name: 'x', size: 16 })).toContain('size-4');
    expect(await render({ name: 'x', size: 20 })).toContain('size-5');
    expect(await render({ name: 'x', size: 24 })).toContain('size-6');
    expect(await render({ name: 'x', size: 32 })).toContain('size-8');
  });

  it('allows a stroke-width override (loaders)', async () => {
    expect(
      attr(await render({ name: 'spinner', strokeWidth: 3 }), 'stroke-width'),
    ).toBe('3');
  });
});
