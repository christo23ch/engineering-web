import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Accessibility gate (WCAG 2.2 AA — docs/PROJECT_BIBLE.md §20, blocking in CI).
// Scans built pages with axe-core. Extend `pages` as product routes are added.
const pages = [
  '/',
  '/servicios/ingenieria-industrial',
  '/proyectos',
  '/sobre-nosotros',
  '/recursos',
  '/empleo',
  '/contacto',
  '/legal/privacidad',
  '/500',
  '/esta-ruta-no-existe',
  '/buscar',
  '/contacto/gracias',
];

for (const path of pages) {
  test(`a11y: ${path} has no WCAG 2.x A/AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
