/**
 * Site Configuration System
 *
 * Centralized configuration for business identity, contact info,
 * social links, SEO defaults, analytics, and operating hours.
 *
 * @module config/site
 */

/** Valid days of the week for operating hours (Schema.org aligned) */
export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

/** Operating hours entry for a single day */
export interface OperatingHoursEntry {
  /** Day of the week */
  dayOfWeek: DayOfWeek;
  /** Opening time in 24h format HH:MM (00:00-23:59) */
  open: string;
  /** Closing time in 24h format HH:MM (00:00-23:59) */
  close: string;
}

/** Physical address structure */
export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

/** Social media links */
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  /** Also used as X */
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

/** SEO configuration */
export interface SeoConfig {
  /** Title template, e.g., "%s | Business Name" */
  titleTemplate: string;
  /** Default meta description */
  defaultDescription: string;
  /** Path to default Open Graph image */
  ogImage?: string;
  /** OG image width (default 1200) */
  ogImageWidth?: number;
  /** OG image height (default 630) */
  ogImageHeight?: number;
  /** Full site URL including https:// */
  siteUrl: string;
}

/** Footer navigation link */
export interface FooterNavItem {
  text: string;
  link: string;
}

/**
 * Main site configuration interface
 *
 * Contains all business identity, contact, social, SEO, and operational settings.
 */
export interface SiteConfig {
  // Business identity
  /** Required - business name */
  name: string;
  /** Optional tagline/slogan */
  tagline?: string;
  /** Required - site description for SEO */
  description: string;
  /** Optional path to logo image */
  logo?: string;

  // Contact info (all optional)
  phone?: string;
  address?: Address;

  // Social links (all optional)
  social?: SocialLinks;

  /** Twitter handle for Twitter cards (without @) */
  twitterHandle?: string;

  /** SEO defaults */
  seo: SeoConfig;

  /** Google Tag Manager ID */
  gtmId?: string;

  /** Operating hours (optional, Schema.org aligned) */
  operatingHours?: OperatingHoursEntry[];

  /** Footer secondary navigation */
  footerNav: FooterNavItem[];
}

/** Valid days of the week for validation */
const VALID_DAYS: readonly DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** 24-hour time format regex (HH:MM from 00:00 to 23:59) */
const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/** URL validation regex for social links (must start with https://) */
const HTTPS_URL_REGEX = /^https:\/\/.+/;

/**
 * Validation error thrown when config is invalid
 */
export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(`Site config validation error: ${message}`);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Validates the site configuration at import time
 *
 * @param config - The site configuration to validate
 * @throws {ConfigValidationError} If required fields are missing or invalid
 */
function validateConfig(config: SiteConfig): void {
  // Validate required fields
  if (!config.name || config.name.trim() === '') {
    throw new ConfigValidationError('name is required and cannot be empty');
  }

  if (!config.description || config.description.trim() === '') {
    throw new ConfigValidationError('description is required and cannot be empty');
  }

  if (!config.seo.siteUrl || config.seo.siteUrl.trim() === '') {
    throw new ConfigValidationError('seo.siteUrl is required and cannot be empty');
  }

  // Validate social URLs (must start with https://)
  if (config.social) {
    const socialEntries = Object.entries(config.social) as [
      keyof SocialLinks,
      string | undefined,
    ][];
    for (const [platform, url] of socialEntries) {
      if (url && !HTTPS_URL_REGEX.test(url)) {
        throw new ConfigValidationError(
          `social.${platform} URL must start with https:// (got: ${url})`
        );
      }
    }
  }

  // Validate operating hours
  if (config.operatingHours) {
    for (const entry of config.operatingHours) {
      // Validate day of week
      if (!VALID_DAYS.includes(entry.dayOfWeek)) {
        throw new ConfigValidationError(
          `Invalid dayOfWeek "${entry.dayOfWeek}". Must be one of: ${VALID_DAYS.join(', ')}`
        );
      }

      // Validate open time format
      if (!TIME_FORMAT_REGEX.test(entry.open)) {
        throw new ConfigValidationError(
          `Invalid open time "${entry.open}" for ${entry.dayOfWeek}. Must be in HH:MM format (00:00-23:59)`
        );
      }

      // Validate close time format
      if (!TIME_FORMAT_REGEX.test(entry.close)) {
        throw new ConfigValidationError(
          `Invalid close time "${entry.close}" for ${entry.dayOfWeek}. Must be in HH:MM format (00:00-23:59)`
        );
      }
    }
  }

  // Warn for missing optional but recommended fields
  if (!config.logo) {
    console.warn(
      '[Site Config] Warning: logo is not set. Consider adding a logo for brand identity.'
    );
  }

  if (!config.phone) {
    console.warn(
      '[Site Config] Warning: phone is not set. Consider adding a phone number for contact.'
    );
  }

  if (!config.address) {
    console.warn(
      '[Site Config] Warning: address is not set. Consider adding an address for local SEO.'
    );
  }
}

/**
 * Site configuration with demo data for Acme Services
 *
 * Replace these values with your actual business information.
 */
const siteConfig: SiteConfig = {
  // Business identity
  name: 'Acme Services',
  tagline: 'Quality Solutions for Modern Problems',
  description:
    'Acme Services provides professional business solutions including consulting, implementation, and support services for companies of all sizes.',
  logo: '/images/logo.svg',

  // Contact info
  phone: '(555) 123-4567',
  address: {
    street: '123 Main Street',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
  },

  // Social links
  social: {
    facebook: 'https://facebook.com/acmeservices',
    instagram: 'https://instagram.com/acmeservices',
    twitter: 'https://twitter.com/acmeservices',
    linkedin: 'https://linkedin.com/company/acmeservices',
    youtube: 'https://youtube.com/@acmeservices',
  },

  // Twitter handle for Twitter cards
  twitterHandle: 'acmeservices',

  // SEO defaults
  seo: {
    titleTemplate: '%s | Acme Services',
    defaultDescription:
      'Acme Services provides professional business solutions including consulting, implementation, and support services.',
    ogImage: '/images/og-default.jpg',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    siteUrl: 'https://acmeservices.example.com',
  },

  // Google Tag Manager (placeholder)
  gtmId: 'GTM-XXXXXXX',

  // Operating hours (Mon-Fri 9-5, Sat 10-2)
  operatingHours: [
    { dayOfWeek: 'Monday', open: '09:00', close: '17:00' },
    { dayOfWeek: 'Tuesday', open: '09:00', close: '17:00' },
    { dayOfWeek: 'Wednesday', open: '09:00', close: '17:00' },
    { dayOfWeek: 'Thursday', open: '09:00', close: '17:00' },
    { dayOfWeek: 'Friday', open: '09:00', close: '17:00' },
    { dayOfWeek: 'Saturday', open: '10:00', close: '14:00' },
  ],

  // Footer navigation
  footerNav: [
    { text: 'Privacy Policy', link: '/privacy' },
    { text: 'Terms of Service', link: '/terms' },
  ],
};

// Run validation at import time
validateConfig(siteConfig);

// Export the config as default and the type
export default siteConfig;
export type { SiteConfig };
