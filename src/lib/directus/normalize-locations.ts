import type { DirectusCity } from './types.js';
import type { Location, LocationFaq, LocationStat, LocationSeo } from '../content/types.js';
import { renderMarkdown } from './markdown.js';
import { logger } from './logger.js';

function normalizeStats(raw: Array<{ text: string }> | null): LocationStat[] | undefined {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return undefined;
  return raw
    .filter(
      (item): item is { text: string } => typeof item === 'object' && typeof item.text === 'string'
    )
    .map((item) => {
      const parts = item.text.split(/[:–—]/, 2);
      return parts.length === 2
        ? { label: parts[0]!.trim(), value: parts[1]!.trim() }
        : { label: item.text, value: '' };
    });
}

async function normalizeFaqs(
  raw: Array<{ question: string; answer: string }> | null
): Promise<LocationFaq[] | undefined> {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return undefined;

  const faqs: LocationFaq[] = [];
  for (const item of raw) {
    if (
      typeof item !== 'object' ||
      typeof item.question !== 'string' ||
      typeof item.answer !== 'string'
    ) {
      continue;
    }
    const { html } = await renderMarkdown(item.answer);
    faqs.push({
      question: item.question,
      answer: item.answer,
      answerHtml: html,
    });
  }

  return faqs.length > 0 ? faqs : undefined;
}

function normalizeSeo(raw: DirectusCity): LocationSeo | undefined {
  const seo: LocationSeo = {
    titleTag: raw.title_tag ?? undefined,
    metaDescription: raw.meta_description ?? undefined,
    canonicalUrl: raw.canonical_url ?? undefined,
    robots: raw.robots ?? undefined,
  };
  if (!seo.titleTag && !seo.metaDescription && !seo.canonicalUrl && !seo.robots) return undefined;
  return seo;
}

export async function normalizeCity(raw: DirectusCity): Promise<Location> {
  const longDescription = raw.content ?? undefined;
  let longDescriptionHtml: string | undefined;
  if (longDescription) {
    const { html } = await renderMarkdown(longDescription);
    longDescriptionHtml = html;
  }

  return {
    slug: raw.slug,
    city: raw.city_name,
    state: raw.state_code ?? undefined,
    heading: raw.heading ?? undefined,
    description: raw.short_description ?? '',
    longDescription,
    longDescriptionHtml,
    address: raw.address ?? undefined,
    phone: raw.phone ?? undefined,
    coordinates:
      raw.latitude != null && raw.longitude != null
        ? { lat: raw.latitude, lng: raw.longitude }
        : undefined,
    serviceAreaKeywords: raw.service_area_keywords ?? undefined,
    seo: normalizeSeo(raw),
    stats: normalizeStats(raw.key_statistics),
    faqs: await normalizeFaqs(raw.questions_answers),
  };
}

export async function normalizeCities(raws: DirectusCity[]): Promise<Location[]> {
  const locations: Location[] = [];

  for (const raw of raws) {
    if (!raw.slug) {
      logger.warn(`Skipping city with missing slug (id: ${raw.id})`);
      continue;
    }
    locations.push(await normalizeCity(raw));
  }

  logger.info(
    `Normalized ${locations.length} locations (${raws.length - locations.length} skipped)`
  );
  return locations;
}
