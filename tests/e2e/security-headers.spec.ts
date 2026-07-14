import { test, expect } from '@playwright/test';

// Security headers / CSP (docs/PROJECT_BIBLE.md §17). The deployable artifact
// must ship a Content-Security-Policy and defence-in-depth headers. Astro emits
// the CSP as a per-page <meta http-equiv="content-security-policy"> (auto-hashed
// script/style sources, no 'unsafe-inline'); the HTTP-only headers (HSTS,
// X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) are set by the
// host (vercel.json) and are asserted by the contract test in
// tests/unit/security-headers.test.ts, not here — `astro preview` does not
// replay them. Chromium enforces the meta CSP regardless of the serving host,
// so these specs prove the policy is real and does not break the page.

test('home ships an enforced CSP meta with hashed scripts and no unsafe-inline', async ({
  page,
}) => {
  await page.goto('/');
  const meta = page.locator('meta[http-equiv="content-security-policy" i]');
  await expect(meta).toHaveCount(1);
  const content = (await meta.getAttribute('content')) ?? '';
  // Core policy: locked-down defaults, no inline execution escape hatch.
  expect(content).toContain("default-src 'self'");
  expect(content).toContain("object-src 'none'");
  expect(content).toContain("base-uri 'self'");
  expect(content).toContain("form-action 'self'");
  expect(content).not.toContain("'unsafe-inline'");
  expect(content).not.toContain("'unsafe-eval'");
  // Astro derives script-src / style-src from the page's own assets.
  expect(content).toMatch(/script-src[^;]*'self'/);
  expect(content).toMatch(/style-src[^;]*'self'/);
});

test('CSP does not break rendering: JSON-LD present and styles applied', async ({
  page,
}) => {
  const violations: string[] = [];
  // A CSP that blocked a real resource would surface as a console error.
  page.on('console', (msg) => {
    if (msg.type() === 'error' && /content security policy/i.test(msg.text())) {
      violations.push(msg.text());
    }
  });

  await page.goto('/');

  // JSON-LD is a CSP-exempt data block; it must still be readable.
  const ldJson = page.locator('script[type="application/ld+json"]');
  await expect(ldJson).toHaveCount(1);
  const payload = JSON.parse((await ldJson.textContent()) ?? '{}');
  expect(payload['@type']).toBe('Organization');

  // Tailwind's bundled stylesheet must load under the CSP (style-src 'self').
  const bodyBg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(bodyBg).not.toBe('');
  expect(bodyBg).not.toBe('rgba(0, 0, 0, 0)');

  expect(violations).toEqual([]);
});

test('a content-heavy service page also carries the CSP meta', async ({
  page,
}) => {
  await page.goto('/servicios/ingenieria-industrial');
  const meta = page.locator('meta[http-equiv="content-security-policy" i]');
  await expect(meta).toHaveCount(1);
  const content = (await meta.getAttribute('content')) ?? '';
  expect(content).toContain("default-src 'self'");
  expect(content).not.toContain("'unsafe-inline'");
});
