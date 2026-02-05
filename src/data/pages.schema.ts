/**
 * Pages Data Schema
 *
 * Zod schema for validating pages.json at build time.
 * Contains SEO metadata for listing pages and taxonomy archives.
 *
 * @module data/pages.schema
 */

import { z } from 'zod';
import pagesData from './pages.json';

/**
 * Schema for a single page's SEO metadata
 */
const PageMetaSchema = z.object({
  /** Page title (used in title tag and og:title) */
  title: z.string().min(1, 'Title is required'),
  /** Meta description (should be under 160 characters for optimal SEO) */
  description: z.string().min(1, 'Description is required'),
});

/**
 * Schema for taxonomy page templates (tags, categories)
 */
const TaxonomyTemplateSchema = z.object({
  /** Title template with %s placeholder for the taxonomy term */
  titleTemplate: z
    .string()
    .min(1, 'Title template is required')
    .refine((val) => val.includes('%s'), {
      message: 'Title template must include %s placeholder',
    }),
  /** Description template with %s placeholder for the taxonomy term */
  descriptionTemplate: z
    .string()
    .min(1, 'Description template is required')
    .refine((val) => val.includes('%s'), {
      message: 'Description template must include %s placeholder',
    }),
});

/**
 * Main pages data schema
 */
export const PagesDataSchema = z.object({
  /** Listing pages (blog, services, locations, team) */
  listings: z.object({
    blog: PageMetaSchema,
    services: PageMetaSchema,
    locations: PageMetaSchema,
    team: PageMetaSchema,
  }),
  /** Taxonomy archive pages */
  taxonomies: z.object({
    tags: TaxonomyTemplateSchema,
    categories: TaxonomyTemplateSchema,
  }),
});

/** Inferred TypeScript type from the schema */
export type PagesData = z.infer<typeof PagesDataSchema>;

/** Inferred type for page metadata */
export type PageMeta = z.infer<typeof PageMetaSchema>;

/** Inferred type for taxonomy templates */
export type TaxonomyTemplate = z.infer<typeof TaxonomyTemplateSchema>;

/**
 * Validates pages.json and returns typed data
 *
 * @throws {Error} If validation fails
 * @returns Validated and typed pages data
 */
function validatePagesData(): PagesData {
  const result = PagesDataSchema.safeParse(pagesData);

  if (!result.success) {
    // Handle both Zod 3 (errors) and Zod 4 (issues) formats
    const issues = 'issues' in result.error ? result.error.issues : result.error.errors;
    const errors = (issues as Array<{ path: (string | number)[]; message: string }>)
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(`Pages data validation failed:\n${errors}`);
  }

  return result.data;
}

/**
 * Validated pages data exported for use in components
 *
 * Validation runs at import time during build, failing fast if data is invalid.
 */
export const pages: PagesData = validatePagesData();

/**
 * Helper to get listing page metadata by key
 *
 * @param key - The listing page key (blog, services, locations, team)
 * @returns Page metadata or undefined if not found
 */
export function getListingMeta(key: keyof PagesData['listings']): PageMeta {
  return pages.listings[key];
}

/**
 * Helper to generate taxonomy page title from template
 *
 * @param type - The taxonomy type (tags or categories)
 * @param term - The taxonomy term to insert
 * @returns Formatted title string
 */
export function getTaxonomyTitle(type: keyof PagesData['taxonomies'], term: string): string {
  return pages.taxonomies[type].titleTemplate.replace('%s', term);
}

/**
 * Helper to generate taxonomy page description from template
 *
 * @param type - The taxonomy type (tags or categories)
 * @param term - The taxonomy term to insert
 * @returns Formatted description string
 */
export function getTaxonomyDescription(type: keyof PagesData['taxonomies'], term: string): string {
  return pages.taxonomies[type].descriptionTemplate.replace('%s', term);
}

export default pages;
