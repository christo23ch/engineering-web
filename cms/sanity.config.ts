/**
 * Sanity Studio (DA-7) — Studio runtime entry. Project/dataset come from
 * SANITY_STUDIO_* envs (cms/.env.example): no real project exists until the
 * client ratifies §49, so the fallback id is an explicit placeholder that
 * fails loudly against the API.
 *
 * Full runbook (project creation, roles, CORS, tokens, webhooks):
 * docs/CMS.md.
 */
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';
import { structure } from './desk/structure';
import { buildDocumentActions } from './workflow/actions';
import { buildDocumentBadges } from './workflow/badges';
import { resolveProductionUrl } from './preview';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'pendiente';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

export default defineConfig({
  name: 'engineering-web',
  title: 'Contenido — web de ingeniería',
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    // Local TypeDef shapes are structurally valid Sanity schema definitions
    // (see schemas/define.ts) — the cast bridges the nominal types.
    types: schemaTypes as never,
  },
  document: {
    actions: buildDocumentActions,
    badges: buildDocumentBadges,
    productionUrl: resolveProductionUrl,
  },
});
