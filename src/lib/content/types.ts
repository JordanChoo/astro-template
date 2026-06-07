export interface ImageMeta {
  url: string;
  alt?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
}

export interface BlogPostSeo {
  titleTag?: string | undefined;
  metaDescription?: string | undefined;
  canonicalUrl?: string | undefined;
  robots?: string | undefined;
}

export interface BlogPostHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  author: string;
  image?: ImageMeta | undefined;
  tags: string[];
  categories: string[];
  category?: { name: string; slug: string } | undefined;
  content: string;
  rendered?: { html: string; headings: BlogPostHeading[] } | undefined;
  seo?: BlogPostSeo | undefined;
  sitemapEligible: boolean;
  isDraft: boolean;
}

export interface BlogCategory {
  name: string;
  slug: string;
  description?: string | undefined;
  postCount: number;
}

export interface LocationFaq {
  question: string;
  answer: string;
  answerHtml?: string | undefined;
}

export interface LocationSeo {
  titleTag?: string | undefined;
  metaDescription?: string | undefined;
  canonicalUrl?: string | undefined;
  robots?: string | undefined;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface OperatingHoursEntry {
  dayOfWeek: DayOfWeek;
  open: string;
  close: string;
}

export interface LocationStat {
  label: string;
  value: string;
}

export interface Location {
  slug: string;
  city: string;
  state?: string | undefined;
  heading?: string | undefined;
  description: string;
  longDescription?: string | undefined;
  longDescriptionHtml?: string | undefined;
  address?: string | undefined;
  phone?: string | undefined;
  coordinates?: LocationCoordinates | undefined;
  operatingHours?: OperatingHoursEntry[] | undefined;
  serviceAreaKeywords?: string[] | undefined;
  seo?: LocationSeo | undefined;
  stats?: LocationStat[] | undefined;
  faqs?: LocationFaq[] | undefined;
}
