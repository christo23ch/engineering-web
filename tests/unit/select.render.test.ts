import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Select from '@/components/ui/Select.astro';

async function render(props: Record<string, unknown>, slot = '') {
  const container = await AstroContainer.create();
  return container.renderToString(Select, { props, slots: { default: slot } });
}

function attr(html: string, tag: string, name: string): string | null {
  const m = html.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1]! : null;
}

describe('Select.astro', () => {
  it('renders a native <select> bound to a visible label, with slotted options', async () => {
    const html = await render(
      { label: 'Servicio', name: 'service' },
      '<option value="mep">MEP</option>',
    );
    expect(attr(html, 'label', 'for')).toBe('field-service');
    expect(attr(html, 'select', 'id')).toBe('field-service');
    expect(html).toContain('<option value="mep">MEP</option>');
  });

  it('restyles appearance and shows a decorative chevron', async () => {
    const html = await render({ label: 'S' });
    expect(html).toContain('appearance-none');
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
  });

  it('exposes the error state', async () => {
    const html = await render({
      label: 'S',
      name: 'service',
      error: 'Elige una opción',
    });
    expect(attr(html, 'select', 'aria-invalid')).toBe('true');
    expect(attr(html, 'select', 'aria-describedby')).toContain(
      'field-service-error',
    );
    expect(html).toContain('role="alert"');
  });

  it('supports required and disabled', async () => {
    expect(await render({ label: 'S', required: true })).toMatch(
      /<select\b[^>]*\brequired\b/,
    );
    expect(await render({ label: 'S', disabled: true })).toMatch(
      /<select\b[^>]*\bdisabled\b/,
    );
  });
});
