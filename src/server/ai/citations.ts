/**
 * Citation engine (Bible §16: mandatory source citation + no hallucination).
 * The model's answer is not trusted to be well-behaved — this verifies it:
 *
 *  - Extracts every [n] marker the answer cites.
 *  - Any marker out of range is a HALLUCINATED citation → the answer is
 *    rejected (the caller degrades to the honest fallback rather than show a
 *    fabricated reference).
 *  - Builds the list of sources actually referenced, with the §24 public URL
 *    the UI links to (the "mandatory source citation in UI" requirement).
 *  - Classifies the outcome: `refused` (the fixed refusal sentence, no
 *    citations) vs `answered` (≥1 valid citation) vs `uncited` (makes claims
 *    but cites nothing — treated as a guardrail failure, not shown as-is).
 */
import type { PromptSource } from '@/server/ai/prompt';
import { REFUSAL_SENTENCE } from '@/server/ai/prompt';

export interface Citation {
  marker: number;
  sourceType: 'service' | 'caseStudy' | 'article';
  sourceSlug: string;
  sourceTitle: string;
  url: string;
}

export type CitationOutcome = 'answered' | 'refused' | 'invalid';

export interface CitationCheck {
  outcome: CitationOutcome;
  citations: Citation[];
  /** Populated when outcome is 'invalid' — why the answer was rejected. */
  reason?: string;
}

const ROUTE: Record<Citation['sourceType'], (slug: string) => string> = {
  service: (slug) => `/servicios/${slug}`,
  caseStudy: (slug) => `/proyectos/${slug}`,
  article: (slug) => `/recursos/${slug}`,
};

export function sourceUrl(
  sourceType: Citation['sourceType'],
  slug: string,
): string {
  return ROUTE[sourceType](slug);
}

/** Distinct [n] markers in the answer, in order of first appearance. */
export function extractMarkers(answer: string): number[] {
  const seen = new Set<number>();
  const ordered: number[] = [];
  const re = /\[(\d{1,3})\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(answer))) {
    const n = Number(match[1]);
    if (!seen.has(n)) {
      seen.add(n);
      ordered.push(n);
    }
  }
  return ordered;
}

function isRefusal(answer: string): boolean {
  const normalized = answer.trim().replace(/\s+/g, ' ');
  // Robust to trivial trailing punctuation/quotes around the fixed sentence.
  return normalized.includes(REFUSAL_SENTENCE.replace(/\s+/g, ' '));
}

export function checkCitations(
  answer: string,
  sources: PromptSource[],
): CitationCheck {
  const markers = extractMarkers(answer);

  if (markers.length === 0) {
    if (isRefusal(answer)) return { outcome: 'refused', citations: [] };
    // Claims with no citation violate the mandatory-citation rule.
    return {
      outcome: 'invalid',
      citations: [],
      reason: 'answer makes claims without any [n] citation',
    };
  }

  const byMarker = new Map(sources.map((s) => [s.marker, s]));
  const citations: Citation[] = [];
  for (const marker of markers) {
    const source = byMarker.get(marker);
    if (!source) {
      // Cited a source that was never provided → hallucinated reference.
      return {
        outcome: 'invalid',
        citations: [],
        reason: `hallucinated citation [${String(marker)}] (only ${String(
          sources.length,
        )} sources provided)`,
      };
    }
    citations.push({
      marker,
      sourceType: source.chunk.sourceType,
      sourceSlug: source.chunk.sourceSlug,
      sourceTitle: source.chunk.sourceTitle,
      url: sourceUrl(source.chunk.sourceType, source.chunk.sourceSlug),
    });
  }

  // De-duplicate to one citation per source (a source cited from several
  // chunks appears once in the UI list).
  const deduped = dedupeBySource(citations);
  return { outcome: 'answered', citations: deduped };
}

function dedupeBySource(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const citation of citations) {
    const key = `${citation.sourceType}:${citation.sourceSlug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(citation);
  }
  return out;
}
