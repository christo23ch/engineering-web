import { test, expect } from '@playwright/test';

// Sticky-header offset (WCAG 2.4.11 "focus not obscured", DESIGN_SYSTEM §10/§276).
// The document must reserve scroll-padding-top so in-page anchor/focus scrolling
// (skip link → #main-content, article ToC) never lands a target under the sticky
// header (§11.4, 72px desktop). Regression guard for the compiled cascade.
test('html reserves scroll-padding-top for the sticky header', async ({
  page,
}) => {
  await page.goto('/');
  const paddingTop = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  // 5rem = 80px, clears the 72px header + buffer.
  expect(paddingTop).toBe('80px');
});
