/**
 * GROQ queries — the CMS contract for the §28 CMS-sourced entities the
 * frontend consumes today (Servicio, Proyecto/caso, Artículo). Projections
 * match the typed interfaces in src/lib/content/* field-for-field, so the
 * zod mapping in content.ts is a straight structural check.
 *
 * TeamMember, Certification and Sector (§28) join in F2 when their screens
 * get real content (About/certs are currently deferred-honest sections).
 */

export const SERVICES_QUERY = `*[_type == "service"] | order(order asc) {
  "slug": slug.current,
  name,
  icon,
  description,
  problem
}`;

export const CASES_QUERY = `*[_type == "caseStudy"] | order(_createdAt desc) {
  "slug": slug.current,
  title,
  client,
  sector,
  services,
  summary,
  icon,
  metrics[] { value, unit, label },
  challenge,
  solution,
  results,
  gallery[] { "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height },
  testimonial { quote, author, role }
}`;

export const ARTICLES_QUERY = `*[_type == "article"] | order(updated desc) {
  "slug": slug.current,
  title,
  category,
  excerpt,
  updated,
  author { name, role, bio },
  sections[] { heading, body }
}`;
