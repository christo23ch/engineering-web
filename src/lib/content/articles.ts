/**
 * Article content model (Bible §28 entity "Artículo/Recurso"). Feeds the article
 * detail template (§13.6). The array is intentionally EMPTY: editorial content is
 * authored in the CMS (DA-7) and never fabricated. getStaticPaths yields zero
 * pages until then, and the Recursos listing shows its empty state.
 */
export interface ArticleAuthor {
  name: string;
  role?: string;
  bio?: string;
}

export interface ArticleSection {
  heading: string;
  body: string[];
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  /** ISO date shown as the visible published/updated stamp. */
  updated: string;
  author: ArticleAuthor;
  sections: ArticleSection[];
}

export const articles: Article[] = [];

export function getArticle(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

/** Related articles share the category and exclude the current one (§13.6). */
export function relatedArticles(current: Article, limit = 3): Article[] {
  return articles
    .filter((a) => a.slug !== current.slug && a.category === current.category)
    .slice(0, limit);
}

/** Anchor id for a section heading (stable ToC links). */
export function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
