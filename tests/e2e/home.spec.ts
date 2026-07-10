import { test, expect } from '@playwright/test';

// Home smoke E2E (DESIGN_SYSTEM §13.1, Bible RF-01/CU-01). Confirms the built
// page serves and the key conversion elements render. Deep journeys (submit
// proposal) land with the Contact screen + BFF.
test('home renders the value proposition and primary CTA', async ({ page }) => {
  await page.goto('/');

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  await expect(h1).toContainText('Ingeniería que rinde');

  // Primary CTA ("Solicitar propuesta") is present and points at /contacto.
  await expect(
    page.getByRole('link', { name: 'Solicitar propuesta' }).first(),
  ).toHaveAttribute('href', '/contacto');
});

test('home lists the six service lines (Bible §24)', async ({ page }) => {
  await page.goto('/');
  // Scope to <main> so the footer's site-map service links are not counted.
  const services = page.locator('main a[href^="/servicios/"]');
  await expect(services).toHaveCount(6);
});
