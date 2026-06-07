import type { DirectusBlogArticle, DirectusBlogCategory } from './types.js';
import type { BlogPost, BlogCategory, ImageMeta } from '../content/types.js';
import { resolveAssetUrl, assertNoTokenLeakage } from './assets.js';
import { renderMarkdown } from './markdown.js';
import { logger } from './logger.js';

function resolveImage(
  raw: DirectusBlogArticle,
  fileKey: 'featured_image_file' | 'og_image_file' | 'twitter_image_file',
  urlKey: 'featured_image' | 'og_image' | 'twitter_image',
  alt?: string
): ImageMeta | undefined {
  const resolved = resolveAssetUrl(raw[fileKey], raw[urlKey], alt);
  return resolved
    ? {
        url: resolved.url,
        alt: resolved.alt,
        width: resolved.width,
        height: resolved.height,
      }
    : undefined;
}

function computeSitemapEligible(robots: string | null, canonicalUrl: string | null): boolean {
  if (robots && /noindex/i.test(robots)) return false;

  if (canonicalUrl && canonicalUrl.startsWith('http')) {
    try {
      const canonical = new URL(canonicalUrl);
      const site = new URL(import.meta.env.SITE ?? 'https://example.com');
      if (canonical.host !== site.host) return false;
    } catch {
      // invalid URL — keep eligible
    }
  }

  return true;
}

export async function normalizeArticle(raw: DirectusBlogArticle): Promise<BlogPost> {
  const pubDate = raw.date_published
    ? new Date(raw.date_published)
    : raw.date_created
      ? new Date(raw.date_created)
      : new Date();

  const content = raw.content ?? '';
  const rendered = content ? await renderMarkdown(content) : undefined;

  const image = resolveImage(raw, 'featured_image_file', 'featured_image', 'Featured image');

  return {
    slug: raw.slug,
    title: raw.title,
    description: raw.short_description ?? '',
    pubDate,
    author: raw.author_slug ?? '',
    content,
    rendered,
    image,
    tags: [],
    categories: raw.category ? [raw.category.name] : [],
    category: raw.category ? { name: raw.category.name, slug: raw.category.slug } : undefined,
    isDraft: raw.status === 'draft',
    seo: {
      titleTag: raw.title_tag ?? undefined,
      metaDescription: raw.meta_description ?? undefined,
      canonicalUrl: raw.canonical_url ?? undefined,
      robots: raw.robots ?? undefined,
    },
    sitemapEligible: computeSitemapEligible(raw.robots, raw.canonical_url),
  };
}

export async function normalizeArticles(raws: DirectusBlogArticle[]): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  const assetUrls: Array<{ url: string; field: string; slug?: string }> = [];

  for (const raw of raws) {
    if (!raw.slug) {
      logger.warn(`Skipping article with missing slug (id: ${raw.id})`);
      continue;
    }

    const post = await normalizeArticle(raw);
    posts.push(post);

    if (post.image) {
      assetUrls.push({ url: post.image.url, field: 'featured_image', slug: raw.slug });
    }

    const ogImage = resolveImage(raw, 'og_image_file', 'og_image', 'OG image');
    if (ogImage) {
      assetUrls.push({ url: ogImage.url, field: 'og_image', slug: raw.slug });
    }

    const twitterImage = resolveImage(raw, 'twitter_image_file', 'twitter_image');
    if (twitterImage) {
      assetUrls.push({ url: twitterImage.url, field: 'twitter_image', slug: raw.slug });
    }
  }

  assertNoTokenLeakage(assetUrls);

  logger.info(`Normalized ${posts.length} articles (${raws.length - posts.length} skipped)`);

  return posts;
}

export function normalizeCategories(raws: DirectusBlogCategory[]): BlogCategory[] {
  return raws.map((raw) => ({
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? undefined,
    postCount: 0,
  }));
}
