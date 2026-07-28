import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Jobs from '@/pages/empleo.astro';

// Structural render test for Empleo (DESIGN_SYSTEM §13.7). With no open
// positions, the screen must render the specified no-offers state (spontaneous
// application) and never fabricate job offers.
async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Jobs);
}

describe('Empleo (empleo.astro)', () => {
  it('renders the hero with breadcrumbs and a single h1', async () => {
    const html = await render();
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('aria-label="Migas de pan"');
    expect(html).toContain('Trabaja en ingeniería que rinde');
  });

  it('shows the no-offers state (spontaneous application)', async () => {
    const html = await render();
    expect(html).toContain('No hay ofertas abiertas ahora mismo');
    expect(html).toContain('candidatura espontánea');
  });

  it('closes with the candidature form as the single primary CTA (P3, RF-14)', async () => {
    const html = await render();
    // The form itself is now the primary action (it replaced the band that
    // routed to /contacto), so there is exactly one submit control.
    expect(html).toContain('action="/api/candidatures"');
    expect(html).toContain('method="post"');
    expect((html.match(/type="submit"/g) ?? []).length).toBe(1);
  });

  it('posts only the fields the server schema validates (RF-14)', async () => {
    const html = await render();
    for (const field of ['nombre', 'email', 'telefono', 'mensaje']) {
      expect(html).toContain(`name="${field}"`);
    }
    // Recruitment consent is its own GDPR purpose (Bible §21) and the
    // honeypot travels with every capture form (§17).
    expect(html).toContain('name="consentimiento"');
    expect(html).toContain('name="website"');
    // CV upload stays deferred — no file input is fabricated.
    expect(html).not.toContain('type="file"');
  });

  it('renders the zero-JS outcome banners without executable script', async () => {
    const html = await render();
    for (const id of [
      'error-validacion',
      'error-limite',
      'error-no-disponible',
      'error-inesperado',
    ]) {
      expect(html).toContain(`id="${id}"`);
    }
    // Only the JSON-LD data block (RF-11) is allowed.
    const scripts = html.match(/<script[^>]*>/g) ?? [];
    expect(
      scripts.filter((tag) => !tag.includes('application/ld+json')),
    ).toEqual([]);
  });
});
