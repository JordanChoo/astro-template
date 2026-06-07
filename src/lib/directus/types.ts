export interface DirectusFile {
  id: string;
  title: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  modified_on: string | null;
}

export interface DirectusBlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort: number | null;
}

export interface DirectusBlogArticle {
  id: string;
  status: string;
  date_created: string | null;
  date_updated: string | null;
  date_published: string | null;
  title: string;
  slug: string;
  short_description: string | null;
  content: string | null;
  author_slug: string | null;
  category: DirectusBlogCategory | null;
  featured_image_file: DirectusFile | null;
  featured_image: string | null;
  og_image_file: DirectusFile | null;
  og_image: string | null;
  twitter_image_file: DirectusFile | null;
  twitter_image: string | null;
  ai_key_takeaways: Array<{ text: string }> | null;
  source_links: string[] | null;
  title_tag: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots: string | null;
}

export interface DirectusCity {
  id: string;
  status: string;
  date_created: string | null;
  date_updated: string | null;
  city_name: string;
  slug: string;
  state_code: string | null;
  heading: string | null;
  short_description: string | null;
  content: string | null;
  featured_image_file: DirectusFile | null;
  featured_image: string | null;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  service_area_keywords: string[] | null;
  key_statistics: Array<{ text: string }> | null;
  questions_answers: Array<{ question: string; answer: string }> | null;
  title_tag: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots: string | null;
}

export type DirectusFetchOutcome<T> =
  | {
      data: T[];
      source: 'live';
      siteSlug: string;
      fetchedAt: string;
    }
  | {
      error: string;
      source: 'error';
      siteSlug: string;
    };

export interface DirectusSchema {
  blog_articles: DirectusBlogArticle[];
  blog_categories: DirectusBlogCategory[];
  cities: DirectusCity[];
}

export const ARTICLE_FIELDS = [
  'id',
  'status',
  'date_created',
  'date_updated',
  'date_published',
  'title',
  'slug',
  'short_description',
  'content',
  'author_slug',
  'category.id',
  'category.name',
  'category.slug',
  'featured_image_file.id',
  'featured_image_file.title',
  'featured_image_file.description',
  'featured_image_file.width',
  'featured_image_file.height',
  'featured_image',
  'og_image_file.id',
  'og_image_file.title',
  'og_image_file.width',
  'og_image_file.height',
  'og_image',
  'twitter_image_file.id',
  'twitter_image_file.title',
  'twitter_image_file.width',
  'twitter_image_file.height',
  'twitter_image',
  'ai_key_takeaways',
  'source_links',
  'title_tag',
  'meta_description',
  'canonical_url',
  'robots',
] as const;

export const CITY_FIELDS = [
  'id',
  'status',
  'date_created',
  'date_updated',
  'city_name',
  'slug',
  'state_code',
  'heading',
  'short_description',
  'content',
  'featured_image_file.id',
  'featured_image_file.title',
  'featured_image_file.description',
  'featured_image_file.width',
  'featured_image_file.height',
  'featured_image',
  'address',
  'phone',
  'latitude',
  'longitude',
  'service_area_keywords',
  'key_statistics',
  'questions_answers',
  'title_tag',
  'meta_description',
  'canonical_url',
  'robots',
] as const;
