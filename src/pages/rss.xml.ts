/**
 * RSS Feed Endpoint
 *
 * Generates an RSS feed for the blog with the 25 most recent non-draft posts.
 * Includes title, description (as excerpt), link, pubDate, author, and categories.
 *
 * @see https://docs.astro.build/en/guides/rss/
 */

import rss from '@astrojs/rss';
import { getCollection, getEntry } from 'astro:content';
import type { APIContext } from 'astro';
import siteConfig from '@/config/site';

/** Maximum number of posts to include in the feed */
const MAX_ITEMS = 25;

export async function GET(context: APIContext) {
  // Get all blog posts
  const allPosts = await getCollection('blog');

  // Filter out drafts (RSS should only include published content)
  const publishedPosts = allPosts.filter((post) => !post.data.draft);

  // Sort by publication date (newest first)
  const sortedPosts = publishedPosts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  // Take only the most recent posts
  const recentPosts = sortedPosts.slice(0, MAX_ITEMS);

  // Fetch author data for each post
  const postsWithAuthors = await Promise.all(
    recentPosts.map(async (post) => {
      const author = await getEntry(post.data.author);
      return {
        post,
        authorName: author?.data.name ?? 'Unknown Author',
      };
    })
  );

  return rss({
    // RSS channel metadata
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site ?? siteConfig.seo.siteUrl,

    // RSS items from blog posts
    items: postsWithAuthors.map(({ post, authorName }) => ({
      title: post.data.title,
      // Use description as excerpt
      description: post.data.description,
      // Link to the full post
      link: `/blog/${post.id}/`,
      // Publication date
      pubDate: post.data.pubDate,
      // Author name
      author: authorName,
      // Categories (combined tags and categories)
      categories: [...post.data.categories, ...post.data.tags],
    })),

    // Custom XML options
    customData: `<language>en-us</language>`,
  });
}
