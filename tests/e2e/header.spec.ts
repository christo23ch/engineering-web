import { test, expect } from '@playwright/test';

// Header hardening (DESIGN_SYSTEM §11.4): skip link, keyboard navigation, the
// native Servicios dropdown, the active-page indicator and the mobile menu.

test('skip link is reachable by keyboard and jumps to main content', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab'); // first tab stop = skip link
  const skip = page.getByRole('link', { name: 'Saltar al contenido' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible(); // becomes visible on focus
  await skip.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('desktop Servicios dropdown opens (zero-JS <details>) and lists services', async ({
  page,
}) => {
  await page.goto('/');
  const serviceLink = page.locator(
    '.header-dropdown a[href="/servicios/ingenieria-industrial"]',
  );
  await expect(serviceLink).toBeHidden(); // collapsed
  await page.locator('.header-dropdown > summary').click();
  await expect(serviceLink).toBeVisible(); // expanded
});

test('marks the active page in the header (aria-current)', async ({ page }) => {
  await page.goto('/proyectos');
  await expect(
    page.locator('header a[href="/proyectos"][aria-current="page"]').first(),
  ).toBeVisible();
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 375, height: 720 } });

  test('hamburger opens the full-screen menu with the CTA', async ({
    page,
  }) => {
    await page.goto('/');
    const menu = page.getByRole('navigation', { name: 'Principal (móvil)' });
    await expect(menu).toBeHidden();
    await page.locator('.header-mobile > summary').click();
    await expect(menu).toBeVisible();
    // The CTA sits at the foot of the panel (outside the nav landmark).
    await expect(
      page
        .locator('.header-mobile')
        .getByRole('link', { name: 'Solicitar propuesta' }),
    ).toBeVisible();
  });
});
