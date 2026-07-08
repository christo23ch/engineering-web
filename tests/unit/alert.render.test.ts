import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Alert from '@/components/ui/Alert.astro';

async function render(props: Record<string, unknown>, slot = 'Mensaje') {
  const container = await AstroContainer.create();
  return container.renderToString(Alert, { props, slots: { default: slot } });
}

function attr(html: string, tag: string, name: string): string | null {
  const m = html.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1]! : null;
}

describe('Alert.astro', () => {
  it('renders body with role=status for info by default and a decorative icon', async () => {
    const html = await render({});
    expect(attr(html, 'div', 'role')).toBe('status');
    expect(html).toContain('Mensaje');
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
  });

  it('uses role=alert for error and warning', async () => {
    expect(attr(await render({ variant: 'error' }), 'div', 'role')).toBe(
      'alert',
    );
    expect(attr(await render({ variant: 'warning' }), 'div', 'role')).toBe(
      'alert',
    );
  });

  it('renders an optional title', async () => {
    const html = await render({ variant: 'success', title: 'Enviado' });
    expect(html).toContain('Enviado');
    expect(html).toContain('bg-green-50');
  });

  it('allows overriding the role', async () => {
    expect(
      attr(await render({ variant: 'info', role: 'alert' }), 'div', 'role'),
    ).toBe('alert');
  });
});
