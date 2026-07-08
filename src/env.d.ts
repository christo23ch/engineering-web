/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Server-side environment contract (docs/PROJECT_BIBLE.md §38). These are read
// in the BFF/build, never exposed to the client (secrets stay server-side,
// Bible §13/§17). Client-exposed vars must be prefixed PUBLIC_ per Astro.
interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
