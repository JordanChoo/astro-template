import type {
  DirectusBlogArticle,
  DirectusBlogCategory,
  DirectusCity,
  DirectusFile,
  DirectusFetchOutcome,
} from '../../src/lib/directus/types';
import type { BlogPost, BlogCategory, Location, ImageMeta } from '../../src/lib/content/types';

export function createDirectusFile(overrides?: Partial<DirectusFile>): DirectusFile {
  return {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    title: 'Featured Image',
    description: 'A sample featured image',
    width: 1200,
    height: 630,
    modified_on: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

export function createCategory(overrides?: Partial<DirectusBlogCategory>): DirectusBlogCategory {
  return {
    id: 'cat-001',
    name: 'Technology',
    slug: 'technology',
    description: 'Articles about technology',
    sort: 1,
    ...overrides,
  };
}

export function createArticle(overrides?: Partial<DirectusBlogArticle>): DirectusBlogArticle {
  return {
    id: 'art-001',
    status: 'published',
    date_created: '2026-01-10T08:00:00Z',
    date_updated: '2026-01-12T14:30:00Z',
    date_published: '2026-01-11T09:00:00Z',
    title: 'Getting Started with Astro',
    slug: 'getting-started-with-astro',
    short_description: 'Learn how to build fast static sites with Astro.',
    content:
      '## Introduction\n\nAstro is a modern static site generator.\n\n## Features\n\n- Fast builds\n- Zero JS by default\n- Component islands',
    author_slug: 'jane-doe',
    category: createCategory(),
    featured_image_file: createDirectusFile(),
    featured_image: null,
    og_image_file: null,
    og_image: null,
    twitter_image_file: null,
    twitter_image: null,
    ai_key_takeaways: null,
    source_links: null,
    title_tag: null,
    meta_description: null,
    canonical_url: null,
    robots: null,
    ...overrides,
  };
}

export function createCity(overrides?: Partial<DirectusCity>): DirectusCity {
  return {
    id: 'city-001',
    status: 'published',
    date_created: '2026-01-05T08:00:00Z',
    date_updated: '2026-01-06T10:00:00Z',
    city_name: 'Austin',
    slug: 'austin',
    state_code: 'TX',
    heading: 'Expert Services in Austin, TX',
    short_description: 'Professional services in the Austin metropolitan area.',
    content: '## About Austin\n\nAustin is the capital of Texas and a growing tech hub.',
    featured_image_file: null,
    featured_image: null,
    address: '123 Main St, Austin, TX 78701',
    phone: '(512) 555-0100',
    latitude: 30.2672,
    longitude: -97.7431,
    service_area_keywords: ['Austin', 'Round Rock', 'Cedar Park'],
    key_statistics: [{ text: '500+ projects completed' }, { text: '98% client satisfaction' }],
    questions_answers: [
      {
        question: 'What areas do you serve?',
        answer: 'We serve the greater Austin metropolitan area.',
      },
    ],
    title_tag: null,
    meta_description: null,
    canonical_url: null,
    robots: null,
    ...overrides,
  };
}

export function createMalformedArticle(
  overrides?: Partial<DirectusBlogArticle>
): DirectusBlogArticle {
  return createArticle({
    date_published: null,
    slug: '',
    content: null,
    category: null,
    featured_image_file: null,
    author_slug: null,
    ...overrides,
  });
}

export function createFetchOutcome<T>(data: T[], siteSlug = 'test-site'): DirectusFetchOutcome<T> {
  return {
    data,
    source: 'live',
    siteSlug,
    fetchedAt: '2026-01-15T10:00:00Z',
  };
}

export function createFetchError<T>(
  error: string,
  siteSlug = 'test-site'
): DirectusFetchOutcome<T> {
  return {
    error,
    source: 'error',
    siteSlug,
  };
}

export function createImageMeta(overrides?: Partial<ImageMeta>): ImageMeta {
  return {
    url: 'https://example.com/assets/f47ac10b-58cc-4372-a567-0e02b2c3d479',
    alt: 'A sample image',
    width: 1200,
    height: 630,
    ...overrides,
  };
}

export function createBlogPost(overrides?: Partial<BlogPost>): BlogPost {
  return {
    slug: 'getting-started-with-astro',
    title: 'Getting Started with Astro',
    description: 'Learn how to build fast static sites with Astro.',
    pubDate: new Date('2026-01-11T09:00:00Z'),
    author: 'jane-doe',
    tags: ['astro', 'web-development'],
    categories: ['technology'],
    content:
      '## Introduction\n\nAstro is a modern static site generator.\n\n## Features\n\n- Fast builds\n- Zero JS by default',
    sitemapEligible: true,
    isDraft: false,
    ...overrides,
  };
}

export function createBlogCategory(overrides?: Partial<BlogCategory>): BlogCategory {
  return {
    name: 'Technology',
    slug: 'technology',
    postCount: 5,
    ...overrides,
  };
}

export function createLocation(overrides?: Partial<Location>): Location {
  return {
    slug: 'austin',
    city: 'Austin',
    state: 'TX',
    description: 'Professional services in the Austin metropolitan area.',
    ...overrides,
  };
}
