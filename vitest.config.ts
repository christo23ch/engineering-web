/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { getViteConfig } from 'astro/config';

// Unit + integration tests (docs/PROJECT_BIBLE.md §32). E2E runs via Playwright.
// Uses Astro's getViteConfig so `.astro` components can be rendered in tests
// (Astro Container API). Astro 7's Rolldown-forked Vite types don't expose
// Vitest's `test` key, so the config object is asserted to the expected param
// type — a narrow, documented cast; the `test` block itself is authored against
// Vitest's own types via the reference above.
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const config = {
  resolve: {
    alias: {
      '@': r('./src'),
      '@components': r('./src/components'),
      '@layouts': r('./src/layouts'),
      '@lib': r('./src/lib'),
    },
  },
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
};

export default getViteConfig(config as Parameters<typeof getViteConfig>[0]);
