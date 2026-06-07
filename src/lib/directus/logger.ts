const PREFIX = '[directus]';

const ENV_REDACTIONS = [
  { key: 'DIRECTUS_URL', mask: '[redacted-url]' },
  { key: 'DIRECTUS_TOKEN', mask: '[redacted-token]' },
  { key: 'DIRECTUS_SITE_SLUG', mask: '[redacted-site-slug]' },
  { key: 'DIRECTUS_ASSET_BASE_URL', mask: '[redacted-asset-url]' },
] as const;

type EnvKey = (typeof ENV_REDACTIONS)[number]['key'];
type Redaction = { pattern: RegExp; mask: string };
type EnvRecord = Record<string, string | undefined>;

function readImportMetaEnv(key: EnvKey): string | undefined {
  const meta = import.meta as unknown as { env?: EnvRecord };
  return meta.env?.[key];
}

function readProcessEnv(key: EnvKey): string | undefined {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: { env?: EnvRecord };
  };

  return globalWithProcess.process?.env?.[key];
}

function getEnvValues(key: EnvKey): string[] {
  const values = [readImportMetaEnv(key), readProcessEnv(key)].filter(
    (value): value is string => typeof value === 'string' && value.length > 0
  );

  return [...new Set(values)];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addRedaction(
  redactions: Redaction[],
  seen: Set<string>,
  value: string,
  mask: string
): void {
  for (const candidate of [value, encodeURIComponent(value)]) {
    const cacheKey = `${mask}\0${candidate}`;
    if (seen.has(cacheKey)) {
      continue;
    }

    seen.add(cacheKey);
    redactions.push({ pattern: new RegExp(escapeRegExp(candidate), 'g'), mask });
  }
}

function buildRedactions(): Redaction[] {
  const redactions: Redaction[] = [];
  const seen = new Set<string>();

  for (const { key, mask } of ENV_REDACTIONS) {
    for (const value of getEnvValues(key)) {
      addRedaction(redactions, seen, value, mask);
    }
  }

  return redactions;
}

let cachedRedactions: Redaction[] | null = null;

function getRedactions(): Redaction[] {
  if (!cachedRedactions) {
    cachedRedactions = buildRedactions();
  }
  return cachedRedactions;
}

export function redact(message: unknown): string {
  const input = formatLogValue(message);
  if (!input) return input;

  let result = input;
  for (const { pattern, mask } of getRedactions()) {
    result = result.replace(pattern, mask);
  }
  return result;
}

export function resetRedactionCache(): void {
  cachedRedactions = null;
}

type LogLevel = 'info' | 'warn' | 'error';

function formatLogValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Error) {
    return value.stack ?? value.message;
  }

  if (value === undefined) {
    return '';
  }

  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function log(level: LogLevel, ...args: unknown[]): void {
  const message = args.map(formatLogValue).join(' ');
  const redacted = redact(message);

  switch (level) {
    case 'warn':
      console.warn(PREFIX, redacted);
      break;
    case 'error':
      console.error(PREFIX, redacted);
      break;
    default:
      console.log(PREFIX, redacted);
  }
}

export const logger = {
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
};

export interface DiagnosticStats {
  source: 'live' | 'cache' | 'local' | 'not-configured';
  collections?: Record<string, number>;
  cache?: {
    operation: 'written' | 'read' | 'rejected';
    path?: string;
    staleAge?: string;
  };
  fetchMs?: number;
  error?: string;
}

export function logDirectusDiagnostic(stats: DiagnosticStats): void {
  switch (stats.source) {
    case 'live':
      logger.info(`Source: live (connected)`);
      if (stats.fetchMs !== undefined) {
        logger.info(`Fetch: ${stats.fetchMs}ms`);
      }
      break;
    case 'cache':
      logger.info(
        `Source: cache${stats.cache?.staleAge ? ` (${stats.cache.staleAge} stale)` : ''}`
      );
      break;
    case 'local':
      logger.info('Source: local content');
      break;
    case 'not-configured':
      logger.info('Not configured - using local content');
      return;
  }

  if (stats.collections) {
    for (const [name, count] of Object.entries(stats.collections)) {
      logger.info(`${name}: ${count} items`);
    }
  }

  if (stats.cache) {
    const target = stats.cache.path ? ` to ${stats.cache.path}` : '';
    logger.info(`Cache: ${stats.cache.operation}${target}`);
  }

  if (stats.error) {
    logger.error(stats.error);
  }
}
