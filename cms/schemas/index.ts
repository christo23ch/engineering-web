/**
 * Schema registry — the six §28 CMS entities plus their composition objects.
 * Imported by sanity.config.ts (Studio runtime) AND by the root contract
 * tests (tests/unit/cms/), which pin these definitions to the GROQ/zod
 * contract in src/server/integrations/sanity/.
 */
import type { TypeDef } from './define';
import { caseMetric } from './objects/caseMetric';
import { caseTestimonial } from './objects/caseTestimonial';
import { galleryImage } from './objects/galleryImage';
import { articleSection } from './objects/articleSection';
import { service } from './documents/service';
import { sector } from './documents/sector';
import { caseStudy } from './documents/caseStudy';
import { article } from './documents/article';
import { teamMember } from './documents/teamMember';
import { certification } from './documents/certification';

export const schemaTypes: TypeDef[] = [
  // Documents (§28)
  service,
  sector,
  caseStudy,
  article,
  teamMember,
  certification,
  // Objects
  caseMetric,
  caseTestimonial,
  galleryImage,
  articleSection,
];
