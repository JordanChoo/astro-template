import { getCollection } from 'astro:content';
import type { BlogPost, BlogCategory, Location } from './types.js';

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

export async function getLocalLocations(): Promise<Location[]> {
  const { getSortedLocations } = await import('../../content/locations/locations.schema.js');
  return getSortedLocations().map((loc) => ({
    slug: loc.slug,
    city: loc.city,
    state: loc.state,
    description: loc.description,
    longDescription: loc.longDescription,
    address: loc.address,
    phone: loc.phone,
    coordinates: loc.coordinates,
    operatingHours: loc.operatingHours,
    serviceAreaKeywords: loc.serviceAreaKeywords,
  }));
}
