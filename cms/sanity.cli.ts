/**
 * Sanity CLI config — used by `sanity dev/build/deploy/schema validate`.
 * Reads the same SANITY_STUDIO_* envs as sanity.config.ts.
 */
import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'pendiente',
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
});
