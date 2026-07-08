import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit + integration tests (docs/PROJECT_BIBLE.md §32). E2E runs via Playwright.
// Decoupled from Astro's getViteConfig (Astro 7 uses a Rolldown-forked Vite whose
// config type conflicts with Vitest's augmentation); path aliases are declared
// here directly to mirror tsconfig.json — no extra dependency needed.
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
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
});
