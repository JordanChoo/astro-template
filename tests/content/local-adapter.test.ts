import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetCollection = vi.fn();

vi.mock('astro:content', () => ({
  getCollection: mockGetCollection,
}));

function makeEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-post',
    collection: 'blog',
    body: '## Introduction\n\nSome content here.',
    data: {
      title: 'Test Post',
      description: 'A test blog post',
      pubDate: new Date('2026-03-15T10:00:00Z'),
      author: { id: 'jane-doe', collection: 'team' },
      image: '/images/test.jpg',
      tags: ['astro', 'testing'],
      categories: ['Technology', 'Tutorials'],
      draft: false,
      ...((overrides.data as Record<string, unknown>) ?? {}),
    },
    ...Object.fromEntries(Object.entries(overrides).filter(([k]) => k !== 'data')),
  };
}

describe('Local content adapter', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    mockGetCollection.mockReset();
  });

  async function importLocal() {
    return import('../../src/lib/content/local');
  }

  describe('getLocalBlogPosts', () => {
    it('maps entry.id to BlogPost.slug', async () => {
      console.log('[TEST:local] slug mapping');
      mockGetCollection.mockResolvedValue([makeEntry({ id: 'my-custom-slug' })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.slug).toBe('my-custom-slug');
    });

    it('maps title, description, pubDate correctly', async () => {
      console.log('[TEST:local] title/description/pubDate mapping');
      const entry = makeEntry();
      mockGetCollection.mockResolvedValue([entry]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();

      expect(posts[0]!.title).toBe('Test Post');
      expect(posts[0]!.description).toBe('A test blog post');
      expect(posts[0]!.pubDate).toEqual(new Date('2026-03-15T10:00:00Z'));
    });

    it('maps entry.body to BlogPost.content', async () => {
      console.log('[TEST:local] content mapping');
      mockGetCollection.mockResolvedValue([makeEntry({ body: '# Hello World' })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.content).toBe('# Hello World');
    });

    it('handles null/undefined body as empty string', async () => {
      console.log('[TEST:local] null body');
      mockGetCollection.mockResolvedValue([makeEntry({ body: undefined })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.content).toBe('');
    });

    it('does NOT set BlogPost.rendered (Astro handles local rendering)', async () => {
      console.log('[TEST:local] rendered is undefined');
      mockGetCollection.mockResolvedValue([makeEntry()]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.rendered).toBeUndefined();
    });

    it('maps string image to ImageMeta with url only', async () => {
      console.log('[TEST:local] image string → ImageMeta');
      mockGetCollection.mockResolvedValue([makeEntry({ data: { image: '/images/hero.jpg' } })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.image).toEqual({ url: '/images/hero.jpg' });
    });

    it('maps undefined image to BlogPost.image = undefined', async () => {
      console.log('[TEST:local] no image');
      mockGetCollection.mockResolvedValue([makeEntry({ data: { image: undefined } })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.image).toBeUndefined();
    });

    it('maps author reference object to author.id string', async () => {
      console.log('[TEST:local] author reference → id');
      mockGetCollection.mockResolvedValue([
        makeEntry({ data: { author: { id: 'john-smith', collection: 'team' } } }),
      ]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.author).toBe('john-smith');
    });

    it('maps string author directly', async () => {
      console.log('[TEST:local] string author');
      mockGetCollection.mockResolvedValue([makeEntry({ data: { author: 'direct-author' } })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.author).toBe('direct-author');
    });

    it('preserves tags array', async () => {
      console.log('[TEST:local] tags preserved');
      mockGetCollection.mockResolvedValue([makeEntry({ data: { tags: ['a', 'b', 'c'] } })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.tags).toEqual(['a', 'b', 'c']);
    });

    it('defaults tags to empty array when undefined', async () => {
      console.log('[TEST:local] tags default');
      mockGetCollection.mockResolvedValue([makeEntry({ data: { tags: undefined } })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.tags).toEqual([]);
    });

    it('preserves categories array', async () => {
      console.log('[TEST:local] categories preserved');
      mockGetCollection.mockResolvedValue([makeEntry({ data: { categories: ['Tech', 'News'] } })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.categories).toEqual(['Tech', 'News']);
    });

    it('maps draft flag to isDraft', async () => {
      console.log('[TEST:local] draft → isDraft');
      mockGetCollection.mockResolvedValue([makeEntry({ data: { draft: true } })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.isDraft).toBe(true);
    });

    it('defaults isDraft to false when draft is undefined', async () => {
      console.log('[TEST:local] isDraft default');
      mockGetCollection.mockResolvedValue([makeEntry({ data: { draft: undefined } })]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.isDraft).toBe(false);
    });

    it('sets sitemapEligible to true for all local posts', async () => {
      console.log('[TEST:local] sitemapEligible always true');
      mockGetCollection.mockResolvedValue([makeEntry()]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts[0]!.sitemapEligible).toBe(true);
    });

    it('filters out drafts in production', async () => {
      console.log('[TEST:local] production draft filtering');
      vi.stubEnv('PROD', true);
      mockGetCollection.mockResolvedValue([
        makeEntry({ id: 'published', data: { draft: false } }),
        makeEntry({ id: 'draft-post', data: { draft: true } }),
      ]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0]!.slug).toBe('published');
    });

    it('includes drafts in development', async () => {
      console.log('[TEST:local] dev includes drafts');
      vi.stubEnv('PROD', false);
      mockGetCollection.mockResolvedValue([
        makeEntry({ id: 'published', data: { draft: false } }),
        makeEntry({ id: 'draft-post', data: { draft: true } }),
      ]);
      const { getLocalBlogPosts } = await importLocal();
      const posts = await getLocalBlogPosts();
      expect(posts).toHaveLength(2);
    });
  });

  describe('getLocalBlogCategories', () => {
    it('derives unique categories from post frontmatter', async () => {
      console.log('[TEST:local] unique categories');
      mockGetCollection.mockResolvedValue([
        makeEntry({ id: 'p1', data: { categories: ['Tech', 'News'] } }),
        makeEntry({ id: 'p2', data: { categories: ['Tech', 'Design'] } }),
      ]);
      const { getLocalBlogCategories } = await importLocal();
      const cats = await getLocalBlogCategories();
      const names = cats.map((c) => c.name);
      expect(names).toContain('Tech');
      expect(names).toContain('News');
      expect(names).toContain('Design');
      expect(cats).toHaveLength(3);
    });

    it('computes correct postCount per category', async () => {
      console.log('[TEST:local] category postCount');
      mockGetCollection.mockResolvedValue([
        makeEntry({ id: 'p1', data: { categories: ['Tech'] } }),
        makeEntry({ id: 'p2', data: { categories: ['Tech'] } }),
        makeEntry({ id: 'p3', data: { categories: ['News'] } }),
      ]);
      const { getLocalBlogCategories } = await importLocal();
      const cats = await getLocalBlogCategories();
      const tech = cats.find((c) => c.name === 'Tech');
      const news = cats.find((c) => c.name === 'News');
      expect(tech!.postCount).toBe(2);
      expect(news!.postCount).toBe(1);
    });

    it('generates slugs from category names', async () => {
      console.log('[TEST:local] category slug generation');
      mockGetCollection.mockResolvedValue([
        makeEntry({ id: 'p1', data: { categories: ['Web Development'] } }),
      ]);
      const { getLocalBlogCategories } = await importLocal();
      const cats = await getLocalBlogCategories();
      expect(cats[0]!.slug).toBe('web-development');
    });

    it('returns empty array when no posts have categories', async () => {
      console.log('[TEST:local] empty categories');
      mockGetCollection.mockResolvedValue([
        makeEntry({ id: 'p1', data: { categories: undefined } }),
      ]);
      const { getLocalBlogCategories } = await importLocal();
      const cats = await getLocalBlogCategories();
      expect(cats).toEqual([]);
    });
  });
});
