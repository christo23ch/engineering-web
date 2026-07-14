/**
 * Preview resolution (Studio runtime): "Open preview" on a document jumps to
 * its public route (§24 mapping). SANITY_STUDIO_PREVIEW_URL points at the
 * deployment to preview against (staging once DA-3 lands).
 *
 * DRAFT preview (unpublished content rendered by the real templates) is an
 * F2 iteration: it needs the templates wired to a drafts-perspective request
 * on a protected preview deployment — mechanism documented in docs/CMS.md.
 * The BFF client already supports `perspective: 'drafts'`.
 */
import type { ResolveProductionUrlContext } from 'sanity';

const ROUTES: Record<string, (slug: string) => string> = {
  service: (slug) => `/servicios/${slug}`,
  caseStudy: (slug) => `/proyectos/${slug}`,
  article: (slug) => `/recursos/${slug}`,
};

export async function resolveProductionUrl(
  prev: string | undefined,
  context: ResolveProductionUrlContext,
): Promise<string | undefined> {
  const base = process.env.SANITY_STUDIO_PREVIEW_URL;
  if (!base) return prev;
  const document = context.document as {
    _type?: string;
    slug?: { current?: string };
  };
  const slug = document.slug?.current;
  const toPath = document._type ? ROUTES[document._type] : undefined;
  if (!slug || !toPath) return prev;
  return Promise.resolve(new URL(toPath(slug), base).toString());
}
