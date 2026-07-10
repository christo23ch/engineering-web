import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Legal from '@/pages/legal/[slug].astro';
import { legalPages, getLegalPage } from '@/lib/content/legal';

// Structural render test for the legal pages template (DESIGN_SYSTEM §13.9).
async function render(slug: string) {
  const page = getLegalPage(slug);
  const container = await AstroContainer.create();
  return container.renderToString(Legal, { props: { page } });
}

describe('Legal pages ([slug].astro)', () => {
  it('exposes the fixed legal slugs (RF-08), incl. privacy linked from Contacto', () => {
    expect(legalPages.map((p) => p.slug)).toContain('privacidad');
  });

  it('renders the title, a visible last-updated date and no commercial CTA', async () => {
    const html = await render('privacidad');
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect(html).toContain('Política de privacidad');
    expect(html).toContain('Última actualización');
    expect(html).toContain('<time');
    // §13.9: the single documented exception to P3 — no commercial CTA / dark
    // band. Scope to <main> (the shared Footer is a dark surface by design).
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
    expect(main).not.toContain('data-surface="dark"');
    expect(main).not.toContain('Solicitar propuesta');
  });

  it('does not fabricate binding legal text', async () => {
    const html = await render('aviso-legal');
    expect(html).toContain('pendiente de revisión');
  });
});
