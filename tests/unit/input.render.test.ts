import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Input from '@/components/ui/Input.astro';

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(Input, { props });
}

/** Extract an attribute value from the first matching tag. */
function attr(html: string, tag: string, name: string): string | null {
  const m = html.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1]! : null;
}

describe('Input.astro', () => {
  it('renders a visible label bound to the input (for === id)', async () => {
    const html = await render({ label: 'Correo', name: 'email' });
    expect(html).toContain('Correo');
    const forId = attr(html, 'label', 'for');
    const inputId = attr(html, 'input', 'id');
    expect(forId).toBe(inputId);
    expect(inputId).toBe('field-email'); // id derived from name
  });

  it('defaults type to text', async () => {
    const html = await render({ label: 'Nombre' });
    expect(attr(html, 'input', 'type')).toBe('text');
  });

  it('links help text via aria-describedby', async () => {
    const html = await render({
      label: 'Correo',
      name: 'email',
      help: 'Usa tu email de trabajo',
    });
    expect(html).toContain('Usa tu email de trabajo');
    expect(html).toContain('id="field-email-help"');
    expect(attr(html, 'input', 'aria-describedby')).toContain(
      'field-email-help',
    );
  });

  it('exposes the error state (aria-invalid, border, role=alert, describedby)', async () => {
    const html = await render({
      label: 'Correo',
      name: 'email',
      error: 'Email no válido',
    });
    expect(attr(html, 'input', 'aria-invalid')).toBe('true');
    expect(html).toContain('border-error');
    expect(html).toContain('role="alert"');
    expect(html).toContain('Email no válido');
    expect(attr(html, 'input', 'aria-describedby')).toContain(
      'field-email-error',
    );
  });

  it('marks required on the input and in the label', async () => {
    const html = await render({
      label: 'Nombre',
      name: 'name',
      required: true,
    });
    expect(html).toMatch(/<input\b[^>]*\brequired\b/);
    expect(html).toContain('(obligatorio)');
  });

  it('supports disabled', async () => {
    const html = await render({ label: 'Nombre', disabled: true });
    expect(html).toMatch(/<input\b[^>]*\bdisabled\b/);
  });
});
