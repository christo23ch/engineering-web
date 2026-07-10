/**
 * Case-study content model (Bible §28 entity "Proyecto / caso de éxito").
 * Feeds the case-detail template (§13.4). The array is intentionally EMPTY: the
 * Bible differentiator is real, verifiable data (§1/§3), so cases are never
 * fabricated — they arrive through the CMS (DA-7). Until then getStaticPaths
 * yields zero pages, and the Portfolio (§13.3) shows its empty state.
 */
import type { IconName } from '@/lib/ui/icons';

export interface CaseMetric {
  /** Numeric-ish value shown large (e.g. "-32", "1,2", "6"). */
  value: string;
  /** Unit shown with the value (e.g. "%", "GWh/año", "meses"). */
  unit?: string;
  /** What the figure measures (e.g. "Ahorro energético"). */
  label: string;
}

export interface CaseImage {
  src: string;
  alt: string;
  /** Intrinsic size — reserved to keep CLS < 0.1 (§6). */
  width: number;
  height: number;
}

export interface CaseTestimonial {
  quote: string;
  author: string;
  role?: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  /** May be anonymised when the client is not publishable. */
  client?: string;
  sector: string;
  /** Applied service lines, referenced by their §24 slugs. */
  services: string[];
  /** One-line summary shown in the hero entradilla. */
  summary: string;
  icon: IconName;
  /** 3–4 headline figures — the data before the narrative (§13.4). */
  metrics: CaseMetric[];
  challenge: string;
  solution: string;
  results: string;
  gallery: CaseImage[];
  testimonial?: CaseTestimonial;
}

/** No fabricated cases — real content lands via the CMS (DA-7). */
export const cases: CaseStudy[] = [];

export function getCase(slug: string): CaseStudy | undefined {
  return cases.find((c) => c.slug === slug);
}

/** Related cases share the sector and exclude the current one (§13.4 item 6). */
export function relatedCases(current: CaseStudy, limit = 3): CaseStudy[] {
  return cases
    .filter((c) => c.slug !== current.slug && c.sector === current.sector)
    .slice(0, limit);
}
