import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  logger,
  logDirectusDiagnostic,
  redact,
  resetRedactionCache,
} from '../../src/lib/directus/logger';

const DIRECTUS_ENV_KEYS = [
  'DIRECTUS_URL',
  'DIRECTUS_TOKEN',
  'DIRECTUS_SITE_SLUG',
  'DIRECTUS_ASSET_BASE_URL',
] as const;

type DirectusEnvKey = (typeof DIRECTUS_ENV_KEYS)[number];
type ConsoleSpy = { mock: { calls: unknown[][] } };

function setDirectusEnv(values: Partial<Record<DirectusEnvKey, string>>): void {
  for (const key of DIRECTUS_ENV_KEYS) {
    const value = values[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  resetRedactionCache();
}

function clearDirectusEnv(): void {
  setDirectusEnv({});
}

function makeDirectusUrlFixture(): string {
  return 'https://redaction-fixture.test/items/blog_articles';
}

function makeTokenFixture(): string {
  return ['redaction', 'token', 'fixture'].join('-');
}

function makeSiteSlugFixture(): string {
  return ['site', 'slug', 'fixture'].join('-');
}

function consoleOutput(spy: ConsoleSpy): string {
  return spy.mock.calls.map((call) => call.map((value) => String(value)).join(' ')).join('\n');
}

describe('Directus diagnostic logger', () => {
  let assertions = 0;

  beforeEach(() => {
    clearDirectusEnv();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearDirectusEnv();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    console.log(`[TEST] diagnostic logger assertions completed: ${assertions}`);
  });

  it('strips configured token from Directus API error response', () => {
    assertions += 1;
    console.log('[TEST] redact strips configured token from error response');

    const configuredToken = makeTokenFixture();
    setDirectusEnv({ DIRECTUS_TOKEN: configuredToken });

    const result = redact(`Fetch failed with bearer ${configuredToken}`);

    expect(result).not.toContain(configuredToken);
    expect(result).toContain('[redacted-token]');
  });

  it('strips configured URL from realistic API error response', () => {
    assertions += 1;
    console.log('[TEST] redact strips configured URL from error response');

    const configuredUrl = makeDirectusUrlFixture();
    setDirectusEnv({ DIRECTUS_URL: configuredUrl });

    const result = redact(`Fetch failed: 401 Unauthorized at ${configuredUrl}`);

    expect(result).not.toContain(configuredUrl);
    expect(result).toContain('[redacted-url]');
    expect(result).toContain('Fetch failed');
  });

  it('strips configured site slug from diagnostic output', () => {
    assertions += 1;
    console.log('[TEST] redact strips configured site slug');

    const configuredSlug = makeSiteSlugFixture();
    setDirectusEnv({ DIRECTUS_SITE_SLUG: configuredSlug });

    const result = redact(`Filtering content for ${configuredSlug}`);

    expect(result).not.toContain(configuredSlug);
    expect(result).toContain('[redacted-site-slug]');
  });

  it('strips multiple occurrences of the same configured value', () => {
    assertions += 1;
    console.log('[TEST] redact strips repeated configured values');

    const configuredToken = makeTokenFixture();
    setDirectusEnv({ DIRECTUS_TOKEN: configuredToken });

    const result = redact(`${configuredToken} appears twice: ${configuredToken}`);

    expect(result).not.toContain(configuredToken);
    expect(result.match(/\[redacted-token\]/g)).toHaveLength(2);
  });

  it('strips URL, token, and site slug from the same message', () => {
    assertions += 1;
    console.log('[TEST] redact strips all configured Directus values together');

    const configuredUrl = makeDirectusUrlFixture();
    const configuredToken = makeTokenFixture();
    const configuredSlug = makeSiteSlugFixture();
    setDirectusEnv({
      DIRECTUS_URL: configuredUrl,
      DIRECTUS_TOKEN: configuredToken,
      DIRECTUS_SITE_SLUG: configuredSlug,
    });

    const result = redact(`Fetch ${configuredUrl} for ${configuredSlug} using ${configuredToken}`);

    expect(result).not.toContain(configuredUrl);
    expect(result).not.toContain(configuredToken);
    expect(result).not.toContain(configuredSlug);
  });

  it('returns original string when no Directus env values are set', () => {
    assertions += 1;
    console.log('[TEST] redact leaves unrelated strings unchanged');

    const message = 'No configured Directus values are present';

    expect(redact(message)).toBe(message);
  });

  it('does not crash on empty string input', () => {
    assertions += 1;
    console.log('[TEST] redact handles empty string');

    expect(redact('')).toBe('');
  });

  it('does not crash on undefined input', () => {
    assertions += 1;
    console.log('[TEST] redact handles undefined input');

    expect(redact(undefined)).toBe('');
  });

  it('strips URL-encoded variants of configured values', () => {
    assertions += 1;
    console.log('[TEST] redact strips URL encoded configured values');

    const configuredUrl = makeDirectusUrlFixture();
    setDirectusEnv({ DIRECTUS_URL: configuredUrl });

    const result = redact(`Encoded URL: ${encodeURIComponent(configuredUrl)}`);

    expect(result).not.toContain(encodeURIComponent(configuredUrl));
    expect(result).toContain('[redacted-url]');
  });

  it('matches configured values case-sensitively', () => {
    assertions += 1;
    console.log('[TEST] redact matches token values case sensitively');

    const configuredToken = makeTokenFixture();
    setDirectusEnv({ DIRECTUS_TOKEN: configuredToken });

    const upperCaseToken = configuredToken.toUpperCase();
    const result = redact(upperCaseToken);

    expect(result).toBe(upperCaseToken);
  });

  it('outputs structured directus prefix format', () => {
    assertions += 1;
    console.log('[TEST] logger emits directus prefix');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    logger.info('Source: live (connected)');

    expect(logSpy).toHaveBeenCalledWith('[directus]', 'Source: live (connected)');
  });

  it('includes content counts per collection in diagnostics', () => {
    assertions += 1;
    console.log('[TEST] diagnostics include collection counts');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    logDirectusDiagnostic({
      source: 'live',
      collections: {
        blog_articles: 3,
        blog_categories: 2,
      },
    });

    const output = consoleOutput(logSpy);
    expect(output).toContain('blog_articles: 3 items');
    expect(output).toContain('blog_categories: 2 items');
  });

  it('includes source status in diagnostics', () => {
    assertions += 1;
    console.log('[TEST] diagnostics include source status');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    logDirectusDiagnostic({ source: 'not-configured' });

    expect(consoleOutput(logSpy)).toContain('Not configured - using local content');
  });

  it('redacts all console output from logger helpers', () => {
    assertions += 1;
    console.log('[TEST] logger output is redacted before console emission');

    const configuredUrl = makeDirectusUrlFixture();
    const configuredToken = makeTokenFixture();
    setDirectusEnv({
      DIRECTUS_URL: configuredUrl,
      DIRECTUS_TOKEN: configuredToken,
    });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    logger.error(`Fetch failed at ${configuredUrl}?access_token=${configuredToken}`);

    const output = consoleOutput(errorSpy);
    expect(output).not.toContain(configuredUrl);
    expect(output).not.toContain(configuredToken);
    expect(output).toContain('[redacted-url]');
    expect(output).toContain('[redacted-token]');
  });
});
