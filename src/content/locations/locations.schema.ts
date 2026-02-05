/**
 * Locations Data Schema
 *
 * Zod schema for validating locations.json at build time.
 * Ensures type safety, validates operating hours format, and checks for duplicate slugs.
 *
 * @module content/locations/locations.schema
 */

import { z } from 'zod';
import locationsData from './locations.json';

/** Valid days of the week for operating hours (Schema.org aligned) */
const VALID_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Day of week type */
type DayOfWeek = (typeof VALID_DAYS)[number];

/** 24-hour time format regex (HH:MM from 00:00 to 23:59) */
const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Schema for geographic coordinates
 */
const CoordinatesSchema = z.object({
  /** Latitude (-90 to 90) */
  lat: z.number().min(-90).max(90),
  /** Longitude (-180 to 180) */
  lng: z.number().min(-180).max(180),
});

/**
 * Schema for operating hours entry (Schema.org aligned)
 */
const OperatingHoursEntrySchema = z.object({
  /** Day of the week */
  dayOfWeek: z.enum(VALID_DAYS),
  /** Opening time in 24h format HH:MM (00:00-23:59) */
  open: z.string().regex(TIME_FORMAT_REGEX, 'Open time must be in HH:MM format (00:00-23:59)'),
  /** Closing time in 24h format HH:MM (00:00-23:59) */
  close: z.string().regex(TIME_FORMAT_REGEX, 'Close time must be in HH:MM format (00:00-23:59)'),
});

/**
 * Schema for a single location entry
 */
const LocationSchema = z.object({
  /** URL-friendly slug (unique identifier) */
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  /** City name (preserves accents and special characters) */
  city: z.string().min(1, 'City is required'),
  /** State/Province code */
  state: z.string().min(1, 'State is required'),
  /** Full street address */
  address: z.string().min(1, 'Address is required'),
  /** Phone number (optional - falls back to site config if not provided) */
  phone: z.string().optional(),
  /** Short description for listings */
  description: z.string().min(1, 'Description is required'),
  /** Extended description for detail page */
  longDescription: z.string().min(1, 'Long description is required'),
  /** Geographic coordinates (optional) */
  coordinates: CoordinatesSchema.optional(),
  /** Service area keywords for local SEO */
  serviceAreaKeywords: z
    .array(z.string().min(1, 'Service area keyword cannot be empty'))
    .min(1, 'At least one service area keyword is required'),
  /** Operating hours (optional - can vary by location) */
  operatingHours: z.array(OperatingHoursEntrySchema).optional(),
});

/**
 * Schema for the locations array
 */
export const LocationsDataSchema = z.array(LocationSchema);

/** Inferred TypeScript type for a single location */
export type Location = z.infer<typeof LocationSchema>;

/** Inferred TypeScript type for coordinates */
export type Coordinates = z.infer<typeof CoordinatesSchema>;

/** Inferred TypeScript type for operating hours entry */
export type OperatingHoursEntry = z.infer<typeof OperatingHoursEntrySchema>;

/** Inferred TypeScript type for the locations array */
export type LocationsData = z.infer<typeof LocationsDataSchema>;

/**
 * Validation error thrown when locations data is invalid
 */
export class LocationsValidationError extends Error {
  constructor(message: string) {
    super(`Locations data validation error: ${message}`);
    this.name = 'LocationsValidationError';
  }
}

/**
 * Validates locations.json and checks for duplicate slugs
 *
 * @throws {LocationsValidationError} If validation fails or duplicate slugs exist
 * @returns Validated and typed locations data
 */
function validateLocationsData(): LocationsData {
  // Parse with Zod schema
  const result = LocationsDataSchema.safeParse(locationsData);

  if (!result.success) {
    // Handle both Zod 3 (errors) and Zod 4 (issues) formats
    const issues = 'issues' in result.error ? result.error.issues : result.error.errors;
    const errors = (issues as Array<{ path: (string | number)[]; message: string }>)
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new LocationsValidationError(`Schema validation failed:\n${errors}`);
  }

  // Check for duplicate slugs
  const slugs = result.data.map((location) => location.slug);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);

  if (duplicates.length > 0) {
    const uniqueDuplicates = [...new Set(duplicates)];
    throw new LocationsValidationError(
      `Duplicate slugs found: ${uniqueDuplicates.map((s) => `"${s}"`).join(', ')}. ` +
        'Each location must have a unique slug.'
    );
  }

  return result.data;
}

/**
 * Validated locations data exported for use in components
 *
 * Validation runs at import time during build, failing fast if data is invalid.
 */
export const locations: LocationsData = validateLocationsData();

/**
 * Get locations sorted alphabetically by city, then state
 *
 * @returns Locations sorted by city, then state
 */
export function getSortedLocations(): LocationsData {
  return [...locations].sort((a, b) => {
    // Primary sort by city (alphabetical)
    const cityCompare = a.city.localeCompare(b.city);
    if (cityCompare !== 0) {
      return cityCompare;
    }
    // Secondary sort by state (alphabetical)
    return a.state.localeCompare(b.state);
  });
}

/**
 * Get a single location by slug
 *
 * @param slug - The location slug to find
 * @returns The location if found, undefined otherwise
 */
export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((location) => location.slug === slug);
}

/**
 * Get all location slugs (for static path generation)
 *
 * @returns Array of all location slugs
 */
export function getAllLocationSlugs(): string[] {
  return locations.map((location) => location.slug);
}

/**
 * Format operating hours for Schema.org LocalBusiness
 *
 * Converts internal format to Schema.org openingHours format
 * Example: "Mo-Fr 09:00-17:00", "Sa 10:00-14:00"
 *
 * @param hours - Array of operating hours entries
 * @returns Array of Schema.org formatted opening hours strings
 */
export function formatSchemaOrgHours(hours: OperatingHoursEntry[]): string[] {
  const dayAbbreviations: Record<DayOfWeek, string> = {
    Monday: 'Mo',
    Tuesday: 'Tu',
    Wednesday: 'We',
    Thursday: 'Th',
    Friday: 'Fr',
    Saturday: 'Sa',
    Sunday: 'Su',
  };

  // Group consecutive days with same hours
  const grouped: { days: string[]; open: string; close: string }[] = [];

  for (const entry of hours) {
    const abbr = dayAbbreviations[entry.dayOfWeek];
    const existing = grouped.find((g) => g.open === entry.open && g.close === entry.close);

    if (existing) {
      existing.days.push(abbr);
    } else {
      grouped.push({ days: [abbr], open: entry.open, close: entry.close });
    }
  }

  // Format each group
  return grouped.map((group) => {
    const daysStr =
      group.days.length > 1
        ? `${group.days[0]}-${group.days[group.days.length - 1]}`
        : group.days[0];
    return `${daysStr} ${group.open}-${group.close}`;
  });
}

/**
 * Format operating hours for human-readable display
 *
 * @param hours - Array of operating hours entries
 * @returns Array of formatted display strings (e.g., "Monday: 9:00 AM - 5:00 PM")
 */
export function formatDisplayHours(hours: OperatingHoursEntry[]): string[] {
  /**
   * Convert 24h time to 12h format with AM/PM
   */
  function formatTime(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  return hours.map(
    (entry) => `${entry.dayOfWeek}: ${formatTime(entry.open)} - ${formatTime(entry.close)}`
  );
}

export default locations;
