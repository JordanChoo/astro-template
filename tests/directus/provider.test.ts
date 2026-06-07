import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createArticle,
  createCategory,
  createBlogPost,
  createBlogCategory,
  createFetchOutcome,
  createFetchError,
} from '../fixtures/directus-factories';
import type { BlogPost, BlogCategory } from '../../src/lib/content/types';

const mockIsDirectusConfigured = vi.fn<() => boolean>();
const mockFetchPublishedArticles = vi.fn();
const mockFetchCategories = vi.fn();
const mockIsLiveResult = vi.fn();
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
  isLiveResult: mockIsLiveResult,
  normalizeArticles: mockNormalizeArticles,
  normalizeCategories: mockNormalizeCategories,
  readCache: mockReadCache,
  writeCache: mockWriteCache,
  logDirectusDiagnostic: mockLogDirectusDiagnostic,
  logger: mockLogger,
  redact: mockRedact,
}));

const mockGetLocalBlogPosts = vi.fn();
const mockGetLocalBlogCategories = vi.fn();

vi.mock('../../src/lib/content/local', () => ({
  getLocalBlogPosts: mockGetLocalBlogPosts,
  getLocalBlogCategories: mockGetLocalBlogCategories,
}));

function makeLocalPosts(): BlogPost[] {
  return [
    createBlogPost({ slug: 'local-1', title: 'Local Post 1', categories: ['general'] }),
    createBlogPost({ slug: 'local-2', title: 'Local Post 2', categories: ['news'] }),
  ];
}

function makeLocalCategories(): BlogCategory[] {
  return [
    createBlogCategory({ name: 'General', slug: 'general', postCount: 1 }),
    createBlogCategory({ name: 'News', slug: 'news', postCount: 1 }),
  ];
}

function makeCmsArticles() {
  return [createArticle({ slug: 'cms-1' }), createArticle({ slug: 'cms-2' })];
}

function makeCmsPosts(): BlogPost[] {
  return [
    createBlogPost({ slug: 'cms-1', title: 'CMS Post 1', categories: ['Technology'] }),
    createBlogPost({ slug: 'cms-2', title: 'CMS Post 2', categories: ['Technology'] }),
  ];
}

function makeCmsDirectusCategories() {
  return [createCategory({ name: 'Technology', slug: 'technology' })];
}

function makeNormalizedCategories(): BlogCategory[] {
  return [createBlogCategory({ name: 'Technology', slug: 'technology', postCount: 0 })];
}

async function importProvider() {
  return import('../../src/lib/content/provider');
}

