/**
 * Related Posts Utility
 *
 * Finds related posts based on shared tags, categories, or deterministic fallback.
 *
 * @module utils/related-posts
 */

import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

/**
 * Simple hash function for deterministic pseudo-random selection
 * Based on djb2 algorithm
 *
 * @param str - String to hash
 * @returns Numeric hash value
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * Counts shared elements between two arrays
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Number of shared elements
 */
function countSharedElements(arr1: string[], arr2: string[]): number {
  const set1 = new Set(arr1.map((s) => s.toLowerCase()));
  return arr2.filter((item) => set1.has(item.toLowerCase())).length;
}

/**
 * Finds related posts based on shared tags and categories
 *
 * Algorithm:
 * 1. Score posts by shared tags (higher priority)
 * 2. Score by shared categories (secondary)
 * 3. Fall back to deterministic pseudo-random selection seeded by slug
 * 4. Returns up to `limit` posts, excluding the current post
 *
 * @param currentPost - The current blog post to find related posts for
 * @param allPosts - Array of all blog posts to search through
 * @param limit - Maximum number of related posts to return (default: 3)
 * @returns Array of related posts, up to the specified limit
 *
 * @example
 * ```typescript
 * const related = getRelatedPosts(currentPost, allPosts, 3);
 * ```
 */
export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit: number = 3
): BlogPost[] {
  // Filter out the current post
  const otherPosts = allPosts.filter((post) => post.id !== currentPost.id);

  if (otherPosts.length === 0) {
    return [];
  }

  const currentTags = currentPost.data.tags;
  const currentCategories = currentPost.data.categories;

  // Score each post based on shared tags and categories
  const scoredPosts = otherPosts.map((post) => {
    const sharedTags = countSharedElements(currentTags, post.data.tags);
    const sharedCategories = countSharedElements(currentCategories, post.data.categories);

    // Tags are weighted more heavily than categories
    // Each shared tag is worth 10 points, each shared category is worth 5 points
    const score = sharedTags * 10 + sharedCategories * 5;

    return { post, score, sharedTags, sharedCategories };
  });

  // Sort by score (descending), then by deterministic pseudo-random for ties
  const currentSlugHash = hashString(currentPost.id);

  scoredPosts.sort((a, b) => {
    // Primary sort: by score (descending)
    if (a.score !== b.score) {
      return b.score - a.score;
    }

    // Secondary sort: deterministic pseudo-random based on combined slug hashes
    const hashA = hashString(a.post.id) ^ currentSlugHash;
    const hashB = hashString(b.post.id) ^ currentSlugHash;
    return hashA - hashB;
  });

  // If no posts have any score (no shared tags or categories),
  // use deterministic pseudo-random selection based on current post slug
  const hasAnyMatches = scoredPosts.some((p) => p.score > 0);

  if (!hasAnyMatches) {
    // Sort purely by deterministic hash
    scoredPosts.sort((a, b) => {
      const hashA = hashString(a.post.id) ^ currentSlugHash;
      const hashB = hashString(b.post.id) ^ currentSlugHash;
      return hashA - hashB;
    });
  }

  // Return up to limit posts
  return scoredPosts.slice(0, limit).map((p) => p.post);
}
