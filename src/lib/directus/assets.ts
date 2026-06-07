import type { DirectusFile } from './types.js';

export interface ResolvedAsset {
  url: string;
  alt?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
  source: 'directus-file' | 'external-url';
}

function getAssetBaseUrl(): string {
  return import.meta.env.DIRECTUS_ASSET_BASE_URL || import.meta.env.DIRECTUS_URL || '';
}

const TOKEN_PARAM_RE = /[?&](?:access_token|token)=/i;
const DANGEROUS_PROTOCOL_RE = /^(javascript|data|vbscript):/i;

export function isTokenSafe(url: string): boolean {
  if (TOKEN_PARAM_RE.test(url)) return false;

  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has('access_token')) return false;
    if (parsed.searchParams.has('token')) return false;
  } catch {
    // malformed URL — regex check above is the fallback
  }

  return true;
}

export function isSafePublicUrl(url: string): boolean {
  if (DANGEROUS_PROTOCOL_RE.test(url.trim())) return false;
  return isTokenSafe(url);
}

export function assertNoTokenLeakage(
  urls: Array<{ url: string; field: string; slug?: string }>
): void {
  for (const entry of urls) {
    if (!isTokenSafe(entry.url)) {
      const context = entry.slug ? ` (slug: ${entry.slug})` : '';
      throw new Error(`Token leak detected in ${entry.field} URL${context}`);
    }
  }
}

export function resolveAssetUrl(
  file: DirectusFile | null | undefined,
  externalUrl: string | null | undefined,
  alt?: string
): ResolvedAsset | null {
  if (file?.id) {
    const base = getAssetBaseUrl();
    if (!base) return null;

    const url = `${base.replace(/\/$/, '')}/assets/${file.id}`;

    return {
      url,
      alt: alt || file.description || file.title || undefined,
      width: file.width ?? undefined,
      height: file.height ?? undefined,
      source: 'directus-file',
    };
  }

  if (externalUrl && isSafePublicUrl(externalUrl)) {
    return {
      url: externalUrl,
      alt: alt || undefined,
      source: 'external-url',
    };
  }

  return null;
}
