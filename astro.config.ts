import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SSOT: docs/PROJECT_BIBLE.md §11–§12 (Jamstack, Astro SSG + rebuild-on-webhook),
// §20 (a11y), §18 (performance). ISR is a provider-dependent optimization (DA-3),
// not configured here — the base is static generation.
// Tailwind v4 (ADR-011): CSS-first via the Vite plugin; design tokens live in
// src/styles/globals.css (`@theme`).
export default defineConfig({
  // Host-agnostic base URL (hosting is DA-3, undecided). Override via SITE_URL.
  site: process.env.SITE_URL ?? 'https://example.com',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Emit clean, semantic URLs (docs/PROJECT_BIBLE.md §24).
    format: 'directory',
  },
  server: {
    port: 4321,
  },
});
