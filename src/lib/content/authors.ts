import { getEntry } from 'astro:content';

export interface ResolvedAuthor {
  name: string;
  slug: string;
  avatar?: string | undefined;
  bio?: string | undefined;
  role?: string | undefined;
}

const cache = new Map<string, ResolvedAuthor | null>();

export async function resolveAuthor(slug: string): Promise<ResolvedAuthor | null> {
  if (cache.has(slug)) {
    return cache.get(slug)!;
  }

  const entry = await getEntry('team', slug);
  if (!entry) {
    cache.set(slug, null);
    return null;
  }

  const resolved: ResolvedAuthor = {
    name: entry.data.name,
    slug: entry.data.slug,
    avatar: entry.data.avatar,
    bio: entry.data.bio,
    role: entry.data.role,
  };
  cache.set(slug, resolved);
  return resolved;
}

const FALLBACK_AUTHOR: ResolvedAuthor = { name: 'Unknown Author', slug: '' };

export async function resolveAuthorOrFallback(slug: string | undefined): Promise<ResolvedAuthor> {
  if (!slug) return FALLBACK_AUTHOR;
  const author = await resolveAuthor(slug);
  return author ?? { ...FALLBACK_AUTHOR, slug };
}
