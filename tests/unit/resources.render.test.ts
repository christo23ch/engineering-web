import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Resources from '@/pages/recursos/index.astro';

// Structural render test for the Recursos listing (DESIGN_SYSTEM §13.6). With no
// article data yet, the screen must render a graceful empty state (never a blank
// page) and never fabricate editorial content.
async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Resources);
}

describe('Recursos listing (recursos/index.astro)', () => {
  it('renders the interior hero with breadcrumbs and a single h1', async () => {
    const html = await render();
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('aria-label="Migas de pan"');
    expect(html).toContain('Conocimiento técnico aplicado');
  });

  it('shows the specified empty state instead of fabricated articles', async () => {
    const html = await render();
    expect(html).toContain('Recursos en preparación');
  });

  it('closes with the lead-magnet capture as the single primary CTA (§13.6, P3)', async () => {
    const html = await render();
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
    // Lead magnet email-capture form (the view's single primary action).
    expect(main).toContain('name="email"');
    expect(main).toContain('name="consentimiento"');
    expect((main.match(/type="submit"/g) ?? []).length).toBe(1);
    // No generic dark CTA band on this view (contact lives in the footer).
    expect(main).not.toContain('data-surface="dark"');
  });
});
