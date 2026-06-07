import {
  isDirectusConfigured,
  fetchPublishedArticles,
  fetchCategories,
  fetchPublishedCities,
  isLiveResult,
  normalizeArticles,
  normalizeCategories,
  normalizeCities,
  readCache,
  writeCache,
  logDirectusDiagnostic,
  logger,
  redact,
} from '../directus/index.js';
import type { DirectusBlogArticle, DirectusBlogCategory, DirectusCity } from '../directus/types.js';
import { getLocalBlogPosts, getLocalBlogCategories, getLocalLocations } from './local.js';
import type { BlogPost, BlogCategory, Location } from './types.js';

let postsPromise: Promise<BlogPost[]> | null = null;
let categoriesPromise: Promise<BlogCategory[]> | null = null;

function isDirectusRequired(): boolean {
  const value = import.meta.env.DIRECTUS_REQUIRED as unknown;
  return value === true || value === 'true';
}

async function resolveBlogPosts(): Promise<BlogPost[]> {
  if (!isDirectusConfigured()) {
    logDirectusDiagnostic({ source: 'not-configured' });
    return getLocalBlogPosts();
  }

  const startMs = Date.now();
  const result = await fetchPublishedArticles();

  if (isLiveResult(result)) {
    const posts = await normalizeArticles(result.data);
    writeCache('blog', result.data, result.siteSlug);
    logDirectusDiagnostic({
      source: 'live',
      collections: { blog_articles: posts.length },
      fetchMs: Date.now() - startMs,
      cache: { operation: 'written', path: '.cache/directus-blog.json' },
    });
    return posts;
  }

  if (isDirectusRequired()) {
    throw new Error(`DIRECTUS_REQUIRED is true but CMS is unreachable: ${redact(result.error)}`);
  }

  const cached = readCache<DirectusBlogArticle>('blog');
  if (cached) {
    const posts = await normalizeArticles(cached.data);
    logDirectusDiagnostic({
      source: 'cache',
      collections: { blog_articles: posts.length },
      cache: { operation: 'read' },
    });
    return posts;
  }

  logger.warn('CMS unreachable and no cache — falling back to local content');
  logDirectusDiagnostic({ source: 'local' });
  return getLocalBlogPosts();
}

async function resolveBlogCategories(): Promise<BlogCategory[]> {
  if (!isDirectusConfigured()) {
    return getLocalBlogCategories();
  }

  const result = await fetchCategories();

  if (isLiveResult(result)) {
    const categories = normalizeCategories(result.data);
    writeCache('blog_categories', result.data, result.siteSlug);

    const posts = await getBlogPosts();
    for (const cat of categories) {
      cat.postCount = posts.filter((p) =>
        p.categories.some((c) => c.toLowerCase() === cat.name.toLowerCase())
      ).length;
    }

    return categories;
  }

  const cached = readCache<DirectusBlogCategory>('blog_categories');
  if (cached) {
    const categories = normalizeCategories(cached.data);
    const posts = await getBlogPosts();
    for (const cat of categories) {
      cat.postCount = posts.filter((p) =>
        p.categories.some((c) => c.toLowerCase() === cat.name.toLowerCase())
      ).length;
    }
    return categories;
  }

  return getLocalBlogCategories();
}

export function getBlogPosts(): Promise<BlogPost[]> {
  if (!postsPromise) {
    postsPromise = resolveBlogPosts();
  }
  return postsPromise;
}

export function getBlogCategories(): Promise<BlogCategory[]> {
  if (!categoriesPromise) {
    categoriesPromise = resolveBlogCategories();
  }
  return categoriesPromise;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug);
}

let locationsPromise: Promise<Location[]> | null = null;

async function resolveLocations(): Promise<Location[]> {
  if (!isDirectusConfigured()) {
    logDirectusDiagnostic({ source: 'not-configured' });
    return getLocalLocations();
  }

  const startMs = Date.now();
  const result = await fetchPublishedCities();

  if (isLiveResult(result)) {
    const locations = await normalizeCities(result.data);
    writeCache('locations', result.data, result.siteSlug);
    logDirectusDiagnostic({
      source: 'live',
      collections: { cities: locations.length },
      fetchMs: Date.now() - startMs,
      cache: { operation: 'written', path: '.cache/directus-locations.json' },
    });
    return locations;
  }

  if (isDirectusRequired()) {
    throw new Error(`DIRECTUS_REQUIRED is true but CMS is unreachable: ${redact(result.error)}`);
  }

  const cached = readCache<DirectusCity>('locations');
  if (cached) {
    const locations = await normalizeCities(cached.data);
    logDirectusDiagnostic({
      source: 'cache',
      collections: { cities: locations.length },
      cache: { operation: 'read' },
    });
    return locations;
  }

  logger.warn('CMS unreachable and no cache — falling back to local locations');
  logDirectusDiagnostic({ source: 'local' });
  return getLocalLocations();
}

export function getLocations(): Promise<Location[]> {
  if (!locationsPromise) {
    locationsPromise = resolveLocations();
  }
  return locationsPromise;
}

export async function getLocationBySlug(slug: string): Promise<Location | undefined> {
  const locations = await getLocations();
  return locations.find((l) => l.slug === slug);
}
