/**
 * Astro Content Collections Configuration
 *
 * Defines the schema for blog posts and team members using Zod.
 * Uses Astro 5.x content collections API with the content loader.
 *
 * @see https://docs.astro.build/en/guides/content-collections/
 */

import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Social links schema for team members
 */
const socialSchema = z.object({
  twitter: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
});

/**
 * Team member collection schema
 *
 * Defines authors/team members that can be referenced by blog posts.
 */
const team = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/team' }),
  schema: z.object({
    /** Full name of the team member */
    name: z.string(),
    /** URL-friendly slug for the team member */
    slug: z.string(),
    /** Short biography */
    bio: z.string(),
    /** Path to avatar image */
    avatar: z.string(),
    /** Job title or role */
    role: z.string(),
    /** Social media links (optional) */
    social: socialSchema.optional(),
  }),
});

/**
 * Blog post collection schema
 *
 * Defines the structure for blog posts with frontmatter validation.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    /** Post title */
    title: z.string(),
    /** Short description/excerpt for SEO and listings */
    description: z.string(),
    /** Publication date */
    pubDate: z.coerce.date(),
    /** Reference to author from team collection */
    author: reference('team'),
    /** Featured image path (optional) */
    image: z.string().optional(),
    /** Array of tags for categorization */
    tags: z.array(z.string()).default([]),
    /** Array of categories */
    categories: z.array(z.string()).default([]),
    /** Draft status - drafts are hidden in production */
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
  team,
};
