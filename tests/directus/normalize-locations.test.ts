import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCity } from '../fixtures/directus-factories';

vi.mock('../../src/lib/directus/markdown', () => ({
  renderMarkdown: vi.fn(),
}));

vi.mock('../../src/lib/directus/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { renderMarkdown } from '../../src/lib/directus/markdown';
import { logger } from '../../src/lib/directus/logger';
import { normalizeCity, normalizeCities } from '../../src/lib/directus/normalize-locations';

const mockRenderMarkdown = renderMarkdown as ReturnType<typeof vi.fn>;
const mockLoggerWarn = logger.warn as ReturnType<typeof vi.fn>;
const mockLoggerInfo = logger.info as ReturnType<typeof vi.fn>;

describe('Location normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRenderMarkdown.mockResolvedValue({ html: '<p>rendered</p>', headings: [] });
  });

  describe('normalizeCity', () => {
    it('maps all core fields', async () => {
      console.log('[TEST:normalize-loc] core fields');
      const raw = createCity();
      const loc = await normalizeCity(raw);
      expect(loc.slug).toBe('austin');
      expect(loc.city).toBe('Austin');
      expect(loc.state).toBe('TX');
      expect(loc.heading).toBe('Expert Services in Austin, TX');
      expect(loc.description).toBe('Professional services in the Austin metropolitan area.');
      expect(loc.address).toBe('123 Main St, Austin, TX 78701');
      expect(loc.phone).toBe('(512) 555-0100');
    });

    it('maps coordinates from latitude/longitude', async () => {
      console.log('[TEST:normalize-loc] coordinates');
      const raw = createCity({ latitude: 40.7128, longitude: -74.006 });
      const loc = await normalizeCity(raw);
      expect(loc.coordinates).toEqual({ lat: 40.7128, lng: -74.006 });
    });

    it('returns undefined coordinates when latitude or longitude is null', async () => {
      console.log('[TEST:normalize-loc] null coordinates');
      const raw = createCity({ latitude: null, longitude: null });
      const loc = await normalizeCity(raw);
      expect(loc.coordinates).toBeUndefined();
    });

    it('maps service_area_keywords', async () => {
      console.log('[TEST:normalize-loc] service area keywords');
      const raw = createCity({ service_area_keywords: ['Downtown', 'Suburbs'] });
      const loc = await normalizeCity(raw);
      expect(loc.serviceAreaKeywords).toEqual(['Downtown', 'Suburbs']);
    });

    it('preserves longDescription raw text and renders longDescriptionHtml', async () => {
      console.log('[TEST:normalize-loc] long description rendering');
      const markdown = '## About Us\n\nWe are great.';
      mockRenderMarkdown.mockResolvedValueOnce({
        html: '<h2>About Us</h2>\n<p>We are great.</p>',
        headings: [],
      });
      const raw = createCity({ content: markdown });
      const loc = await normalizeCity(raw);
      expect(loc.longDescription).toBe(markdown);
      expect(loc.longDescriptionHtml).toBe('<h2>About Us</h2>\n<p>We are great.</p>');
      expect(mockRenderMarkdown).toHaveBeenCalledWith(markdown);
    });

    it('returns undefined longDescription and longDescriptionHtml when content is null', async () => {
      console.log('[TEST:normalize-loc] null content');
      const raw = createCity({ content: null, questions_answers: null });
      const loc = await normalizeCity(raw);
      expect(loc.longDescription).toBeUndefined();
      expect(loc.longDescriptionHtml).toBeUndefined();
      expect(mockRenderMarkdown).not.toHaveBeenCalled();
    });

    it('maps key_statistics to stats with label/value split', async () => {
      console.log('[TEST:normalize-loc] stats split');
      const raw = createCity({
        key_statistics: [{ text: 'Projects: 500+' }, { text: 'Satisfaction – 98%' }],
      });
      const loc = await normalizeCity(raw);
      expect(loc.stats).toEqual([
        { label: 'Projects', value: '500+' },
        { label: 'Satisfaction', value: '98%' },
      ]);
    });

    it('handles stats without delimiter as label-only', async () => {
      console.log('[TEST:normalize-loc] stats no delimiter');
      const raw = createCity({
        key_statistics: [{ text: 'Award Winner' }],
      });
      const loc = await normalizeCity(raw);
      expect(loc.stats).toEqual([{ label: 'Award Winner', value: '' }]);
    });

    it('returns undefined stats when key_statistics is null', async () => {
      console.log('[TEST:normalize-loc] null stats');
      const raw = createCity({ key_statistics: null });
      const loc = await normalizeCity(raw);
      expect(loc.stats).toBeUndefined();
    });

    it('returns undefined stats when key_statistics is empty', async () => {
      console.log('[TEST:normalize-loc] empty stats');
      const raw = createCity({ key_statistics: [] });
      const loc = await normalizeCity(raw);
      expect(loc.stats).toBeUndefined();
    });

    it('maps questions_answers to faqs with raw answer and rendered answerHtml', async () => {
      console.log('[TEST:normalize-loc] faqs rendering');
      mockRenderMarkdown.mockReset();
      mockRenderMarkdown.mockResolvedValueOnce({ html: '<p>content html</p>', headings: [] });
      mockRenderMarkdown.mockResolvedValueOnce({
        html: '<p>We serve the <strong>Austin</strong> area.</p>',
        headings: [],
      });
      const raw = createCity({
        content: 'Some content',
        questions_answers: [{ question: 'Where?', answer: 'We serve the **Austin** area.' }],
      });
      const loc = await normalizeCity(raw);
      expect(loc.faqs).toHaveLength(1);
      expect(loc.faqs![0]!.question).toBe('Where?');
      expect(loc.faqs![0]!.answer).toBe('We serve the **Austin** area.');
      expect(loc.faqs![0]!.answerHtml).toBe('<p>We serve the <strong>Austin</strong> area.</p>');
    });

    it('returns undefined faqs when questions_answers is null', async () => {
      console.log('[TEST:normalize-loc] null faqs');
      const raw = createCity({ questions_answers: null });
      const loc = await normalizeCity(raw);
      expect(loc.faqs).toBeUndefined();
    });

    it('returns undefined faqs when questions_answers is empty', async () => {
      console.log('[TEST:normalize-loc] empty faqs');
      const raw = createCity({ questions_answers: [] });
      const loc = await normalizeCity(raw);
      expect(loc.faqs).toBeUndefined();
    });

    it('maps SEO fields when present', async () => {
      console.log('[TEST:normalize-loc] seo fields');
      const raw = createCity({
        title_tag: 'Austin Office | Acme',
        meta_description: 'Visit our Austin location.',
        canonical_url: '/locations/austin',
        robots: 'index,follow',
      });
      const loc = await normalizeCity(raw);
      expect(loc.seo).toEqual({
        titleTag: 'Austin Office | Acme',
        metaDescription: 'Visit our Austin location.',
        canonicalUrl: '/locations/austin',
        robots: 'index,follow',
      });
    });

    it('returns undefined seo when all SEO fields are null', async () => {
      console.log('[TEST:normalize-loc] null seo');
      const raw = createCity({
        title_tag: null,
        meta_description: null,
        canonical_url: null,
        robots: null,
      });
      const loc = await normalizeCity(raw);
      expect(loc.seo).toBeUndefined();
    });

    it('handles optional fields being absent', async () => {
      console.log('[TEST:normalize-loc] optional fields absent');
      const raw = createCity({
        address: null,
        phone: null,
        latitude: null,
        longitude: null,
        heading: null,
        state_code: null,
        service_area_keywords: null,
      });
      const loc = await normalizeCity(raw);
      expect(loc.address).toBeUndefined();
      expect(loc.phone).toBeUndefined();
      expect(loc.coordinates).toBeUndefined();
      expect(loc.heading).toBeUndefined();
      expect(loc.state).toBeUndefined();
      expect(loc.serviceAreaKeywords).toBeUndefined();
    });

    it('falls back to empty string when short_description is null', async () => {
      console.log('[TEST:normalize-loc] null short description');
      const raw = createCity({ short_description: null });
      const loc = await normalizeCity(raw);
      expect(loc.description).toBe('');
    });
  });

  describe('normalizeCities', () => {
    it('normalizes a batch of cities', async () => {
      console.log('[TEST:normalize-loc] batch');
      const cities = [
        createCity({ slug: 'austin', city_name: 'Austin' }),
        createCity({ slug: 'denver', city_name: 'Denver', id: 'city-002' }),
      ];
      const result = await normalizeCities(cities);
      expect(result).toHaveLength(2);
      expect(result[0]!.slug).toBe('austin');
      expect(result[1]!.slug).toBe('denver');
    });

    it('skips cities with missing slug and logs warning', async () => {
      console.log('[TEST:normalize-loc] skip missing slug');
      const cities = [
        createCity({ slug: '', id: 'city-bad' }),
        createCity({ slug: 'denver', city_name: 'Denver', id: 'city-002' }),
      ];
      const result = await normalizeCities(cities);
      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe('denver');
      expect(mockLoggerWarn).toHaveBeenCalledWith(expect.stringContaining('city-bad'));
    });

    it('logs normalization count', async () => {
      console.log('[TEST:normalize-loc] count log');
      const cities = [createCity()];
      await normalizeCities(cities);
      expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('1 locations'));
    });

    it('handles empty input', async () => {
      console.log('[TEST:normalize-loc] empty batch');
      const result = await normalizeCities([]);
      expect(result).toEqual([]);
      expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('0 locations'));
    });
  });
});
