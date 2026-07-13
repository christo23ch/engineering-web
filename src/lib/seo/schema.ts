/**
 * Structured-data (JSON-LD, schema.org) builders — Bible RF-11 ("datos
 * estructurados"), DESIGN_SYSTEM §11.4 (BreadcrumbList) / §11.5 (FAQPage).
 *
 * Pure functions only: every builder serializes data the CALLER already has
 * and already renders visibly (the same SSOT strings used in the page's
 * breadcrumb nav / FAQ accordion) — nothing here invents content. Organization
 * uses only the wordmark already used site-wide in Header/Footer; no logo or
 * sameAs (social profiles) are emitted since no real assets/URLs exist yet
 * (H10/H11 pending) — inventing them would be fabricated content.
 */

export interface BreadcrumbItem {
  name: string;
  /**
   * Site-relative path, e.g. "/servicios/ingenieria-industrial". Omit for a
   * non-clickable crumb (no index route exists for it, e.g. "Servicios") —
   * matching the visible breadcrumb (plain text, not a link) rather than
   * inventing a URL for a page that doesn't exist.
   */
  href?: string;
}

export interface Faq {
  q: string;
  a: string;
}

export function organizationSchema(siteUrl: string | URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ingeniería que rinde',
    url: String(siteUrl),
  };
}

interface BreadcrumbListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export function breadcrumbSchema(
  siteUrl: string | URL,
  items: BreadcrumbItem[],
) {
  const itemListElement: BreadcrumbListItem[] = items.map((entry, index) => {
    const listItem: BreadcrumbListItem = {
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
    };
    if (entry.href) listItem.item = new URL(entry.href, siteUrl).toString();
    return listItem;
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

export function faqSchema(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}
