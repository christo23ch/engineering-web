import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Modal from '@/components/ui/Modal.astro';

async function render(
  props: Record<string, unknown>,
  slot = 'Cuerpo del modal',
) {
  const container = await AstroContainer.create();
  return container.renderToString(Modal, { props, slots: { default: slot } });
}

function attr(html: string, tag: string, name: string): string | null {
  const m = html.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1]! : null;
}

describe('Modal.astro', () => {
  it('renders a native <dialog> labelled by its title', async () => {
    const html = await render({ id: 'demo', title: 'Solicita una demo' });
    expect(attr(html, 'dialog', 'id')).toBe('demo');
    expect(attr(html, 'dialog', 'aria-labelledby')).toBe('demo-title');
    expect(html).toMatch(
      /<h2\b[^>]*\bid="demo-title"[^>]*>[\s\S]*Solicita una demo/,
    );
  });

  it('renders slot body and DS box styling (radius-lg, shadow-lg, surface)', async () => {
    const html = await render({ id: 'm', title: 'T' });
    expect(html).toContain('Cuerpo del modal');
    expect(html).toContain('rounded-lg');
    expect(html).toContain('shadow-lg');
    expect(html).toContain('bg-surface');
  });

  it('has an accessible close control (data-modal-close + aria-label)', async () => {
    const html = await render({ id: 'm', title: 'T' });
    expect(html).toMatch(/<button\b[^>]*\bdata-modal-close\b/);
    expect(html).toContain('aria-label="Cerrar"');
  });

  it('does NOT render its own trigger (the consumer owns it)', async () => {
    const html = await render({ id: 'm', title: 'T' });
    expect(html).not.toContain('data-modal-open');
  });
});
