import { createDirectus, rest, readItems } from '@directus/sdk';
import { logger } from './logger.js';
import type {
  DirectusBlogArticle,
  DirectusBlogCategory,
  DirectusCity,
  DirectusFetchOutcome,
  DirectusSchema,
} from './types.js';
import { ARTICLE_FIELDS, CITY_FIELDS } from './types.js';

export function isDirectusConfigured(): boolean {
  return Boolean(import.meta.env.DIRECTUS_URL);
}

function getEnv() {
  return {
    url: import.meta.env.DIRECTUS_URL ?? '',
    token: import.meta.env.DIRECTUS_TOKEN ?? '',
    siteSlug: import.meta.env.DIRECTUS_SITE_SLUG ?? '',
    isDev: import.meta.env.DEV === true,
  };
}

function buildClient(url: string, token?: string) {
  const client = createDirectus<DirectusSchema>(url).with(
    rest({
      onRequest: (options) => {
        if (token) {
          const headers = options.headers
            ? new Headers(options.headers as HeadersInit)
            : new Headers();
          headers.set('Authorization', `Bearer ${token}`);
          return { ...options, headers };
        }
        return options;
      },
    })
  );
  return client;
}

async function fetchWithTimeout<T>(fn: () => Promise<T>, timeoutMs = 15000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Request timed out after ${timeoutMs}ms`)),
      timeoutMs
    );
  });

  try {
    return await Promise.race([fn(), timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

export async function fetchPublishedArticles(
  timeoutMs?: number
): Promise<DirectusFetchOutcome<DirectusBlogArticle>> {
  const env = getEnv();
  const client = buildClient(env.url, env.token);

  const statusFilter = env.isDev
    ? { status: { _in: ['published', 'draft'] } }
    : { status: { _eq: 'published' } };

  const siteFilter = env.siteSlug ? { site: { slug: { _eq: env.siteSlug } } } : {};

  try {
    const data = await fetchWithTimeout(
      () =>
        client.request(
          readItems(
            'blog_articles' as never,
            {
              fields: ARTICLE_FIELDS as unknown as string[],
              filter: { ...statusFilter, ...siteFilter } as never,
              sort: ['-date_published'] as never,
              limit: -1,
            } as never
          )
        ),
      timeoutMs
    );

    return {
      data: data as unknown as DirectusBlogArticle[],
      source: 'live',
      siteSlug: env.siteSlug,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown fetch error';
    logger.error(`Fetch articles failed: ${message}`);
    return { error: message, source: 'error', siteSlug: env.siteSlug };
  }
}

export async function fetchCategories(
  timeoutMs?: number
): Promise<DirectusFetchOutcome<DirectusBlogCategory>> {
  const env = getEnv();
  const client = buildClient(env.url, env.token);

  try {
    const data = await fetchWithTimeout(
      () =>
        client.request(
          readItems(
            'blog_categories' as never,
            {
              fields: ['id', 'name', 'slug', 'description', 'sort'],
              sort: ['sort', 'name'] as never,
              limit: -1,
            } as never
          )
        ),
      timeoutMs
    );

    return {
      data: data as unknown as DirectusBlogCategory[],
      source: 'live',
      siteSlug: env.siteSlug,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown fetch error';
    logger.error(`Fetch categories failed: ${message}`);
    return { error: message, source: 'error', siteSlug: env.siteSlug };
  }
}

export async function fetchPublishedCities(
  timeoutMs?: number
): Promise<DirectusFetchOutcome<DirectusCity>> {
  const env = getEnv();
  const client = buildClient(env.url, env.token);

  const statusFilter = env.isDev
    ? { status: { _in: ['published', 'draft'] } }
    : { status: { _eq: 'published' } };

  const siteFilter = env.siteSlug ? { site: { slug: { _eq: env.siteSlug } } } : {};

  try {
    const data = await fetchWithTimeout(
      () =>
        client.request(
          readItems(
            'cities' as never,
            {
              fields: CITY_FIELDS as unknown as string[],
              filter: { ...statusFilter, ...siteFilter } as never,
              sort: ['city_name'] as never,
              limit: -1,
            } as never
          )
        ),
      timeoutMs
    );

    return {
      data: data as unknown as DirectusCity[],
      source: 'live',
      siteSlug: env.siteSlug,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown fetch error';
    logger.error(`Fetch cities failed: ${message}`);
    return { error: message, source: 'error', siteSlug: env.siteSlug };
  }
}

export function isLiveResult<T>(
  outcome: DirectusFetchOutcome<T>
): outcome is Extract<DirectusFetchOutcome<T>, { source: 'live' }> {
  return outcome.source === 'live';
}

export function isErrorResult<T>(
  outcome: DirectusFetchOutcome<T>
): outcome is Extract<DirectusFetchOutcome<T>, { source: 'error' }> {
  return outcome.source === 'error';
}
