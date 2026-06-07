import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readCache, writeCache } from '../../src/lib/directus/cache';

interface CacheFixture {
  id: string;
  title: string;
  tags: string[];
}

let cacheDir: string;

function createCacheFixture(overrides?: Partial<CacheFixture>): CacheFixture {
  return {
    id: 'item-001',
    title: 'Cached Directus Item',
    tags: ['directus', 'cache'],
    ...overrides,
  };
}

function cacheFilePath(collection: string): string {
  return join(cacheDir, `directus-${collection}.json`);
}

function assertWithLog(
  description: string,
  context: Record<string, unknown>,
  assertion: () => void
): void {
  try {
    assertion();
  } catch (error) {
    console.log('[TEST:cache] assertion failed', {
      description,
      ...context,
    });
    throw error;
  }
}

describe('Directus disk cache', () => {
  beforeEach(() => {
    cacheDir = mkdtempSync(join(tmpdir(), 'astro-directus-cache-'));
    vi.stubEnv('CACHE_DIR', cacheDir);
    vi.stubEnv('DIRECTUS_SITE_SLUG', 'site-alpha');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(cacheDir, { recursive: true, force: true });
  });

  describe('readCache', () => {
    it('returns null when the requested collection has no cache file', () => {
      const collection = 'articles';

      console.log('[TEST:cache] reading missing cache file', {
        collection,
        cacheDir,
      });

      const result = readCache<CacheFixture>(collection);

      assertWithLog(
        'missing cache result',
        {
          actual: result,
          expected: null,
          testData: { collection, cacheDir },
        },
        () => expect(result).toBeNull()
      );
    });

    it('returns null when the cached site slug differs from the current Directus site slug', () => {
      const collection = 'articles';
      const cachedSiteSlug = 'site-alpha';
      const currentSiteSlug = 'site-beta';
      const data = [createCacheFixture()];

      writeCache(collection, data, cachedSiteSlug);
      vi.stubEnv('DIRECTUS_SITE_SLUG', currentSiteSlug);

      console.log('[TEST:cache] reading cache with mismatched slug', {
        collection,
        cachedSiteSlug,
        currentSiteSlug,
        cacheFile: cacheFilePath(collection),
      });

      const result = readCache<CacheFixture>(collection);

      assertWithLog(
        'slug mismatch cache result',
        {
          actual: result,
          expected: null,
          testData: { collection, cachedSiteSlug, currentSiteSlug, data },
        },
        () => expect(result).toBeNull()
      );
    });

    it('returns null instead of throwing when the cache file contains invalid JSON', () => {
      const collection = 'articles';
      const invalidJson = '{ this is not valid json';
      writeFileSync(cacheFilePath(collection), invalidJson, 'utf-8');

      console.log('[TEST:cache] reading corrupt cache file', {
        collection,
        cacheFile: cacheFilePath(collection),
        invalidJson,
      });

      const result = readCache<CacheFixture>(collection);

      assertWithLog(
        'corrupt cache result',
        {
          actual: result,
          expected: null,
          testData: { collection, invalidJson },
        },
        () => expect(result).toBeNull()
      );
    });
  });

  describe('writeCache and readCache', () => {
    it('round-trips cached data with site slug and cachedAt metadata', () => {
      const collection = 'articles';
      const siteSlug = 'site-alpha';
      const data = [
        createCacheFixture(),
        createCacheFixture({
          id: 'item-002',
          title: 'Second Cached Directus Item',
        }),
      ];

      console.log('[TEST:cache] writing and reading cache data', {
        collection,
        siteSlug,
        data,
        cacheDir,
      });

      writeCache(collection, data, siteSlug);
      const result = readCache<CacheFixture>(collection);

      assertWithLog(
        'round-trip data',
        {
          actual: result?.data,
          expected: data,
          testData: { collection, siteSlug, data },
        },
        () => expect(result?.data).toEqual(data)
      );
      assertWithLog(
        'round-trip site slug',
        {
          actual: result?.siteSlug,
          expected: siteSlug,
          testData: { collection, siteSlug, data },
        },
        () => expect(result?.siteSlug).toBe(siteSlug)
      );

      const parsedCachedAt = result?.cachedAt ? Date.parse(result.cachedAt) : Number.NaN;

      assertWithLog(
        'cachedAt is an ISO timestamp',
        {
          actual: result?.cachedAt,
          expected: 'valid ISO timestamp',
          testData: { collection, siteSlug, data },
        },
        () => expect(Number.isNaN(parsedCachedAt)).toBe(false)
      );
    });

    it('creates CACHE_DIR before writing when the configured cache directory is missing', () => {
      const collection = 'categories';
      const siteSlug = 'site-alpha';
      const data = [createCacheFixture({ id: 'category-001' })];

      rmSync(cacheDir, { recursive: true, force: true });

      console.log('[TEST:cache] writing cache after removing CACHE_DIR', {
        collection,
        siteSlug,
        cacheDir,
        data,
      });

      writeCache(collection, data, siteSlug);
      const result = readCache<CacheFixture>(collection);

      assertWithLog(
        'cache directory exists after write',
        {
          actual: existsSync(cacheDir),
          expected: true,
          testData: { collection, siteSlug, cacheDir, data },
        },
        () => expect(existsSync(cacheDir)).toBe(true)
      );
      assertWithLog(
        'cache file exists after write',
        {
          actual: existsSync(cacheFilePath(collection)),
          expected: true,
          testData: { collection, siteSlug, cacheFile: cacheFilePath(collection) },
        },
        () => expect(existsSync(cacheFilePath(collection))).toBe(true)
      );
      assertWithLog(
        'cache data is readable after directory creation',
        {
          actual: result?.data,
          expected: data,
          testData: { collection, siteSlug, cacheDir, data },
        },
        () => expect(result?.data).toEqual(data)
      );
    });

    it('round-trips an empty data array without treating it as a cache miss', () => {
      const collection = 'cities';
      const siteSlug = 'site-alpha';
      const data: CacheFixture[] = [];

      console.log('[TEST:cache] writing and reading empty cache data', {
        collection,
        siteSlug,
        data,
        cacheDir,
      });

      writeCache(collection, data, siteSlug);
      const result = readCache<CacheFixture>(collection);

      assertWithLog(
        'empty cache data',
        {
          actual: result?.data,
          expected: data,
          testData: { collection, siteSlug, data },
        },
        () => expect(result?.data).toEqual(data)
      );
      assertWithLog(
        'empty cache site slug',
        {
          actual: result?.siteSlug,
          expected: siteSlug,
          testData: { collection, siteSlug, data },
        },
        () => expect(result?.siteSlug).toBe(siteSlug)
      );
      assertWithLog(
        'empty cache cachedAt metadata',
        {
          actual: result?.cachedAt,
          expected: 'defined timestamp',
          testData: { collection, siteSlug, data },
        },
        () => expect(result?.cachedAt).toBeTruthy()
      );
    });
  });
});
