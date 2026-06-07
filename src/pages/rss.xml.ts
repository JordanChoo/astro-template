/**
 * RSS Feed Endpoint
 *
 * Generates an RSS feed for the blog with the 25 most recent published posts.
 * Includes title, description, link, pubDate, author, and categories.
 *
 * @see https://docs.astro.build/en/guides/rss/
 */

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import siteConfig from '@/config/site';
import { getBlogPosts } from '@/lib/content/provider';
import { resolveAuthorOrFallback } from '@/lib/content/authors';

const MAX_ITEMS = 25;

export async function GET(context: APIContext) {
  const allPosts = await getBlogPosts();

  const eligiblePosts = allPosts.filter((post) => !post.isDraft && post.sitemapEligible);

  const sortedPosts = [...eligiblePosts].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  const recentPosts = sortedPosts.slice(0, MAX_ITEMS);

  const postsWithAuthors = await Promise.all(
    recentPosts.map(async (post) => ({
      post,
      authorName: (await resolveAuthorOrFallback(post.author)).name,
    }))
  );

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site ?? siteConfig.seo.siteUrl,

    items: postsWithAuthors.map(({ post, authorName }) => ({
      title: post.title,
      description: post.description,
      link: `/blog/${post.slug}/`,
      pubDate: post.pubDate,
      author: authorName,
      categories: [...post.categories, ...post.tags],
      ...(post.rendered?.html ? { content: post.rendered.html } : {}),
    })),

    customData: `<language>en-us</language>`,
  });
}
