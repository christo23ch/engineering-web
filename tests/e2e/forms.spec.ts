import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Zero-JS form flow end-to-end in a real browser (RF-06/07, RF-13, RF-14).
//
// The preview environment deliberately has NO §38 secrets, so a genuine
// submission travels the honest "service unavailable" path: native POST →
// BFF 303 → browser follows → the matching banner is revealed by CSS :target.
// That is the real round-trip, no mocking. The other outcomes (success,
// 400, 429) are driven by fulfilling the endpoint at the network layer,
// which is the only way to exercise them without vendor credentials.

const validContact = {
  nombre: 'Nombre Apellido',
  email: 'lead@example.com',
  empresa: 'ACME Ingeniería',
  mensaje: 'Necesitamos una auditoría energética para dos plantas.',
};

async function fillContactForm(page: Page) {
  await page.fill('input[name="nombre"]', validContact.nombre);
  await page.fill('input[name="email"]', validContact.email);
  await page.fill('input[name="empresa"]', validContact.empresa);
  await page.fill('textarea[name="mensaje"]', validContact.mensaje);
  await page.check('input[name="consentimiento"]');
}

test('the contact form posts natively — no JavaScript involved', async ({
  page,
}) => {
  await page.goto('/contacto');
  const form = page.locator('form[action="/api/leads"]');
  await expect(form).toHaveAttribute('method', 'post');
  // The schema discriminator and the honeypot ride along, hidden from users.
  await expect(page.locator('input[name="tipo"]')).toHaveValue('contacto');
  await expect(page.locator('input[name="website"]')).toBeHidden();
});

test('a real submission without a configured database shows the honest banner', async ({
  page,
}) => {
  await page.goto('/contacto');
  await fillContactForm(page);
  await page.click('button[type="submit"], input[type="submit"]');

  // POST → 303 → GET: the browser lands back on the form with the fragment.
  await page.waitForURL('**/contacto#error-no-disponible');
  const banner = page.locator('#error-no-disponible');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('no está disponible');
  // Only the addressed banner is revealed.
  await expect(page.locator('#error-validacion')).toBeHidden();
  await expect(page.locator('#error-limite')).toBeHidden();
});

test('native constraint validation blocks an empty submission (no round-trip)', async ({
  page,
}) => {
  await page.goto('/contacto');
  await page.click('button[type="submit"], input[type="submit"]');
  // The browser refuses to navigate; we are still on the form, no banner.
  await expect(page).toHaveURL(/\/contacto\/?$/);
  await expect(page.locator('#error-validacion')).toBeHidden();
});

test('a rejected submission (400) returns to the form with the validation banner', async ({
  page,
}) => {
  await page.route('**/api/leads', (route) =>
    route.fulfill({
      status: 303,
      headers: { location: '/contacto#error-validacion' },
      body: '',
    }),
  );
  await page.goto('/contacto');
  await fillContactForm(page);
  await page.click('button[type="submit"], input[type="submit"]');

  await page.waitForURL('**/contacto#error-validacion');
  await expect(page.locator('#error-validacion')).toBeVisible();
  await expect(page.locator('#error-no-disponible')).toBeHidden();
});

test('a throttled submission (429) shows the rate-limit banner', async ({
  page,
}) => {
  await page.route('**/api/leads', (route) =>
    route.fulfill({
      status: 303,
      headers: { location: '/contacto#error-limite' },
      body: '',
    }),
  );
  await page.goto('/contacto');
  await fillContactForm(page);
  await page.click('button[type="submit"], input[type="submit"]');

  await page.waitForURL('**/contacto#error-limite');
  await expect(page.locator('#error-limite')).toBeVisible();
  await expect(page.locator('#error-limite')).toContainText('Espera unos');
});

test('an accepted submission lands on the §13.8 success screen', async ({
  page,
}) => {
  await page.route('**/api/leads', (route) =>
    route.fulfill({
      status: 303,
      headers: { location: '/contacto/gracias' },
      body: '',
    }),
  );
  await page.goto('/contacto');
  await fillContactForm(page);
  await page.click('button[type="submit"], input[type="submit"]');

  await page.waitForURL('**/contacto/gracias');
  await expect(
    page.getByRole('heading', { name: 'Solicitud recibida' }),
  ).toBeVisible();
});

test('the lead magnet posts the magnet schema fields with real attribution', async ({
  page,
}) => {
  await page.goto('/recursos');
  const form = page.locator('form[action="/api/leads"]');
  await expect(form).toHaveAttribute('method', 'post');
  await expect(page.locator('input[name="tipo"]')).toHaveValue('lead_magnet');
  await expect(page.locator('input[name="recurso"]')).toHaveValue(
    'suscripcion-general',
  );
});

test('the candidature form submits for real and degrades honestly', async ({
  page,
}) => {
  await page.goto('/empleo');
  const form = page.locator('form[action="/api/candidatures"]');
  await expect(form).toHaveAttribute('method', 'post');
  // No CV upload is offered while storage/AV policy is deferred (§17).
  await expect(page.locator('input[type="file"]')).toHaveCount(0);

  await page.fill('input[name="nombre"]', 'Nombre Apellido');
  await page.fill('input[name="email"]', 'candidato@example.com');
  await page.check('input[name="consentimiento"]');
  await page.click('button[type="submit"], input[type="submit"]');

  await page.waitForURL('**/empleo#error-no-disponible');
  await expect(page.locator('#error-no-disponible')).toBeVisible();
});

test('a revealed error banner is accessible (axe, WCAG 2.2 AA)', async ({
  page,
}) => {
  await page.goto('/contacto#error-validacion');
  await expect(page.locator('#error-validacion')).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('the wired forms add no JavaScript to the pages', async ({ page }) => {
  for (const path of ['/contacto', '/empleo', '/recursos']) {
    const response = await page.goto(path);
    const html = (await response?.text()) ?? '';
    const scripts = html.match(/<script[^>]*>/g) ?? [];
    // Only the JSON-LD data block is allowed (RF-11).
    expect(
      scripts.filter((tag) => !tag.includes('application/ld+json')),
    ).toEqual([]);
  }
});
