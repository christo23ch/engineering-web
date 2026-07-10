import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Service from '@/pages/servicios/[slug].astro';
import { services, getService } from '@/lib/content/services';

// Structural render test for the service page template (DESIGN_SYSTEM §13.2).
// Renders one service and asserts the §6.2 template skeleton + a11y anchors.
async function render(slug: string) {
  const service = getService(slug);
  const container = await AstroContainer.create();
  return container.renderToString(Service, { props: { service } });
}

describe('Service page ([slug].astro)', () => {
  it('taxonomy exposes the six Bible §24 service lines', () => {
    expect(services).toHaveLength(6);
    expect(getService('eficiencia-energetica')?.name).toBe(
      'Eficiencia energética',
    );
    expect(getService('does-not-exist')).toBeUndefined();
  });

  it('renders breadcrumbs, a single h1 and the §6.2 sections', async () => {
    const html = await render('ingenieria-industrial');
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('Ingeniería industrial');
    expect(html).toContain('aria-label="Migas de pan"');
    expect(html).toContain('aria-current="page"');
    // Template sections present.
    for (const heading of [
      'Nuestro enfoque',
      'Metodología',
      'Entregables',
      'Preguntas frecuentes',
    ]) {
      expect(html).toContain(heading);
    }
  });

  it('renders the FAQ as native zero-JS <details> disclosures', async () => {
    const html = await render('consultoria-tecnica');
    // Scope to <main>: the global IA assistant widget is also a <details>.
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
    expect((main.match(/<\/details>/g) ?? []).length).toBe(3);
    expect(html).not.toContain('<script'); // no client JS on the page
  });

  it('closes with a service-specific dark CTA band (inverted button)', async () => {
    const html = await render('energias-renovables');
    expect(html).toContain('data-surface="dark"');
    expect(html).toContain('bg-white'); // inverted variant
    expect(html).toContain('energías renovables'); // service-specific text
  });
});
