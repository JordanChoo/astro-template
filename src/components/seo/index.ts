/**
 * SEO Components Index
 *
 * Re-exports all JSON-LD schema components for convenient imports.
 *
 * @example
 * ```astro
 * ---
 * import { OrganizationLD, WebSiteLD, BreadcrumbLD } from '@/components/seo';
 * ---
 * ```
 *
 * Available Components:
 * - OrganizationLD - Organization schema from site config
 * - WebSiteLD - WebSite schema from site config
 * - BlogPostingLD - BlogPosting schema for blog posts
 * - ServiceLD - Service/ProfessionalService schema
 * - LocalBusinessLD - LocalBusiness schema for locations
 * - BreadcrumbLD - BreadcrumbList schema for navigation
 * - FAQLD - FAQPage schema for FAQ sections
 */

// Note: Astro components are imported directly in .astro files
// This file serves as documentation and type re-exports

// Re-export types for TypeScript consumers
export type { Props as BlogPostingProps, BlogPostAuthor } from './BlogPostingLD.astro';
export type { Props as ServiceProps } from './ServiceLD.astro';
export type {
  Props as LocalBusinessProps,
  LocalBusinessAddress,
  GeoCoordinates,
} from './LocalBusinessLD.astro';
export type { Props as BreadcrumbProps, BreadcrumbItem } from './BreadcrumbLD.astro';
export type { Props as FAQProps, FAQItem } from './FAQLD.astro';
