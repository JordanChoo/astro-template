/**
 * Services Data Schema
 *
 * Zod schema for validating services.json at build time.
 * Ensures type safety and validates all service entries.
 *
 * @module content/services/services.schema
 */

import { z } from 'zod';
import servicesData from './services.json';

/**
 * Schema for a service feature item
 */
const FeatureSchema = z.object({
  /** Feature title */
  title: z.string().min(1, 'Feature title is required'),
  /** Feature description */
  description: z.string().min(1, 'Feature description is required'),
});

/**
 * Schema for the call-to-action
 */
const CTASchema = z.object({
  /** CTA button text */
  text: z.string().min(1, 'CTA text is required'),
  /** CTA link URL */
  link: z.string().min(1, 'CTA link is required'),
});

/**
 * Schema for a single service entry
 */
const ServiceSchema = z.object({
  /** URL-friendly slug (unique identifier) */
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  /** Service title for display */
  title: z.string().min(1, 'Title is required'),
  /** Short description for listings */
  description: z.string().min(1, 'Description is required'),
  /** Extended description for detail page (plain text) */
  longDescription: z.string().min(1, 'Long description is required'),
  /** Icon key from the icons registry */
  icon: z.string().min(1, 'Icon key is required'),
  /** List of service features */
  features: z.array(FeatureSchema).min(1, 'At least one feature is required'),
  /** Call-to-action configuration */
  cta: CTASchema,
  /** Sort order (lower numbers appear first) */
  order: z.number().int().min(0, 'Order must be a non-negative integer'),
});

/**
 * Schema for the services array
 */
export const ServicesDataSchema = z.array(ServiceSchema);

/** Inferred TypeScript type for a single service */
export type Service = z.infer<typeof ServiceSchema>;

/** Inferred TypeScript type for a service feature */
export type ServiceFeature = z.infer<typeof FeatureSchema>;

/** Inferred TypeScript type for service CTA */
export type ServiceCTA = z.infer<typeof CTASchema>;

/** Inferred TypeScript type for the services array */
export type ServicesData = z.infer<typeof ServicesDataSchema>;

/**
 * Validation error thrown when services data is invalid
 */
export class ServicesValidationError extends Error {
  constructor(message: string) {
    super(`Services data validation error: ${message}`);
    this.name = 'ServicesValidationError';
  }
}

/**
 * Validates services.json and checks for duplicate slugs
 *
 * @throws {ServicesValidationError} If validation fails or duplicate slugs exist
 * @returns Validated and typed services data
 */
function validateServicesData(): ServicesData {
  // Parse with Zod schema
  const result = ServicesDataSchema.safeParse(servicesData);

  if (!result.success) {
    // Handle both Zod 3 (errors) and Zod 4 (issues) formats
    const issues = 'issues' in result.error ? result.error.issues : result.error.errors;
    const errors = (issues as Array<{ path: (string | number)[]; message: string }>)
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new ServicesValidationError(`Schema validation failed:\n${errors}`);
  }

  // Check for duplicate slugs
  const slugs = result.data.map((service) => service.slug);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);

  if (duplicates.length > 0) {
    const uniqueDuplicates = [...new Set(duplicates)];
    throw new ServicesValidationError(
      `Duplicate slugs found: ${uniqueDuplicates.map((s) => `"${s}"`).join(', ')}. ` +
        'Each service must have a unique slug.'
    );
  }

  return result.data;
}

/**
 * Validated services data exported for use in components
 *
 * Validation runs at import time during build, failing fast if data is invalid.
 */
export const services: ServicesData = validateServicesData();

/**
 * Get services sorted by order (ascending), with alphabetical tie-breaking by title
 *
 * @returns Services sorted by order, then alphabetically by title
 */
export function getSortedServices(): ServicesData {
  return [...services].sort((a, b) => {
    // Primary sort by order (ascending)
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    // Secondary sort by title (alphabetical)
    return a.title.localeCompare(b.title);
  });
}

/**
 * Get a single service by slug
 *
 * @param slug - The service slug to find
 * @returns The service if found, undefined otherwise
 */
export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

/**
 * Get all service slugs (for static path generation)
 *
 * @returns Array of all service slugs
 */
export function getAllServiceSlugs(): string[] {
  return services.map((service) => service.slug);
}

export default services;
