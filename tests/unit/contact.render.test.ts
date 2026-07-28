import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Contact from '@/pages/contacto.astro';

// Structural render test for Contacto (DESIGN_SYSTEM §13.8). The proposal form
// is built from the approved §11.3 primitives and posts natively to the BFF
// (RF-06/07, ADR-008), so this locks both the form UI and its wiring.
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

  it('posts natively to the leads endpoint with the contact discriminator', async () => {
    const html = await render();
    expect(html).toContain('method="post"');
    expect(html).toContain('action="/api/leads"');
    // `tipo` selects the contact schema server-side (vs lead_magnet).
    expect(html).toContain('name="tipo" value="contacto"');
    // Honeypot travels with every capture form (§17 anti-abuse).
    expect(html).toContain('name="website"');
  });

  it('renders the zero-JS outcome banners and ships no executable script', async () => {
    const html = await render();
    for (const id of [
      'error-validacion',
      'error-limite',
      'error-no-disponible',
      'error-inesperado',
    ]) {
      expect(html).toContain(`id="${id}"`);
    }
    // The only <script> a page may carry is the JSON-LD data block (RF-11),
    // which the CSP treats as data, never as code.
    const scripts = html.match(/<script[^>]*>/g) ?? [];
    expect(
      scripts.filter((tag) => !tag.includes('application/ld+json')),
    ).toEqual([]);
  });
});
