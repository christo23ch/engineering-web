import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Button from '@/components/ui/Button.astro';

// Renders the .astro component in isolation (no browser) and asserts semantics
// and ARIA state (DESIGN_SYSTEM §10, §11.1). Slots pass the label text.
async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(Button, {
    props,
    slots: { default: 'Solicitar propuesta' },
  });
}

describe('Button.astro', () => {
  it('renders a native <button type="button"> by default', async () => {
    const html = await render({});
    expect(html).toMatch(/<button[^>]*type="button"/);
    expect(html).toContain('Solicitar propuesta');
    expect(html).toContain('bg-action'); // primary default
  });

  it('renders an <a> when href is provided', async () => {
    const html = await render({ href: '/proyectos', variant: 'secondary' });
    expect(html).toMatch(/<a[^>]*href="\/proyectos"/);
    expect(html).toContain('border-action');
  });

  it('exposes disabled state (native disabled + aria-disabled)', async () => {
    const html = await render({ disabled: true });
    expect(html).toContain('disabled');
    expect(html).toContain('aria-disabled="true"');
  });

  it('a disabled link drops href and is removed from tab order', async () => {
    const html = await render({ href: '/x', disabled: true });
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('tabindex="-1"');
    expect(html).not.toMatch(/href="\/x"/);
  });

  it('loading state sets aria-busy and shows a spinner', async () => {
    const html = await render({ loading: true });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('animate-spin');
    expect(html).toContain('aria-hidden="true"'); // spinner is decorative
  });

  it('supports submit type for forms', async () => {
    const html = await render({ type: 'submit' });
    expect(html).toMatch(/type="submit"/);
  });
});
