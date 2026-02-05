/**
 * Icon Library
 *
 * Centralized icon definitions using SVG path data.
 * Icons are Heroicons-style (24x24 viewBox, stroke-based).
 *
 * @module components/icons
 */

export interface IconDefinition {
  /** SVG path data (d attribute) */
  path: string;
  /** Optional second path for multi-path icons */
  path2?: string;
  /** Stroke linecap (default: round) */
  strokeLinecap?: 'round' | 'butt' | 'square';
  /** Stroke linejoin (default: round) */
  strokeLinejoin?: 'round' | 'miter' | 'bevel';
}

/**
 * Icon registry mapping icon keys to their SVG definitions
 */
export const icons: Record<string, IconDefinition> = {
  // Shield - trust/security
  shield: {
    path: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  },

  // Users - team/people
  users: {
    path: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  },

  // Clock - time/availability
  clock: {
    path: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },

  // Phone - contact
  phone: {
    path: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
  },

  // Chart - analytics/data
  chart: {
    path: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },

  // Lightning bolt - speed/fast
  lightning: {
    path: 'm3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  },

  // Cog - settings/custom
  cog: {
    path: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z',
    path2: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },

  // Check circle - success/complete
  check: {
    path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },

  // Star - rating/featured
  star: {
    path: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
  },

  // Map pin - location
  mapPin: {
    path: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z',
    path2: 'M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
  },

  // Mail - email/contact
  mail: {
    path: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  },

  // Building - office/business
  building: {
    path: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
  },

  // Chevron down - expand/collapse
  chevronDown: {
    path: 'm19.5 8.25-7.5 7.5-7.5-7.5',
  },

  // Arrow right - navigation
  arrowRight: {
    path: 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3',
  },

  // Quote - testimonial
  quote: {
    path: 'M7.5 8.25h9m-9 3h9m-9 3h6M3 5.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 5.25v10.5a2.25 2.25 0 01-2.25 2.25h-3.75l-3 3-3-3H5.25A2.25 2.25 0 013 15.75V5.25z',
  },
};

/**
 * Get an icon definition by key
 *
 * @param key - The icon key to look up
 * @returns The icon definition or undefined if not found
 */
export function getIcon(key: string): IconDefinition | undefined {
  return icons[key];
}

/**
 * Check if an icon exists
 *
 * @param key - The icon key to check
 * @returns True if the icon exists
 */
export function hasIcon(key: string): boolean {
  return key in icons;
}

/**
 * Get all available icon keys
 *
 * @returns Array of all icon keys
 */
export function getIconKeys(): string[] {
  return Object.keys(icons);
}

/**
 * Placeholder icon path (question mark circle) used when icon key is not found
 */
const PLACEHOLDER_PATH =
  'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z';

/**
 * Renders an IconDefinition to an SVG string
 *
 * @param iconDef - The icon definition to render
 * @returns SVG element string
 */
function renderIconToSvg(iconDef: IconDefinition): string {
  const linecap = iconDef.strokeLinecap || 'round';
  const linejoin = iconDef.strokeLinejoin || 'round';

  let paths = `<path stroke-linecap="${linecap}" stroke-linejoin="${linejoin}" d="${iconDef.path}" />`;

  if (iconDef.path2) {
    paths += `<path stroke-linecap="${linecap}" stroke-linejoin="${linejoin}" d="${iconDef.path2}" />`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">${paths}</svg>`;
}

/**
 * Get an icon SVG string by key, with fallback to a placeholder icon
 *
 * @param key - The icon key to look up
 * @returns SVG element string for the icon or placeholder
 */
export function getIconOrPlaceholder(key: string): string {
  const iconDef = icons[key];

  if (iconDef) {
    return renderIconToSvg(iconDef);
  }

  // Return placeholder icon if key not found
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="${PLACEHOLDER_PATH}" /></svg>`;
}

/**
 * Renders an icon to SVG string by key
 *
 * @param key - The icon key to render
 * @returns SVG element string or undefined if not found
 */
export function renderIcon(key: string): string | undefined {
  const iconDef = icons[key];
  if (!iconDef) return undefined;
  return renderIconToSvg(iconDef);
}

export default icons;
