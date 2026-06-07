import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createArticle,
  createCategory,
  createCity,
  createFetchOutcome,
  createFetchError,
} from '../fixtures/directus-factories';
import type { DirectusFetchOutcome } from '../../src/lib/directus/types';

const mockRequest = vi.fn();

vi.mock('@directus/sdk', () => ({
  createDirectus: () => ({
    with: () => ({
      request: mockRequest,
    }),
  }),
  rest: () => ({}),
  readItems: (_collection: string, _opts: unknown) => _opts,
}));

describe('Directus client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockRequest.mockReset();
  });

  describe('isDirectusConfigured', () => {
    it('returns false when DIRECTUS_URL is not set', async () => {
      vi.stubEnv('DIRECTUS_URL', '');
      const { isDirectusConfigured } = await import('../../src/lib/directus/client');
      expect(isDirectusConfigured()).toBe(false);
      vi.unstubAllEnvs();
    });

    it('returns true when DIRECTUS_URL is set', async () => {
      vi.stubEnv('DIRECTUS_URL', 'https://cms.example.com');
      const mod = await import('../../src/lib/directus/client');
      expect(mod.isDirectusConfigured()).toBe(true);
      vi.unstubAllEnvs();
    });
  });

  describe('type guards', () => {
    it('isLiveResult returns true for success outcome', async () => {
      const { isLiveResult } = await import('../../src/lib/directus/client');
      const outcome = createFetchOutcome([createArticle()]);
      expect(isLiveResult(outcome)).toBe(true);
    });

    it('isLiveResult returns false for error outcome', async () => {
      const { isLiveResult } = await import('../../src/lib/directus/client');
      const outcome: DirectusFetchOutcome<unknown> = createFetchError('Network error');
      expect(isLiveResult(outcome)).toBe(false);
    });

    it('isErrorResult returns true for error outcome', async () => {
      const { isErrorResult } = await import('../../src/lib/directus/client');
      const outcome: DirectusFetchOutcome<unknown> = createFetchError('Timeout');
      expect(isErrorResult(outcome)).toBe(true);
    });

    it('isErrorResult returns false for success outcome', async () => {
      const { isErrorResult } = await import('../../src/lib/directus/client');
      const outcome = createFetchOutcome([createCategory()]);
      expect(isErrorResult(outcome)).toBe(false);
    });
  });

  describe('fetchPublishedArticles', () => {
    it('returns live outcome on success', async () => {
      vi.stubEnv('DIRECTUS_URL', 'https://cms.example.com');
      vi.stubEnv('DIRECTUS_TOKEN', 'test-token');
      vi.stubEnv('DIRECTUS_SITE_SLUG', 'test-site');

      const articles = [createArticle()];
      mockRequest.mockResolvedValueOnce(articles);

      const { fetchPublishedArticles } = await import('../../src/lib/directus/client');
      const result = await fetchPublishedArticles();

      expect(result.source).toBe('live');
      if (result.source === 'live') {
        expect(result.data).toEqual(articles);
        expect(result.siteSlug).toBe('test-site');
        expect(result.fetchedAt).toBeTruthy();
      }

      vi.unstubAllEnvs();
    });

    it('returns error outcome when SDK throws', async () => {
      vi.stubEnv('DIRECTUS_URL', 'https://cms.example.com');
      vi.stubEnv('DIRECTUS_SITE_SLUG', 'test-site');

      mockRequest.mockRejectedValueOnce(new Error('Network timeout'));

      const { fetchPublishedArticles } = await import('../../src/lib/directus/client');

      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const result = await fetchPublishedArticles();

      expect(result.source).toBe('error');
      if (result.source === 'error') {
        expect(result.error).toContain('Network timeout');
        expect(result.siteSlug).toBe('test-site');
      }

      vi.unstubAllEnvs();
    });
  });

  describe('fetchCategories', () => {
    it('returns categories on success', async () => {
      vi.stubEnv('DIRECTUS_URL', 'https://cms.example.com');
      vi.stubEnv('DIRECTUS_SITE_SLUG', 'test-site');

      const categories = [
        createCategory(),
        createCategory({ id: 'cat-002', name: 'Design', slug: 'design' }),
      ];
      mockRequest.mockResolvedValueOnce(categories);

      const { fetchCategories } = await import('../../src/lib/directus/client');
      const result = await fetchCategories();

      expect(result.source).toBe('live');
      if (result.source === 'live') {
        expect(result.data).toHaveLength(2);
      }

      vi.unstubAllEnvs();
    });
  });

  describe('fetchPublishedCities', () => {
    it('returns cities on success', async () => {
      vi.stubEnv('DIRECTUS_URL', 'https://cms.example.com');
      vi.stubEnv('DIRECTUS_SITE_SLUG', 'test-site');

      const cities = [createCity()];
      mockRequest.mockResolvedValueOnce(cities);

      const { fetchPublishedCities } = await import('../../src/lib/directus/client');
      const result = await fetchPublishedCities();

      expect(result.source).toBe('live');
      if (result.source === 'live') {
        expect(result.data).toEqual(cities);
      }

      vi.unstubAllEnvs();
    });

    it('returns error outcome when SDK throws', async () => {
      vi.stubEnv('DIRECTUS_URL', 'https://cms.example.com');
      vi.stubEnv('DIRECTUS_SITE_SLUG', 'test-site');

      mockRequest.mockRejectedValueOnce(new Error('Connection refused'));

      const { fetchPublishedCities } = await import('../../src/lib/directus/client');

      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const result = await fetchPublishedCities();

      expect(result.source).toBe('error');

      vi.unstubAllEnvs();
    });
  });
});
