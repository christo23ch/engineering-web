/**
 * GROQ queries — the CMS contract for the §28 CMS-sourced entities the
 * frontend consumes today (Servicio, Proyecto/caso, Artículo). Projections
 * match the typed interfaces in src/lib/content/* field-for-field, so the
 * zod mapping in content.ts is a straight structural check. Sector and the
 * applied services are modeled as REFERENCES in the Studio (controlled
 * vocabulary for the F2 filter bar) and dereferenced here back to the plain
 * strings the frontend expects.
 *
 * TeamMember and Certification (§28) join in F2 when their screens get real
 * content (About/certs are currently deferred-honest sections). The Studio
 * schemas for them already exist (cms/schemas/documents/).
 *
 * Publish gating: only published documents reach these queries (the default
 * `published` perspective) — drafts and anything short of the DA-4
 * `aprobado`+publish gate never reach a build. Draft preview uses the
 * client's `perspective: 'drafts'` option on a protected deployment (F2).
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
  "sector": sector->name,
  "services": services[]->slug.current,
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
