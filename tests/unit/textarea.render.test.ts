import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Textarea from '@/components/ui/Textarea.astro';

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(Textarea, { props });
}

function attr(html: string, tag: string, name: string): string | null {
  const m = html.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1]! : null;
}

describe('Textarea.astro', () => {
  it('renders a <textarea> bound to a visible label', async () => {
    const html = await render({ label: 'Mensaje', name: 'message' });
    expect(html).toContain('Mensaje');
    expect(attr(html, 'label', 'for')).toBe('field-message');
    expect(attr(html, 'textarea', 'id')).toBe('field-message');
  });

  it('applies rows (default 5) and a min-height', async () => {
    expect(attr(await render({ label: 'M' }), 'textarea', 'rows')).toBe('5');
    expect(
      attr(await render({ label: 'M', rows: 8 }), 'textarea', 'rows'),
    ).toBe('8');
    expect(await render({ label: 'M' })).toContain('min-h-28');
  });

  it('exposes the error state', async () => {
    const html = await render({
      label: 'M',
      name: 'message',
      error: 'Requerido',
    });
    expect(attr(html, 'textarea', 'aria-invalid')).toBe('true');
    expect(attr(html, 'textarea', 'aria-describedby')).toContain(
      'field-message-error',
    );
    expect(html).toContain('role="alert"');
  });

  it('supports required and disabled', async () => {
    expect(await render({ label: 'M', required: true })).toMatch(
      /<textarea\b[^>]*\brequired\b/,
    );
    expect(await render({ label: 'M', disabled: true })).toMatch(
      /<textarea\b[^>]*\bdisabled\b/,
    );
  });
});
