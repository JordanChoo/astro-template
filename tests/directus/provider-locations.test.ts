import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCity,
  createLocation,
  createFetchOutcome,
  createFetchError,
} from '../fixtures/directus-factories';
import type { Location } from '../../src/lib/content/types';

const mockIsDirectusConfigured = vi.fn<() => boolean>();
const mockFetchPublishedCities = vi.fn();
const mockFetchPublishedArticles = vi.fn();
const mockFetchCategories = vi.fn();
const mockIsLiveResult = vi.fn();
const mockNormalizeCities = vi.fn();
const mockNormalizeArticles = vi.fn();
const mockNormalizeCategories = vi.fn();
const mockReadCache = vi.fn();
const mockWriteCache = vi.fn();
const mockLogDirectusDiagnostic = vi.fn();
const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
const mockRedact = vi.fn((x: unknown) => String(x));

vi.mock('../../src/lib/directus/index', () => ({
  isDirectusConfigured: mockIsDirectusConfigured,
  fetchPublishedArticles: mockFetchPublishedArticles,
  fetchCategories: mockFetchCategories,
  fetchPublishedCities: mockFetchPublishedCities,
  isLiveResult: mockIsLiveResult,
  normalizeArticles: mockNormalizeArticles,
  normalizeCategories: mockNormalizeCategories,
  normalizeCities: mockNormalizeCities,
  readCache: mockReadCache,
  writeCache: mockWriteCache,
  logDirectusDiagnostic: mockLogDirectusDiagnostic,
  logger: mockLogger,
  redact: mockRedact,
}));

const mockGetLocalLocations = vi.fn();
const mockGetLocalBlogPosts = vi.fn();
const mockGetLocalBlogCategories = vi.fn();

vi.mock('../../src/lib/content/local', () => ({
  getLocalLocations: mockGetLocalLocations,
  getLocalBlogPosts: mockGetLocalBlogPosts,
  getLocalBlogCategories: mockGetLocalBlogCategories,
}));

function makeLocalLocations(): Location[] {
  return [
    createLocation({ slug: 'austin', city: 'Austin', state: 'TX' }),
    createLocation({ slug: 'denver', city: 'Denver', state: 'CO' }),
  ];
}

function makeCmsCities() {
  return [
    createCity({ slug: 'nyc', city_name: 'New York' }),
    createCity({ slug: 'la', city_name: 'Los Angeles', id: 'city-002' }),
  ];
}

function makeCmsLocations(): Location[] {
  return [
    createLocation({ slug: 'nyc', city: 'New York', state: 'NY' }),
    createLocation({ slug: 'la', city: 'Los Angeles', state: 'CA' }),
  ];
}

async function importProvider() {
  return import('../../src/lib/content/provider');
}

