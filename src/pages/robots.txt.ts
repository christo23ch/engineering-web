import type { APIRoute } from 'astro';

/**
 * robots.txt (Bible RF-11, MUST). A build-time Astro endpoint rather than a
 * static public/robots.txt file, so the Sitemap line always matches the
 * configured `site` (SITE_URL, host-agnostic per DA-3) instead of a hardcoded
 * host. Allows all crawling; excludes the same low-value routes kept out of
 * the sitemap (see astro.config.ts) via each page's own noindex meta.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site);
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl.toString()}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
