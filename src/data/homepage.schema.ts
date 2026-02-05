/**
 * Homepage Data Schema
 *
 * Zod schema for validating homepage.json at build time.
 * Contains all homepage section data with full type safety.
 *
 * @module data/homepage.schema
 */

import { z } from 'zod';
import homepageData from './homepage.json';

/**
 * CTA (Call to Action) button schema
 */
const CTAButtonSchema = z.object({
  /** Button text */
  text: z.string().min(1, 'CTA text is required'),
  /** Link destination */
  link: z.string().min(1, 'CTA link is required'),
});

/**
 * Hero section schema
 */
const HeroSchema = z.object({
  /** Main headline */
  headline: z.string().min(1, 'Headline is required'),
  /** Supporting subheadline */
  subheadline: z.string().min(1, 'Subheadline is required'),
  /** Primary call to action */
  cta: CTAButtonSchema,
});

/**
 * Feature item schema
 */
const FeatureSchema = z.object({
  /** Icon key (maps to icon component) */
  icon: z.string().min(1, 'Icon key is required'),
  /** Feature title */
  title: z.string().min(1, 'Feature title is required'),
  /** Feature description */
  description: z.string().min(1, 'Feature description is required'),
});

/**
 * Stat item schema
 */
const StatSchema = z.object({
  /** Stat value (e.g., "500+", "99%") */
  value: z.string().min(1, 'Stat value is required'),
  /** Stat label */
  label: z.string().min(1, 'Stat label is required'),
});

/**
 * Testimonial item schema
 */
const TestimonialSchema = z.object({
  /** Customer quote */
  quote: z.string().min(1, 'Quote is required'),
  /** Customer name */
  name: z.string().min(1, 'Name is required'),
  /** Optional attribution (e.g., job title, company) */
  attribution: z.string().optional(),
});

/**
 * CTA section schema
 */
const CTASectionSchema = z.object({
  /** Section headline */
  headline: z.string().min(1, 'CTA headline is required'),
  /** Button configuration */
  button: CTAButtonSchema,
});

/**
 * FAQ item schema
 */
const FAQItemSchema = z.object({
  /** Question text */
  question: z.string().min(1, 'Question is required'),
  /** Answer text */
  answer: z.string().min(1, 'Answer is required'),
});

/**
 * Main homepage data schema
 */
export const HomepageDataSchema = z.object({
  /** Hero section */
  hero: HeroSchema,
  /** Features list */
  features: z.array(FeatureSchema),
  /** Stats list */
  stats: z.array(StatSchema),
  /** Testimonials list */
  testimonials: z.array(TestimonialSchema),
  /** CTA section */
  cta: CTASectionSchema,
  /** FAQ items */
  faq: z.array(FAQItemSchema),
  /** Whether to show contact info section */
  showContact: z.boolean(),
});

/** Inferred TypeScript type from the schema */
export type HomepageData = z.infer<typeof HomepageDataSchema>;

/** Inferred type for hero section */
export type HeroData = z.infer<typeof HeroSchema>;

/** Inferred type for feature items */
export type FeatureItem = z.infer<typeof FeatureSchema>;

/** Inferred type for stat items */
export type StatItem = z.infer<typeof StatSchema>;

/** Inferred type for testimonial items */
export type TestimonialItem = z.infer<typeof TestimonialSchema>;

/** Inferred type for CTA section */
export type CTAData = z.infer<typeof CTASectionSchema>;

/** Inferred type for FAQ items */
export type FAQItem = z.infer<typeof FAQItemSchema>;

/** Inferred type for CTA button */
export type CTAButton = z.infer<typeof CTAButtonSchema>;

/**
 * Validates homepage.json and returns typed data
 *
 * @throws {Error} If validation fails
 * @returns Validated and typed homepage data
 */
function validateHomepageData(): HomepageData {
  const result = HomepageDataSchema.safeParse(homepageData);

  if (!result.success) {
    // Handle both Zod 3 (errors) and Zod 4 (issues) formats
    const issues = 'issues' in result.error ? result.error.issues : result.error.errors;
    const errors = (issues as Array<{ path: (string | number)[]; message: string }>)
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(`Homepage data validation failed:\n${errors}`);
  }

  return result.data;
}

/**
 * Validated homepage data exported for use in components
 *
 * Validation runs at import time during build, failing fast if data is invalid.
 */
export const homepage: HomepageData = validateHomepageData();

export default homepage;