describe('Location provider fallback chain', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();

    mockIsDirectusConfigured.mockReset();
    mockFetchPublishedCities.mockReset();
    mockFetchPublishedArticles.mockReset();
    mockFetchCategories.mockReset();
    mockIsLiveResult.mockReset();
    mockNormalizeCities.mockReset();
    mockNormalizeArticles.mockReset();
    mockNormalizeCategories.mockReset();
    mockReadCache.mockReset();
    mockWriteCache.mockReset();
    mockLogDirectusDiagnostic.mockReset();
    mockLogger.info.mockReset();
    mockLogger.warn.mockReset();
    mockLogger.error.mockReset();
    mockRedact.mockReset().mockImplementation((x: unknown) => String(x));
    mockGetLocalLocations.mockReset();
    mockGetLocalBlogPosts.mockReset();
    mockGetLocalBlogCategories.mockReset();
  });

  describe('not configured — local fallback', () => {
    it('returns local locations when Directus is not configured', async () => {
      console.log('[TEST:provider-loc] not-configured: local fallback');
      mockIsDirectusConfigured.mockReturnValue(false);
      const localLocs = makeLocalLocations();
      mockGetLocalLocations.mockResolvedValue(localLocs);

      const { getLocations } = await importProvider();
      const result = await getLocations();

      expect(result).toEqual(localLocs);
      expect(result.length).toBeGreaterThan(0);
      expect(mockFetchPublishedCities).not.toHaveBeenCalled();
      expect(mockLogDirectusDiagnostic).toHaveBeenCalledWith({ source: 'not-configured' });
    });
  });

  describe('live success — CMS tier', () => {
    it('returns normalized CMS locations and writes cache', async () => {
      console.log('[TEST:provider-loc] live success: CMS locations');
      mockIsDirectusConfigured.mockReturnValue(true);
      const cities = makeCmsCities();
      const locations = makeCmsLocations();

      mockFetchPublishedCities.mockResolvedValue(createFetchOutcome(cities, 'my-site'));
      mockIsLiveResult.mockReturnValue(true);
      mockNormalizeCities.mockResolvedValue(locations);

      const { getLocations } = await importProvider();
      const result = await getLocations();

      expect(result).toEqual(locations);
      expect(mockNormalizeCities).toHaveBeenCalledWith(cities);
      expect(mockWriteCache).toHaveBeenCalledWith('locations', cities, 'my-site');
      expect(mockLogDirectusDiagnostic).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'live' })
      );
    });

    it('does not mix in local locations when CMS returns data', async () => {
      console.log('[TEST:provider-loc] live success: no local mixing');
      mockIsDirectusConfigured.mockReturnValue(true);
      const cities = makeCmsCities();
      const locations = makeCmsLocations();

      mockFetchPublishedCities.mockResolvedValue(createFetchOutcome(cities, 'my-site'));
      mockIsLiveResult.mockReturnValue(true);
      mockNormalizeCities.mockResolvedValue(locations);

      const { getLocations } = await importProvider();
      const result = await getLocations();

      expect(mockGetLocalLocations).not.toHaveBeenCalled();
      expect(result.every((l) => ['nyc', 'la'].includes(l.slug))).toBe(true);
    });
  });

  describe('live failure + cache hit', () => {
    it('returns cached locations when live fetch fails', async () => {
      console.log('[TEST:provider-loc] cache hit: fallback to disk cache');
      mockIsDirectusConfigured.mockReturnValue(true);
      const cities = makeCmsCities();
      const locations = makeCmsLocations();

      mockFetchPublishedCities.mockResolvedValue(createFetchError('Connection refused'));
      mockIsLiveResult.mockReturnValue(false);
      mockReadCache.mockReturnValue({
        data: cities,
        cachedAt: '2026-01-15T10:00:00Z',
        siteSlug: 'my-site',
      });
      mockNormalizeCities.mockResolvedValue(locations);

      const { getLocations } = await importProvider();
      const result = await getLocations();

      expect(result).toEqual(locations);
      expect(mockReadCache).toHaveBeenCalledWith('locations');
      expect(mockLogDirectusDiagnostic).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'cache' })
      );
    });
  });

  describe('live failure + cache miss — local fallback', () => {
    it('returns local locations when live fails and no cache exists', async () => {
      console.log('[TEST:provider-loc] cache miss: local fallback');
      mockIsDirectusConfigured.mockReturnValue(true);
      const localLocs = makeLocalLocations();

      mockFetchPublishedCities.mockResolvedValue(createFetchError('Network error'));
      mockIsLiveResult.mockReturnValue(false);
      mockReadCache.mockReturnValue(null);
      mockGetLocalLocations.mockResolvedValue(localLocs);

      const { getLocations } = await importProvider();
      const result = await getLocations();

      expect(result).toEqual(localLocs);
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogDirectusDiagnostic).toHaveBeenCalledWith({ source: 'local' });
    });
  });

  describe('strict mode — DIRECTUS_REQUIRED=true', () => {
    it('throws when live fetch fails in strict mode', async () => {
      console.log('[TEST:provider-loc] strict mode: throws on failure');
      vi.stubEnv('DIRECTUS_REQUIRED', 'true');

      mockIsDirectusConfigured.mockReturnValue(true);
      mockFetchPublishedCities.mockResolvedValue(createFetchError('Connection refused'));
      mockIsLiveResult.mockReturnValue(false);
      mockRedact.mockReturnValue('[redacted]');

      const { getLocations } = await importProvider();

      await expect(getLocations()).rejects.toThrow(
        'DIRECTUS_REQUIRED is true but CMS is unreachable'
      );
      expect(mockReadCache).not.toHaveBeenCalled();
      expect(mockGetLocalLocations).not.toHaveBeenCalled();
    });
  });

  describe('getLocationBySlug', () => {
    it('finds a location by slug from memoized getLocations', async () => {
      console.log('[TEST:provider-loc] getLocationBySlug: found');
      mockIsDirectusConfigured.mockReturnValue(false);
      mockGetLocalLocations.mockResolvedValue(makeLocalLocations());

      const { getLocationBySlug } = await importProvider();
      const loc = await getLocationBySlug('denver');

      expect(loc).toBeDefined();
      expect(loc!.city).toBe('Denver');
    });

    it('returns undefined for a non-existent slug', async () => {
      console.log('[TEST:provider-loc] getLocationBySlug: not found');
      mockIsDirectusConfigured.mockReturnValue(false);
      mockGetLocalLocations.mockResolvedValue(makeLocalLocations());

      const { getLocationBySlug } = await importProvider();
      const loc = await getLocationBySlug('chicago');

      expect(loc).toBeUndefined();
    });
  });

  describe('memoization', () => {
    it('calls resolve path only once for multiple getLocations() invocations', async () => {
      console.log('[TEST:provider-loc] memoization: single resolve');
      mockIsDirectusConfigured.mockReturnValue(false);
      mockGetLocalLocations.mockResolvedValue(makeLocalLocations());

      const { getLocations } = await importProvider();
      const [result1, result2] = await Promise.all([getLocations(), getLocations()]);

      expect(result1).toBe(result2);
      expect(mockGetLocalLocations).toHaveBeenCalledTimes(1);
    });
  });

  describe('per-content-area independence', () => {
    it('blog and locations use independent source tiers', async () => {
      console.log('[TEST:provider-loc] independence: blog local, locations local');
      mockIsDirectusConfigured.mockReturnValue(false);
      mockGetLocalBlogPosts.mockResolvedValue([]);
      mockGetLocalLocations.mockResolvedValue(makeLocalLocations());

      const { getBlogPosts, getLocations } = await importProvider();

      const posts = await getBlogPosts();
      const locations = await getLocations();

      expect(posts).toEqual([]);
      expect(locations).toHaveLength(2);
      expect(mockGetLocalBlogPosts).toHaveBeenCalledTimes(1);
      expect(mockGetLocalLocations).toHaveBeenCalledTimes(1);
    });
  });
});
