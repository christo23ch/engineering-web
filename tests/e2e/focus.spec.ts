import { test, expect } from '@playwright/test';

// Focus-ring strategy (docs/DESIGN_SYSTEM.md §10, WCAG 1.4.11 / 2.4.11).
// Verifies the two-layer ring against the compiled globals.css cascade:
//  - light surface: blue-700 outline + white halo (identical to a plain ring);
//  - dark surface (data-surface="dark"): white outline + blue-900 halo, so the
//    indicator stays ≥3:1 on blue-900 even under an inverted (white) control.
// No product page is created — the built `/` scaffold (which loads globals.css)
// is used as a host and its body is swapped for the two focus scenarios.

const BLUE_700 = 'rgb(29, 78, 216)'; // --color-blue-700 #1d4ed8
const BLUE_900 = 'rgb(30, 58, 138)'; // --color-blue-900 #1e3a8a
const WHITE = 'rgb(255, 255, 255)';

test('focus ring is two-layer on light and remaps on dark surfaces', async ({
  page,
}) => {
  await page.goto('/');

  // Two focusable controls: one on the default (light) surface, one inside a
  // blue-900 container that opts into the dark focus tokens.
  await page.evaluate(() => {
    document.body.innerHTML = `
      <button id="light" type="button">Light</button>
      <div data-surface="dark" style="background:#1e3a8a;padding:24px">
        <button id="dark" type="button" style="background:#fff;color:#1e40af">Inverted CTA</button>
      </div>`;
  });

  const ringOf = (id: string) =>
    page.locator(`#${id}`).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { outlineColor: cs.outlineColor, boxShadow: cs.boxShadow };
    });

  // Keyboard focus guarantees :focus-visible applies (unlike programmatic focus).
  await page.keyboard.press('Tab');
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id))
    .toBe('light');
  const light = await ringOf('light');
  expect(light.outlineColor).toBe(BLUE_700);
  expect(light.boxShadow).toContain(WHITE);

  await page.keyboard.press('Tab');
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id))
    .toBe('dark');
  const dark = await ringOf('dark');
  expect(dark.outlineColor).toBe(WHITE);
  expect(dark.boxShadow).toContain(BLUE_900);
});
