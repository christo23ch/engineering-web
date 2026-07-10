import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Contact from '@/pages/contacto.astro';

// Structural render test for Contacto (DESIGN_SYSTEM §13.8). Interface only: the
// proposal form is built from the approved §11.3 primitives; the BFF submit is
// deferred, so this locks the form UI (fields + consent + submit).
async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Contact);
}

describe('Contacto (contacto.astro)', () => {
  it('renders the hero with breadcrumbs and a single h1', async () => {
    const html = await render();
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('Solicita tu propuesta');
  });

  it('renders the proposal form with the required fields and consent', async () => {
    const html = await render();
    expect(html).toContain('<form');
    expect(html).toContain('name="nombre"');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="mensaje"');
    // Service select is populated from the shared §24 taxonomy.
    expect(html).toContain('name="servicio"');
    expect(html).toContain('ingenieria-industrial');
    // GDPR consent links to the privacy policy.
    expect(html).toContain('name="consentimiento"');
    expect(html).toContain('/legal/privacidad');
    // Submit control present.
    expect(html).toContain('type="submit"');
  });
});
