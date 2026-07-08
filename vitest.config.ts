/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

// Unit + integration tests (docs/PROJECT_BIBLE.md §32). E2E runs via Playwright.
export default getViteConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/env.d.ts'],
    },
  },
});
