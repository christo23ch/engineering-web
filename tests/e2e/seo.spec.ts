import { test, expect } from '@playwright/test';

// SEO layer hardening (Hardening 4, RF-11): robots.txt, sitemap exclusions and
// structured data render correctly in the built, served site.

test('robots.txt is served with an absolute Sitemap line', async ({ page }) => {
  const response = await page.goto('/robots.txt');
  expect(response?.status()).toBe(200);
  const body = await response?.text();
  expect(body).toContain('User-agent: *');
  expect(body).toMatch(/Sitemap: https?:\/\/.+\/sitemap-index\.xml/);
});

test('sitemap excludes the search and thank-you screens', async ({ page }) => {
  const response = await page.goto('/sitemap-index.xml');
  expect(response?.status()).toBe(200);
  const indexBody = await response?.text();
  const sitemapUrl = indexBody?.match(/<loc>([^<]+)<\/loc>/)?.[1];
  expect(sitemapUrl).toBeTruthy();
  // Resolve only the pathname against the local baseURL — the <loc> host is
  // the configured `site` (SITE_URL), which is not reachable from the sandbox.
  const sitemapPath = new URL(sitemapUrl!).pathname;
  const sitemapResponse = await page.goto(sitemapPath);
  const sitemapBody = (await sitemapResponse?.text()) ?? '';
  expect(sitemapBody).not.toContain('/buscar');
  expect(sitemapBody).not.toContain('/contacto/gracias');
  expect(sitemapBody).toContain('/servicios/ingenieria-industrial');
});

test('home exposes Organization JSON-LD and OG/Twitter meta', async ({
  page,
}) => {
  await page.goto('/');
  const ldJson = page.locator('script[type="application/ld+json"]');
  await expect(ldJson).toHaveCount(1);
  const payload = JSON.parse((await ldJson.textContent()) ?? '{}');
  expect(payload['@type']).toBe('Organization');
  expect(payload.name).toBe('Ingeniería que rinde');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    /.+/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary',
  );
});

test('service page exposes BreadcrumbList + FAQPage JSON-LD', async ({
  page,
}) => {
  await page.goto('/servicios/ingenieria-industrial');
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const types = blocks.map((b) => JSON.parse(b)['@type']);
  expect(types).toContain('Organization');
  expect(types).toContain('BreadcrumbList');
  expect(types).toContain('FAQPage');
});

test('search and thank-you screens are marked noindex', async ({ page }) => {
  await page.goto('/buscar');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,follow',
  );
  await page.goto('/contacto/gracias');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,follow',
  );
});
