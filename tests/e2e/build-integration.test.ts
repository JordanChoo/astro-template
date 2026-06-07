import { afterAll, describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { extname, join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const E2E_ROOT = join(tmpdir(), `astro-template-build-e2e-${process.pid}`);
const BUILD_TIMEOUT = 180000;
const FAST_UNREACHABLE_URL = 'http://127.0.0.1:9';
const FIXTURE_TOKEN = 'fixture-token-not-real-for-e2e';
const FIXTURE_SITE_SLUG = 'fixture-site-slug';
const TEXT_EXTENSIONS = new Set(['.html', '.xml', '.json', '.js', '.css', '.txt', '.svg']);
const DIRECTUS_ENV_KEYS = [
  'DIRECTUS_URL',
  'DIRECTUS_TOKEN',
  'DIRECTUS_SITE_SLUG',
  'DIRECTUS_ASSET_BASE_URL',
  'DIRECTUS_REQUIRED',
  'CACHE_DIR',
] as const;

interface BuildResult {
  success: boolean;
  output: string;
  distDir: string;
  cacheDir: string;
  durationMs: number;
}

function redact(value: string | undefined): string {
  if (!value) return '[empty]';
  return '[set]';
}

function scenarioName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildEnv(env: Record<string, string>, cacheDir: string): NodeJS.ProcessEnv {
  const cleanEnv: NodeJS.ProcessEnv = {};

  for (const [key, value] of Object.entries(process.env)) {
    const isDirectusKey = DIRECTUS_ENV_KEYS.includes(key as (typeof DIRECTUS_ENV_KEYS)[number]);
    if (!isDirectusKey && value !== undefined) {
      cleanEnv[key] = value;
    }
  }

  for (const key of DIRECTUS_ENV_KEYS) {
    cleanEnv[key] = '';
  }

  return {
    ...cleanEnv,
    CACHE_DIR: cacheDir,
    CI: '1',
    NO_COLOR: '1',
    ...env,
  };
}

function runBuild(name: string, env: Record<string, string>): BuildResult {
  const scenarioRoot = join(E2E_ROOT, scenarioName(name));
  const distDir = join(scenarioRoot, 'dist');
  const cacheDir = join(scenarioRoot, 'cache');
  const startedAt = Date.now();

  rmSync(DIST, { recursive: true, force: true });
  rmSync(scenarioRoot, { recursive: true, force: true });
  mkdirSync(scenarioRoot, { recursive: true });

  console.log(`[E2E] ${name}: pnpm run build`);
  console.log(
    `[E2E] ${name}: DIRECTUS_URL=${redact(env.DIRECTUS_URL)} DIRECTUS_SITE_SLUG=${redact(
      env.DIRECTUS_SITE_SLUG
    )} DIRECTUS_REQUIRED=${env.DIRECTUS_REQUIRED || '[empty]'}`
  );

  try {
    const child = spawnSync('pnpm', ['run', 'build'], {
      cwd: ROOT,
      env: buildEnv(env, cacheDir),
      stdio: 'pipe',
      timeout: BUILD_TIMEOUT,
      encoding: 'utf-8',
    });

    const durationMs = Date.now() - startedAt;
    const output = `${child.stdout ?? ''}\n${child.stderr ?? ''}`;
    const success = child.status === 0 && !child.error;

    if (success) {
      cpSync(DIST, distDir, { recursive: true });
      console.log(`[E2E] ${name}: PASS in ${durationMs}ms`);
    } else {
      console.log(`[E2E] ${name}: FAIL in ${durationMs}ms`);
    }

    return { success, output, distDir, cacheDir, durationMs };
  } catch (err: unknown) {
    const execErr = err as { stdout?: string | Buffer; stderr?: string | Buffer };
    const stdout = execErr.stdout?.toString() ?? '';
    const stderr = execErr.stderr?.toString() ?? '';
    const durationMs = Date.now() - startedAt;
    console.log(`[E2E] ${name}: FAIL in ${durationMs}ms`);
    return {
      success: false,
      output: `${stdout}\n${stderr}`,
      distDir,
      cacheDir,
      durationMs,
    };
  }
}

function readBuiltFile(distDir: string, relativePath: string): string {
  const fullPath = join(distDir, relativePath);
  expect(existsSync(fullPath), `${relativePath} should exist`).toBe(true);
  return readFileSync(fullPath, 'utf-8');
}

function listTextFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTextFiles(fullPath));
    } else if (TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

function scanDist(distDir: string, token?: string, url?: string): string[] {
  const findings: string[] = [];

  for (const file of listTextFiles(distDir)) {
    const content = readFileSync(file, 'utf-8');
    if (/access_token=/i.test(content)) findings.push(`${file}: access_token param`);
    if (/Bearer\s+[A-Za-z0-9_\-./+=]{10,}/i.test(content)) {
      findings.push(`${file}: Bearer token`);
    }
    if (token && token.length >= 8 && content.includes(token)) {
      findings.push(`${file}: DIRECTUS_TOKEN literal`);
    }
    if (url && content.includes(url)) {
      findings.push(`${file}: DIRECTUS_URL literal`);
    }
  }

  return findings;
}

function runAudit(env: Record<string, string>, cacheDir: string): string {
  return execFileSync('node', ['scripts/audit-build.mjs'], {
    cwd: ROOT,
    env: buildEnv(env, cacheDir),
    stdio: 'pipe',
    timeout: 30000,
    encoding: 'utf-8',
  });
}

afterAll(() => {
  rmSync(E2E_ROOT, { recursive: true, force: true });
});

describe.sequential('E2E build integration matrix', () => {
  it('Scenario 1: local-only mode builds local blog, RSS, and locations without leaks', () => {
    const result = runBuild('Scenario 1 local-only', {
      DIRECTUS_URL: '',
      DIRECTUS_TOKEN: '',
      DIRECTUS_SITE_SLUG: '',
      DIRECTUS_REQUIRED: '',
    });

    expect(result.success, result.output).toBe(true);
    expect(result.output).toContain('[directus] Not configured - using local content');

    const blogHtml = readBuiltFile(result.distDir, 'blog/index.html');
    expect(blogHtml).toContain('Getting Started with Astro');

    const rss = readBuiltFile(result.distDir, 'rss.xml');
    expect(rss).toContain('<channel>');
    expect(rss).toContain('<item>');

    const locationsHtml = readBuiltFile(result.distDir, 'locations/index.html');
    expect(locationsHtml).toContain('Austin');

    expect(scanDist(result.distDir)).toEqual([]);
  });

  const cmsUrl = process.env.DIRECTUS_URL;
  const cmsToken = process.env.DIRECTUS_TOKEN;
  const cmsSlug = process.env.DIRECTUS_SITE_SLUG;
  const hasCms = Boolean(cmsUrl && cmsToken);

  it.skipIf(!hasCms)(
    'Scenario 2 and 5: CMS-live mode builds CMS routes and passes token audit',
    () => {
      const env = {
        DIRECTUS_URL: cmsUrl ?? '',
        DIRECTUS_TOKEN: cmsToken ?? '',
        DIRECTUS_SITE_SLUG: cmsSlug ?? '',
        DIRECTUS_REQUIRED: '',
      };

      const result = runBuild('Scenario 2 CMS-live', env);
      expect(result.success, result.output).toBe(true);
      expect(result.output).toContain('[directus] Source: live');

      const cachePath = join(result.cacheDir, 'directus-blog.json');
      expect(existsSync(cachePath), 'CMS build should write the blog cache').toBe(true);
      const cache = JSON.parse(readFileSync(cachePath, 'utf-8')) as {
        data?: Array<{ slug?: unknown }>;
      };
      const firstSlug = cache.data?.find((entry) => typeof entry.slug === 'string')?.slug;
      expect(typeof firstSlug, 'CMS cache should contain article slugs').toBe('string');

      const postHtml = readBuiltFile(result.distDir, `blog/${firstSlug}/index.html`);
      expect(postHtml).toContain('<article');
      expect(postHtml).not.toContain('## ');

      expect(scanDist(result.distDir, cmsToken, cmsUrl)).toEqual([]);
      expect(() => runAudit(env, result.cacheDir)).not.toThrow();
    },
    BUILD_TIMEOUT + 60000
  );

  it('Scenario 3: CMS-unreachable mode falls back to local content quickly', () => {
    const result = runBuild('Scenario 3 CMS-unreachable fallback', {
      DIRECTUS_URL: FAST_UNREACHABLE_URL,
      DIRECTUS_TOKEN: FIXTURE_TOKEN,
      DIRECTUS_SITE_SLUG: FIXTURE_SITE_SLUG,
      DIRECTUS_REQUIRED: '',
    });

    expect(result.success, result.output).toBe(true);
    expect(result.output).toContain('[directus] Fetch articles failed');
    expect(result.output).toContain('falling back to local content');
    expect(result.durationMs).toBeLessThan(BUILD_TIMEOUT);

    const blogHtml = readBuiltFile(result.distDir, 'blog/index.html');
    expect(blogHtml).toContain('Getting Started with Astro');
    expect(scanDist(result.distDir, FIXTURE_TOKEN, FAST_UNREACHABLE_URL)).toEqual([]);
  });

  it('Scenario 4: strict mode fails clearly without leaking the fixture URL or token', () => {
    const result = runBuild('Scenario 4 strict unreachable', {
      DIRECTUS_URL: FAST_UNREACHABLE_URL,
      DIRECTUS_TOKEN: FIXTURE_TOKEN,
      DIRECTUS_SITE_SLUG: FIXTURE_SITE_SLUG,
      DIRECTUS_REQUIRED: 'true',
    });

    expect(result.success).toBe(false);
    expect(result.output).toContain('DIRECTUS_REQUIRED is true but CMS is unreachable');
    expect(result.output).not.toContain(FAST_UNREACHABLE_URL);
    expect(result.output).not.toContain(FIXTURE_TOKEN);
  });
});
