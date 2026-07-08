import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Checkbox from '@/components/ui/Checkbox.astro';

async function render(props: Record<string, unknown>, slot = 'Acepto') {
  const container = await AstroContainer.create();
  return container.renderToString(Checkbox, {
    props,
    slots: { default: slot },
  });
}

function attr(html: string, tag: string, name: string): string | null {
  const m = html.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1]! : null;
}

describe('Checkbox.astro', () => {
  it('renders a checkbox with the whole label clickable (input inside <label>)', async () => {
    const html = await render(
      { name: 'consent' },
      'Acepto la <a href="/legal/privacidad">política</a>',
    );
    expect(attr(html, 'input', 'type')).toBe('checkbox');
    expect(html).toMatch(
      /<label\b[^>]*>[\s\S]*<input\b[\s\S]*política[\s\S]*<\/label>/,
    );
    expect(html).toContain('href="/legal/privacidad"');
  });

  it('uses the blue-700 accent mark and 20px size', async () => {
    const html = await render({});
    expect(html).toContain('accent-action');
    expect(html).toContain('size-5');
  });

  it('is unchecked by default (GDPR consent must not be pre-checked)', async () => {
    const html = await render({ name: 'consent' });
    expect(html).not.toMatch(/<input\b[^>]*\bchecked\b/);
  });

  it('exposes error state and links it', async () => {
    const html = await render({ name: 'consent', error: 'Debes aceptar' });
    expect(attr(html, 'input', 'aria-invalid')).toBe('true');
    expect(attr(html, 'input', 'aria-describedby')).toContain(
      'field-consent-error',
    );
    expect(html).toContain('role="alert"');
  });

  it('supports required and disabled', async () => {
    expect(await render({ required: true })).toMatch(
      /<input\b[^>]*\brequired\b/,
    );
    expect(await render({ disabled: true })).toMatch(
      /<input\b[^>]*\bdisabled\b/,
    );
  });
});
