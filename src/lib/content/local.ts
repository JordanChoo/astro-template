import { getCollection } from 'astro:content';
import type { BlogPost, BlogCategory } from './types.js';

export async function getLocalBlogPosts(): Promise<BlogPost[]> {
  const entries = await getCollection('blog');
  const isProduction = import.meta.env.PROD;

  return entries
    .filter((entry) => !isProduction || !entry.data.draft)
    .map((entry) => ({
      slug: entry.id,
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      author: typeof entry.data.author === 'string' ? entry.data.author : entry.data.author.id,
      content: entry.body ?? '',
      image: entry.data.image ? { url: entry.data.image } : undefined,
      tags: entry.data.tags ?? [],
      categories: entry.data.categories ?? [],
      isDraft: entry.data.draft ?? false,
      sitemapEligible: true,
    }));
}

export async function getLocalBlogCategories(): Promise<BlogCategory[]> {
  const posts = await getLocalBlogPosts();
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const cat of post.categories) {
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([name, postCount]) => ({
    name,
    slug: name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, ''),
    postCount,
  }));
}
