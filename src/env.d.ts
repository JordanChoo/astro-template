/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DIRECTUS_URL?: string;
  readonly DIRECTUS_TOKEN?: string;
  readonly DIRECTUS_SITE_SLUG?: string;
  readonly DIRECTUS_ASSET_BASE_URL?: string;
  readonly CACHE_DIR?: string;
  readonly DIRECTUS_REQUIRED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