describe('Content provider fallback chain', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();

    mockIsDirectusConfigured.mockReset();
    mockFetchPublishedArticles.mockReset();
    mockFetchCategories.mockReset();
    mockIsLiveResult.mockReset();
    mockNormalizeArticles.mockReset();
    mockNormalizeCategories.mockReset();
    mockReadCache.mockReset();
    mockWriteCache.mockReset();
    mockLogDirectusDiagnostic.mockReset();
    mockLogger.info.mockReset();
    mockLogger.warn.mockReset();
    mockLogger.error.mockReset();
    mockRedact.mockReset().mockImplementation((x: unknown) => String(x));
    mockGetLocalBlogPosts.mockReset();
    mockGetLocalBlogCategories.mockReset();
  });

  describe('not configured — local fallback', () => {
    it('returns local posts when Directus is not configured', async () => {
      console.log('[TEST:provider] not-configured: verifying local fallback for posts');
      mockIsDirectusConfigured.mockReturnValue(false);
      const localPosts = makeLocalPosts();
      mockGetLocalBlogPosts.mockResolvedValue(localPosts);

      const { getBlogPosts } = await importProvider();
      const result = await getBlogPosts();

      expect(result).toEqual(localPosts);
      expect(mockFetchPublishedArticles).not.toHaveBeenCalled();
      expect(mockLogDirectusDiagnostic).toHaveBeenCalledWith({ source: 'not-configured' });
      console.log('[TEST:provider] not-configured: local posts returned, fetch skipped');
    });

    it('returns local categories when Directus is not configured', async () => {
      console.log('[TEST:provider] not-configured: verifying local fallback for categories');
      mockIsDirectusConfigured.mockReturnValue(false);
      const localCats = makeLocalCategories();
      mockGetLocalBlogCategories.mockResolvedValue(localCats);

      const { getBlogCategories } = await importProvider();
      const result = await getBlogCategories();

      expect(result).toEqual(localCats);
      expect(mockFetchCategories).not.toHaveBeenCalled();
    });
  });

  describe('live success — CMS tier', () => {
    it('returns normalized CMS posts and writes cache on live fetch', async () => {
      console.log('[TEST:provider] live success: verifying normalization and cache write');
      mockIsDirectusConfigured.mockReturnValue(true);
      const articles = makeCmsArticles();
      const posts = makeCmsPosts();

      mockFetchPublishedArticles.mockResolvedValue(createFetchOutcome(articles, 'my-site'));
      mockIsLiveResult.mockReturnValue(true);
      mockNormalizeArticles.mockResolvedValue(posts);

      const { getBlogPosts } = await importProvider();
      const result = await getBlogPosts();

      expect(result).toEqual(posts);
      expect(mockNormalizeArticles).toHaveBeenCalledWith(articles);
      expect(mockWriteCache).toHaveBeenCalledWith('blog', articles, 'my-site');
      expect(mockLogDirectusDiagnostic).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'live' })
      );
      console.log('[TEST:provider] live success: posts normalized, cache written');
    });
  });

  describe('live failure + cache hit', () => {
    it('returns cached posts when live fetch fails but cache is available', async () => {
      console.log('[TEST:provider] cache hit: verifying fallback to disk cache');
      mockIsDirectusConfigured.mockReturnValue(true);
      const articles = makeCmsArticles();
      const posts = makeCmsPosts();

      mockFetchPublishedArticles.mockResolvedValue(createFetchError('Connection refused'));
      mockIsLiveResult.mockReturnValue(false);
      mockReadCache.mockReturnValue({
        data: articles,
        cachedAt: '2026-01-15T10:00:00Z',
        siteSlug: 'my-site',
      });
      mockNormalizeArticles.mockResolvedValue(posts);

      const { getBlogPosts } = await importProvider();
      const result = await getBlogPosts();

      expect(result).toEqual(posts);
      expect(mockReadCache).toHaveBeenCalledWith('blog');
      expect(mockNormalizeArticles).toHaveBeenCalledWith(articles);
      expect(mockLogDirectusDiagnostic).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'cache' })
      );
      console.log('[TEST:provider] cache hit: cached posts returned');
    });
  });

  describe('live failure + cache miss — local fallback', () => {
    it('returns local posts when live fetch fails and no cache exists', async () => {
      console.log('[TEST:provider] cache miss: verifying local fallback');
      mockIsDirectusConfigured.mockReturnValue(true);
      const localPosts = makeLocalPosts();

      mockFetchPublishedArticles.mockResolvedValue(createFetchError('Network error'));
      mockIsLiveResult.mockReturnValue(false);
      mockReadCache.mockReturnValue(null);
      mockGetLocalBlogPosts.mockResolvedValue(localPosts);

      const { getBlogPosts } = await importProvider();
      const result = await getBlogPosts();

      expect(result).toEqual(localPosts);
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogDirectusDiagnostic).toHaveBeenCalledWith({ source: 'local' });
      console.log('[TEST:provider] cache miss: local posts returned');
    });
  });

  describe('strict mode — DIRECTUS_REQUIRED=true', () => {
    it('throws redacted error when fetch fails in strict mode', async () => {
      console.log('[TEST:provider] strict mode: verifying error throw with redaction');
      vi.stubEnv('DIRECTUS_REQUIRED', 'true');

      mockIsDirectusConfigured.mockReturnValue(true);
      mockFetchPublishedArticles.mockResolvedValue(
        createFetchError('Connection refused', 'my-site')
      );
      mockIsLiveResult.mockReturnValue(false);
      mockRedact.mockReturnValue('[redacted]');

      const { getBlogPosts } = await importProvider();

      await expect(getBlogPosts()).rejects.toThrow(
        'DIRECTUS_REQUIRED is true but CMS is unreachable'
      );
      expect(mockRedact).toHaveBeenCalled();
      console.log('[TEST:provider] strict mode: error thrown with redacted message');
    });

    it('does not fall through to cache or local content in strict mode', async () => {
      console.log('[TEST:provider] strict mode: verifying no fallthrough');
      vi.stubEnv('DIRECTUS_REQUIRED', 'true');

      mockIsDirectusConfigured.mockReturnValue(true);
      mockFetchPublishedArticles.mockResolvedValue(createFetchError('Timeout'));
      mockIsLiveResult.mockReturnValue(false);
      mockRedact.mockReturnValue('[redacted]');

      const { getBlogPosts } = await importProvider();

      await expect(getBlogPosts()).rejects.toThrow();
      expect(mockReadCache).not.toHaveBeenCalled();
      expect(mockGetLocalBlogPosts).not.toHaveBeenCalled();
      console.log('[TEST:provider] strict mode: no cache or local fallthrough');
    });
  });

  describe('cache slug mismatch — treated as miss', () => {
    it('falls back to local when readCache returns null due to slug mismatch', async () => {
      console.log('[TEST:provider] slug mismatch: readCache returns null, expecting local');
      mockIsDirectusConfigured.mockReturnValue(true);
      const localPosts = makeLocalPosts();

      mockFetchPublishedArticles.mockResolvedValue(createFetchError('fail'));
      mockIsLiveResult.mockReturnValue(false);
      mockReadCache.mockReturnValue(null);
      mockGetLocalBlogPosts.mockResolvedValue(localPosts);

      const { getBlogPosts } = await importProvider();
      const result = await getBlogPosts();

      expect(result).toEqual(localPosts);
      expect(mockReadCache).toHaveBeenCalledWith('blog');
      expect(mockLogDirectusDiagnostic).toHaveBeenCalledWith({ source: 'local' });
      console.log('[TEST:provider] slug mismatch: local fallback used');
    });
  });

  describe('memoization', () => {
    it('calls resolve path only once for multiple getBlogPosts() invocations', async () => {
      console.log('[TEST:provider] memoization: verifying single resolve for posts');
      mockIsDirectusConfigured.mockReturnValue(false);
      const localPosts = makeLocalPosts();
      mockGetLocalBlogPosts.mockResolvedValue(localPosts);

      const { getBlogPosts } = await importProvider();
      const [result1, result2] = await Promise.all([getBlogPosts(), getBlogPosts()]);

      expect(result1).toBe(result2);
      expect(mockGetLocalBlogPosts).toHaveBeenCalledTimes(1);
      console.log('[TEST:provider] memoization: single call confirmed');
    });

    it('memoizes posts and categories independently', async () => {
      console.log('[TEST:provider] memoization: independent caches for posts and categories');
      mockIsDirectusConfigured.mockReturnValue(false);
      mockGetLocalBlogPosts.mockResolvedValue(makeLocalPosts());
      mockGetLocalBlogCategories.mockResolvedValue(makeLocalCategories());

      const { getBlogPosts, getBlogCategories } = await importProvider();

      await getBlogPosts();
      await getBlogCategories();
      await getBlogPosts();
      await getBlogCategories();

      expect(mockGetLocalBlogPosts).toHaveBeenCalledTimes(1);
      expect(mockGetLocalBlogCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe('category consistency — single source tier', () => {
    it('live categories compute postCount from CMS posts, not local', async () => {
      console.log('[TEST:provider] category consistency: CMS tier isolation');
      mockIsDirectusConfigured.mockReturnValue(true);

      const cmsPosts = makeCmsPosts();
      mockFetchPublishedArticles.mockResolvedValue(
        createFetchOutcome(makeCmsArticles(), 'my-site')
      );
      mockIsLiveResult.mockImplementation((o: { source: string }) => o.source === 'live');
      mockNormalizeArticles.mockResolvedValue(cmsPosts);

      mockFetchCategories.mockResolvedValue(
        createFetchOutcome(makeCmsDirectusCategories(), 'my-site')
      );
      const normalizedCats = makeNormalizedCategories();
      mockNormalizeCategories.mockReturnValue(normalizedCats);

      const { getBlogPosts, getBlogCategories } = await importProvider();

      await getBlogPosts();
      const categories = await getBlogCategories();

      expect(categories[0]!.name).toBe('Technology');
      expect(categories[0]!.postCount).toBe(2);
      expect(mockGetLocalBlogPosts).not.toHaveBeenCalled();
      expect(mockGetLocalBlogCategories).not.toHaveBeenCalled();
      console.log('[TEST:provider] category consistency: counts from CMS tier only');
    });

    it('returns local categories when both fetch and cache fail', async () => {
      console.log('[TEST:provider] category fallback to local');
      mockIsDirectusConfigured.mockReturnValue(true);

      mockFetchPublishedArticles.mockResolvedValue(createFetchError('fail'));
      mockIsLiveResult.mockReturnValue(false);
      mockReadCache.mockReturnValue(null);
      mockGetLocalBlogPosts.mockResolvedValue(makeLocalPosts());

      mockFetchCategories.mockResolvedValue(createFetchError('fail'));
      const localCats = makeLocalCategories();
      mockGetLocalBlogCategories.mockResolvedValue(localCats);

      const { getBlogCategories } = await importProvider();
      const categories = await getBlogCategories();

      expect(categories).toEqual(localCats);
      console.log('[TEST:provider] category local fallback confirmed');
    });
  });

  describe('getBlogPostBySlug', () => {
    it('returns the matching post by slug', async () => {
      mockIsDirectusConfigured.mockReturnValue(false);
      const localPosts = makeLocalPosts();
      mockGetLocalBlogPosts.mockResolvedValue(localPosts);

      const { getBlogPostBySlug } = await importProvider();
      const result = await getBlogPostBySlug('local-1');

      expect(result).toEqual(localPosts[0]);
    });

    it('returns undefined for non-existent slug', async () => {
      mockIsDirectusConfigured.mockReturnValue(false);
      mockGetLocalBlogPosts.mockResolvedValue(makeLocalPosts());

      const { getBlogPostBySlug } = await importProvider();
      const result = await getBlogPostBySlug('does-not-exist');

      expect(result).toBeUndefined();
    });
  });
});
