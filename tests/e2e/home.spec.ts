import { test, expect } from '@playwright/test';

// Smoke E2E — confirms the built site serves and renders (infrastructure).
// Real critical-path journeys (request proposal, download resource) land in F1
// (docs/PROJECT_BIBLE.md §32).
test('home scaffold renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
