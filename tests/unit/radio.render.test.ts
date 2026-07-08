import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Radio from '@/components/ui/Radio.astro';

async function render(props: Record<string, unknown>, slot = 'Opción') {
  const container = await AstroContainer.create();
  return container.renderToString(Radio, { props, slots: { default: slot } });
}

function attr(html: string, tag: string, name: string): string | null {
  const m = html.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1]! : null;
}

describe('Radio.astro', () => {
  it('renders a radio in a clickable label, id derived from name+value', async () => {
    const html = await render({ name: 'sector', value: 'industrial' });
    expect(attr(html, 'input', 'type')).toBe('radio');
    expect(attr(html, 'input', 'name')).toBe('sector');
    expect(attr(html, 'input', 'value')).toBe('industrial');
    expect(attr(html, 'input', 'id')).toBe('field-sector-industrial');
    expect(html).toMatch(/<label[\s\S]*<input[\s\S]*Opción[\s\S]*<\/label>/);
  });

  it('uses the blue-700 accent mark and 20px size', async () => {
    const html = await render({ name: 'g', value: 'a' });
    expect(html).toContain('accent-action');
    expect(html).toContain('size-5');
  });

  it('reflects checked, required and disabled', async () => {
    expect(await render({ name: 'g', value: 'a', checked: true })).toMatch(
      /<input\b[^>]*\bchecked\b/,
    );
    expect(await render({ name: 'g', value: 'a', required: true })).toMatch(
      /<input\b[^>]*\brequired\b/,
    );
    expect(await render({ name: 'g', value: 'a', disabled: true })).toMatch(
      /<input\b[^>]*\bdisabled\b/,
    );
  });

  it('shows and links the error message (aria-invalid stays on the radiogroup)', async () => {
    const html = await render({
      name: 'sector',
      value: 'mep',
      error: 'Elige uno',
    });
    // aria-invalid is NOT valid on role=radio → must not be on the input.
    expect(attr(html, 'input', 'aria-invalid')).toBeNull();
    expect(html).toContain('role="alert"');
    expect(attr(html, 'input', 'aria-describedby')).toContain(
      'field-sector-mep-error',
    );
  });
});
