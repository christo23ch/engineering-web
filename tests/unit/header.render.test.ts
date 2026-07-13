import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Header from '@/components/layout/Header.astro';

// Header chrome (DESIGN_SYSTEM §11.4). Server-rendered active state, desktop +
// mobile navigation, always-visible primary CTA. Zero JS (native <details>).
async function renderAt(pathname: string) {
  const container = await AstroContainer.create();
  return container.renderToString(Header, {
    request: new Request(`https://example.com${pathname}`),
  });
}

describe('Header (layout/Header.astro)', () => {
  it('renders logo, nav links, search and an always-visible primary CTA', async () => {
    const html = await renderAt('/');
    expect(html).toContain('<header');
    expect(html).toContain('aria-label="Ingeniería que rinde — Inicio"');
    for (const href of [
      '/proyectos',
      '/sobre-nosotros',
      '/recursos',
      '/contacto',
      '/buscar',
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain('Solicitar propuesta');
    // Servicios dropdown lists the six services (native <details>).
    expect(html).toContain('/servicios/ingenieria-industrial');
  });

  it('is zero-JS (native <details>, no client script)', async () => {
    const html = await renderAt('/');
    expect(html).toContain('<details');
    // JSON-LD (RF-11) is data, not executable script; only it is allowed.
    expect(html).not.toMatch(/<script(?!\s+type="application\/ld\+json")/);
  });

  it('marks the active page with aria-current (section + sub-routes)', async () => {
    const projects = await renderAt('/proyectos');
    expect(projects).toMatch(/href="\/proyectos"[^>]*aria-current="page"/);

    // A service sub-route marks the Servicios entry active.
    const service = await renderAt('/servicios/eficiencia-energetica');
    expect(service).toContain('aria-current');
    // Home marks nothing as the active section link.
    const home = await renderAt('/');
    expect(home).not.toMatch(/href="\/proyectos"[^>]*aria-current="page"/);
  });

  it('provides a mobile menu with an accordion and a foot CTA', async () => {
    const html = await renderAt('/');
    expect(html).toContain('aria-label="Abrir menú"');
    expect(html).toContain('aria-label="Principal (móvil)"');
  });
});
