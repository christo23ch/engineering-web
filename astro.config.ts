import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SSOT: docs/PROJECT_BIBLE.md §11–§12 (Jamstack, Astro SSG + rebuild-on-webhook),
// §20 (a11y), §18 (performance). ISR is a provider-dependent optimization (DA-3),
// not configured here — the base is static generation.
// Tailwind v4 (ADR-011): CSS-first via the Vite plugin; design tokens live in
// src/styles/globals.css (`@theme`).
//
// BFF (Bible §13): output stays 'static' — every page is prerendered exactly
// as before; only src/pages/api/* opts out (prerender = false) to run
// on-demand. The Node adapter keeps the BFF host-agnostic and testable in
// CI/e2e; on Vercel (DA-3, ratified pending client) swap it for
// @astrojs/vercel — a one-line change, plus vercel.json's cron for the
// outbox worker (ADR-010).
export default defineConfig({
  // Host-agnostic base URL (hosting is DA-3, undecided). Override via SITE_URL.
  site: process.env.SITE_URL ?? 'https://example.com',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  // Content-Security-Policy (docs/PROJECT_BIBLE.md §17 security). Astro emits a
  // <meta http-equiv="content-security-policy"> per page and auto-derives the
  // `script-src`/`style-src` sources — hashing every bundled script/style it
  // controls — so no inline-execution escape hatch is needed (the site is
  // zero-JS by default;
  // the only bundled script, the Modal controller, is pure event delegation and
  // gets hashed). JSON-LD (<script type="application/ld+json">) is a CSP-exempt
  // data block. `frame-ancestors` is intentionally omitted here because it is
  // ignored in a meta CSP — clickjacking is covered by the X-Frame-Options
  // header (see vercel.json). HTTP-only headers (HSTS, nosniff, Referrer-Policy,
  // Permissions-Policy) also live in vercel.json since static HTML can't set
  // response headers from Astro.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        'upgrade-insecure-requests',
      ],
    },
  },
  integrations: [
    react(),
    sitemap({
      // Keep the sitemap aligned with each page's own noindex meta (RF-11):
      // exclude the search screen (no functional results yet, §13.10) and the
      // post-submit success screen (not a landing page, §13.8).
      filter: (page) => !/\/(buscar|contacto\/gracias)\/?$/.test(page),
    }),
  ],
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
