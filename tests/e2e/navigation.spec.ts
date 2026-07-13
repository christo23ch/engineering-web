import { test, expect } from '@playwright/test';

// Navigation hardening (Hardening 2): every built route resolves (no broken
// links / 404s) and declares a canonical URL. Header/breadcrumb click-through is
// exercised too.
const routes = [
  '/',
  '/proyectos',
  '/sobre-nosotros',
  '/recursos',
  '/empleo',
  '/contacto',
  '/contacto/gracias',
  '/buscar',
  '/legal/aviso-legal',
  '/legal/privacidad',
  '/legal/cookies',
  '/servicios/ingenieria-industrial',
  '/servicios/eficiencia-energetica',
  '/servicios/energias-renovables',
  '/servicios/instalaciones-mep',
  '/servicios/consultoria-tecnica',
  '/servicios/digitalizacion-bim',
];

for (const route of routes) {
  test(`route ${route} responds 200 and declares a canonical`, async ({
    page,
  }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute('href', /^https?:\/\/.+/);
  });
}

test('header navigation click-through resolves (no broken links)', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('header a[href="/proyectos"]').first().click();
  await expect(page).toHaveURL(/\/proyectos\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('breadcrumb links back to a valid ancestor route', async ({ page }) => {
  await page.goto('/servicios/ingenieria-industrial');
  const crumb = page.getByRole('navigation', { name: 'Migas de pan' });
  await crumb.getByRole('link', { name: 'Inicio' }).click();
  await expect(page).toHaveURL(/\/$/);
});
