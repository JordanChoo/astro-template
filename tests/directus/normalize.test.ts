import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createArticle, createCategory } from '../fixtures/directus-factories';

vi.mock('../../src/lib/directus/assets', () => ({
  resolveAssetUrl: vi.fn(),
  assertNoTokenLeakage: vi.fn(),
}));

vi.mock('../../src/lib/directus/markdown', () => ({
  renderMarkdown: vi.fn(),
}));

vi.mock('../../src/lib/directus/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { resolveAssetUrl, assertNoTokenLeakage } from '../../src/lib/directus/assets';
import { renderMarkdown } from '../../src/lib/directus/markdown';
import { logger } from '../../src/lib/directus/logger';
import {
  normalizeArticle,
  normalizeArticles,
  normalizeCategories,
} from '../../src/lib/directus/normalize';

const mockResolveAssetUrl = resolveAssetUrl as ReturnType<typeof vi.fn>;
const mockRenderMarkdown = renderMarkdown as ReturnType<typeof vi.fn>;
const mockAssertNoTokenLeakage = assertNoTokenLeakage as ReturnType<typeof vi.fn>;
const mockLoggerWarn = logger.warn as ReturnType<typeof vi.fn>;

describe('CMS data normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveAssetUrl.mockReturnValue(null);
    mockRenderMarkdown.mockResolvedValue({ html: '<p>rendered</p>', headings: [] });
  });

  describe('normalizeArticle', () => {
    it('maps slug and title directly', async () => {
      console.log('[TEST:normalize] slug and title');
      const raw = createArticle({ slug: 'my-post', title: 'My Post' });
      const post = await normalizeArticle(raw);
      expect(post.slug).toBe('my-post');
      expect(post.title).toBe('My Post');
    });

    it('maps short_description to description', async () => {
      console.log('[TEST:normalize] description mapping');
      const raw = createArticle({ short_description: 'A great post' });
      const post = await normalizeArticle(raw);
      expect(post.description).toBe('A great post');
    });

    it('defaults description to empty string when short_description is null', async () => {
      console.log('[TEST:normalize] null description fallback');
      const raw = createArticle({ short_description: null });
      const post = await normalizeArticle(raw);
      expect(post.description).toBe('');
    });

    it('uses date_published for pubDate', async () => {
      console.log('[TEST:normalize] pubDate from date_published');
      const raw = createArticle({ date_published: '2026-03-15T10:00:00Z' });
      const post = await normalizeArticle(raw);
      expect(post.pubDate).toEqual(new Date('2026-03-15T10:00:00Z'));
    });

    it('falls back to date_created when date_published is null', async () => {
      console.log('[TEST:normalize] pubDate fallback to date_created');
      const raw = createArticle({
        date_published: null,
        date_created: '2026-02-01T08:00:00Z',
      });
      const post = await normalizeArticle(raw);
      expect(post.pubDate).toEqual(new Date('2026-02-01T08:00:00Z'));
    });

    it('falls back to current date when both date fields are null', async () => {
      console.log('[TEST:normalize] pubDate fallback to now');
      const before = Date.now();
      const raw = createArticle({ date_published: null, date_created: null });
      const post = await normalizeArticle(raw);
      const after = Date.now();
      expect(post.pubDate.getTime()).toBeGreaterThanOrEqual(before);
      expect(post.pubDate.getTime()).toBeLessThanOrEqual(after);
    });

    it('maps author_slug to author', async () => {
      console.log('[TEST:normalize] author mapping');
      const raw = createArticle({ author_slug: 'john-doe' });
      const post = await normalizeArticle(raw);
      expect(post.author).toBe('john-doe');
    });

    it('defaults author to empty string when author_slug is null', async () => {
      console.log('[TEST:normalize] null author fallback');
      const raw = createArticle({ author_slug: null });
      const post = await normalizeArticle(raw);
      expect(post.author).toBe('');
    });

    it('renders content via markdown pipeline', async () => {
      console.log('[TEST:normalize] markdown rendering');
      mockRenderMarkdown.mockResolvedValue({
        html: '<h2>Hello</h2>',
        headings: [{ depth: 2, slug: 'hello', text: 'Hello' }],
      });
      const raw = createArticle({ content: '## Hello' });
      const post = await normalizeArticle(raw);
      expect(mockRenderMarkdown).toHaveBeenCalledWith('## Hello');
      expect(post.rendered).toEqual({
        html: '<h2>Hello</h2>',
        headings: [{ depth: 2, slug: 'hello', text: 'Hello' }],
      });
    });

    it('preserves raw content string', async () => {
      console.log('[TEST:normalize] raw content preserved');
      const raw = createArticle({ content: '## Markdown content' });
      const post = await normalizeArticle(raw);
      expect(post.content).toBe('## Markdown content');
    });

    it('handles null content gracefully', async () => {
      console.log('[TEST:normalize] null content');
      const raw = createArticle({ content: null });
      const post = await normalizeArticle(raw);
      expect(post.content).toBe('');
      expect(post.rendered).toBeUndefined();
      expect(mockRenderMarkdown).not.toHaveBeenCalled();
    });

    it('maps featured_image_file via resolveAssetUrl', async () => {
      console.log('[TEST:normalize] featured image resolution');
      mockResolveAssetUrl.mockImplementation((file, _url, alt) => {
        if (file?.id === 'img-123') {
          return {
            url: 'https://cdn.example.com/assets/img-123',
            alt,
            width: 800,
            height: 600,
            source: 'directus-file',
          };
        }
        return null;
      });
      const raw = createArticle({
        featured_image_file: {
          id: 'img-123',
          title: null,
          description: null,
          width: 800,
          height: 600,
          modified_on: null,
        },
      });
      const post = await normalizeArticle(raw);
      expect(post.image).toEqual({
        url: 'https://cdn.example.com/assets/img-123',
        alt: 'Featured image',
        width: 800,
        height: 600,
      });
    });

    it('sets image to undefined when resolveAssetUrl returns null', async () => {
      console.log('[TEST:normalize] no image');
      mockResolveAssetUrl.mockReturnValue(null);
      const raw = createArticle({ featured_image_file: null, featured_image: null });
      const post = await normalizeArticle(raw);
      expect(post.image).toBeUndefined();
    });

    it('maps category to categories array and category object', async () => {
      console.log('[TEST:normalize] category mapping');
      const raw = createArticle({
        category: createCategory({ name: 'Design', slug: 'design' }),
      });
      const post = await normalizeArticle(raw);
      expect(post.categories).toEqual(['Design']);
      expect(post.category).toEqual({ name: 'Design', slug: 'design' });
    });

    it('handles null category', async () => {
      console.log('[TEST:normalize] null category');
      const raw = createArticle({ category: null });
      const post = await normalizeArticle(raw);
      expect(post.categories).toEqual([]);
      expect(post.category).toBeUndefined();
    });

    it('sets tags to empty array', async () => {
      console.log('[TEST:normalize] tags always empty');
      const raw = createArticle();
      const post = await normalizeArticle(raw);
      expect(post.tags).toEqual([]);
    });

    it('maps draft status to isDraft true', async () => {
      console.log('[TEST:normalize] draft status');
      const raw = createArticle({ status: 'draft' });
      const post = await normalizeArticle(raw);
      expect(post.isDraft).toBe(true);
    });

    it('maps published status to isDraft false', async () => {
      console.log('[TEST:normalize] published status');
      const raw = createArticle({ status: 'published' });
      const post = await normalizeArticle(raw);
      expect(post.isDraft).toBe(false);
    });

    it('maps SEO fields to seo object', async () => {
      console.log('[TEST:normalize] SEO fields');
      const raw = createArticle({
        title_tag: 'Custom Title',
        meta_description: 'Custom desc',
        canonical_url: 'https://example.com/canonical',
        robots: 'noindex,nofollow',
      });
      const post = await normalizeArticle(raw);
      expect(post.seo).toEqual({
        titleTag: 'Custom Title',
        metaDescription: 'Custom desc',
        canonicalUrl: 'https://example.com/canonical',
        robots: 'noindex,nofollow',
      });
    });

    it('maps null SEO fields to undefined', async () => {
      console.log('[TEST:normalize] null SEO fields');
      const raw = createArticle({
        title_tag: null,
        meta_description: null,
        canonical_url: null,
        robots: null,
      });
      const post = await normalizeArticle(raw);
      expect(post.seo).toEqual({
        titleTag: undefined,
        metaDescription: undefined,
        canonicalUrl: undefined,
        robots: undefined,
      });
    });

    it('computes sitemapEligible true for normal posts', async () => {
      console.log('[TEST:normalize] sitemap eligible default');
      const raw = createArticle({ robots: null, canonical_url: null });
      const post = await normalizeArticle(raw);
      expect(post.sitemapEligible).toBe(true);
    });

    it('computes sitemapEligible false when robots contains noindex', async () => {
      console.log('[TEST:normalize] sitemap noindex');
      const raw = createArticle({ robots: 'noindex,nofollow' });
      const post = await normalizeArticle(raw);
      expect(post.sitemapEligible).toBe(false);
    });
  });

  describe('normalizeArticles', () => {
    it('normalizes an array of articles', async () => {
      console.log('[TEST:normalize] batch normalization');
      const raws = [
        createArticle({ slug: 'post-1', title: 'Post 1' }),
        createArticle({ slug: 'post-2', title: 'Post 2' }),
      ];
      const posts = await normalizeArticles(raws);
      expect(posts).toHaveLength(2);
      expect(posts[0]!.slug).toBe('post-1');
      expect(posts[1]!.slug).toBe('post-2');
    });

    it('skips articles with empty slug and logs warning', async () => {
      console.log('[TEST:normalize] skip empty slug');
      const raws = [
        createArticle({ slug: '', id: 'no-slug' }),
        createArticle({ slug: 'valid-post' }),
      ];
      const posts = await normalizeArticles(raws);
      expect(posts).toHaveLength(1);
      expect(posts[0]!.slug).toBe('valid-post');
      expect(mockLoggerWarn).toHaveBeenCalledWith(expect.stringContaining('no-slug'));
    });

    it('calls assertNoTokenLeakage with collected asset URLs', async () => {
      console.log('[TEST:normalize] token leak check');
      mockResolveAssetUrl.mockImplementation((file, _url, _alt) => {
        if (file?.id) {
          return {
            url: `https://cdn.example.com/assets/${file.id}`,
            source: 'directus-file',
          };
        }
        return null;
      });
      const raws = [
        createArticle({
          slug: 'test-post',
          featured_image_file: {
            id: 'feat-1',
            title: null,
            description: null,
            width: null,
            height: null,
            modified_on: null,
          },
        }),
      ];
      await normalizeArticles(raws);
      expect(mockAssertNoTokenLeakage).toHaveBeenCalledTimes(1);
      const urlEntries = mockAssertNoTokenLeakage.mock.calls[0]![0] as Array<{
        url: string;
        field: string;
        slug?: string;
      }>;
      expect(urlEntries.some((e) => e.field === 'featured_image')).toBe(true);
    });

    it('logs normalized count and skipped count', async () => {
      console.log('[TEST:normalize] logging counts');
      const raws = [createArticle({ slug: 'good' }), createArticle({ slug: '' })];
      await normalizeArticles(raws);
      const loggerInfo = logger.info as ReturnType<typeof vi.fn>;
      expect(loggerInfo).toHaveBeenCalledWith(expect.stringContaining('1 articles'));
      expect(loggerInfo).toHaveBeenCalledWith(expect.stringContaining('1 skipped'));
    });
  });

  describe('normalizeCategories', () => {
    it('maps name and slug directly', () => {
      console.log('[TEST:normalize] category name and slug');
      const cats = normalizeCategories([createCategory({ name: 'Tech', slug: 'tech' })]);
      expect(cats[0]!.name).toBe('Tech');
      expect(cats[0]!.slug).toBe('tech');
    });

    it('maps description, defaulting null to undefined', () => {
      console.log('[TEST:normalize] category description');
      const cats = normalizeCategories([
        createCategory({ description: 'About tech' }),
        createCategory({ description: null }),
      ]);
      expect(cats[0]!.description).toBe('About tech');
      expect(cats[1]!.description).toBeUndefined();
    });

    it('sets postCount to 0 for all categories', () => {
      console.log('[TEST:normalize] category postCount default');
      const cats = normalizeCategories([
        createCategory(),
        createCategory({ name: 'Design', slug: 'design' }),
      ]);
      expect(cats.every((c) => c.postCount === 0)).toBe(true);
    });

    it('handles empty array', () => {
      console.log('[TEST:normalize] empty categories');
      const cats = normalizeCategories([]);
      expect(cats).toEqual([]);
    });
  });
});
