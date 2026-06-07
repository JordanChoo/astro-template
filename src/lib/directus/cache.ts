import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from './logger.js';

export interface CachedData<T> {
  data: T[];
  cachedAt: string;
  siteSlug: string;
}

interface CacheFile<T> {
  _meta: { version: number; siteSlug: string; cachedAt: string };
  data: T[];
}

function getCacheDir(): string {
  return import.meta.env.CACHE_DIR || '.cache';
}

function cachePath(collection: string): string {
  return join(getCacheDir(), `directus-${collection}.json`);
}

export function readCache<T>(collection: string): CachedData<T> | null {
  const path = cachePath(collection);

  if (!existsSync(path)) return null;

  try {
    const raw = readFileSync(path, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<CacheFile<T>>;
    const meta = parsed._meta;

    if (
      !meta ||
      meta.version !== 1 ||
      typeof meta.siteSlug !== 'string' ||
      typeof meta.cachedAt !== 'string'
    ) {
      logger.warn(`Cache metadata invalid for ${collection}, treating as miss`);
      return null;
    }

    const currentSlug = import.meta.env.DIRECTUS_SITE_SLUG ?? '';
    if (meta.siteSlug !== currentSlug) {
      logger.warn(
        `Cache site slug mismatch for ${collection} - expected current slug, got different slug. Treating as miss.`
      );
      return null;
    }

    if (!Array.isArray(parsed.data)) {
      logger.warn(`Cache data invalid for ${collection}, treating as miss`);
      return null;
    }

    return {
      data: parsed.data,
      cachedAt: meta.cachedAt,
      siteSlug: meta.siteSlug,
    };
  } catch {
    logger.warn(`Failed to read cache for ${collection}`);
    return null;
  }
}

export function writeCache<T>(collection: string, data: T[], siteSlug: string): void {
  const dir = getCacheDir();
  const path = cachePath(collection);

  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const cacheFile: CacheFile<T> = {
      _meta: {
        version: 1,
        siteSlug,
        cachedAt: new Date().toISOString(),
      },
      data,
    };

    writeFileSync(path, JSON.stringify(cacheFile, null, 2), 'utf-8');
    logger.info(`Cache written: ${collection} (${data.length} items)`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error(`Failed to write cache for ${collection}: ${message}`);
  }
}
