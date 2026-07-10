/**
 * Legal pages (Bible RF-08, §42). Slugs are fixed; the binding legal text is
 * authored by legal counsel and is NEVER fabricated here — the template ships a
 * "pending legal review" notice until the real content lands via the CMS. The
 * `updated` date reflects when the page was last published.
 */
export interface LegalPage {
  slug: string;
  title: string;
  /** ISO date shown as the visible last-updated stamp (§13.9). */
  updated: string;
}

export const legalPages: LegalPage[] = [
  { slug: 'aviso-legal', title: 'Aviso legal', updated: '2026-07-10' },
  {
    slug: 'privacidad',
    title: 'Política de privacidad',
    updated: '2026-07-10',
  },
  { slug: 'cookies', title: 'Política de cookies', updated: '2026-07-10' },
];

export function getLegalPage(slug: string): LegalPage | undefined {
  return legalPages.find((page) => page.slug === slug);
}
