import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// SSOT: docs/PROJECT_BIBLE.md §11–§12 (Jamstack, Astro SSG + rebuild-on-webhook),
// §20 (a11y), §18 (performance). ISR is a provider-dependent optimization (DA-3),
// not configured here — the base is static generation.
export default defineConfig({
  // Host-agnostic base URL (hosting is DA-3, undecided). Override via SITE_URL.
  site: process.env.SITE_URL ?? 'https://example.com',
  output: 'static',
  integrations: [
    react(),
    // Design tokens live in tailwind.config.ts; base styles are managed in
    // src/styles/globals.css, so we disable the integration's injected base.
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  build: {
    // Emit clean, semantic URLs (docs/PROJECT_BIBLE.md §24).
    format: 'directory',
  },
  server: {
    port: 4321,
  },
});
