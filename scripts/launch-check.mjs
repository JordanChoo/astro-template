#!/usr/bin/env node

/**
 * Launch readiness check for Directus CMS integration.
 *
 * Usage:
 *   node scripts/launch-check.mjs
 *
 * Verifies environment, connectivity, content, and build safety before
 * deploying with CMS content for the first time.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const results = [];

function loadDotenv() {
  try {
    const envPath = resolve(ROOT, '.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env not required
  }
}

function redact(value) {
  if (!value || typeof value !== 'string') return '[empty]';
  if (value.length <= 8) return '[redacted]';
  return value.slice(0, 4) + '…' + value.slice(-2);
}

function record(name, status, detail = '') {
  results.push({ name, status, detail });
}

function checkEnvVars() {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;
  const slug = process.env.DIRECTUS_SITE_SLUG;

  if (url) {
    record('DIRECTUS_URL set', 'PASS', redact(url));
  } else {
    record('DIRECTUS_URL set', 'FAIL', 'Not set — CMS integration will use local fallback');
  }

  if (token) {
    record('DIRECTUS_TOKEN set', 'PASS', redact(token));
  } else {
    record('DIRECTUS_TOKEN set', 'FAIL', 'Not set');
  }

  if (slug) {
    record('DIRECTUS_SITE_SLUG set', 'PASS', redact(slug));
  } else {
    record('DIRECTUS_SITE_SLUG set', 'SKIP', 'Not set (optional for single-site)');
  }
}

function checkEnvExample() {
  const examplePath = resolve(ROOT, '.env.example');
  if (!existsSync(examplePath)) {
    record('.env.example exists', 'FAIL', 'File not found');
    return;
  }

  const content = readFileSync(examplePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
  const hasValues = lines.some((line) => {
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return false;
    const value = line.slice(eqIdx + 1).trim();
    return value.length > 0 && !value.startsWith('#');
  });

  if (hasValues) {
    record('.env.example has no real values', 'FAIL', 'Contains non-empty values — must use empty placeholders only');
  } else {
    record('.env.example has no real values', 'PASS');
  }
}

function checkGitignore() {
  const gitignorePath = resolve(ROOT, '.gitignore');
  if (!existsSync(gitignorePath)) {
    record('.gitignore includes .cache/', 'FAIL', '.gitignore not found');
    return;
  }

  const content = readFileSync(gitignorePath, 'utf-8');
  if (content.includes('.cache')) {
    record('.gitignore includes .cache/', 'PASS');
  } else {
    record('.gitignore includes .cache/', 'FAIL', '.cache/ not in .gitignore');
  }
}

async function checkConnectivity() {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url || !token) {
    record('Directus API connection', 'SKIP', 'DIRECTUS_URL or DIRECTUS_TOKEN not set');
    record('Site slug returns content', 'SKIP');
    record('Asset access', 'SKIP');
    return;
  }

  try {
    const serverRes = await fetch(`${url}/server/info`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (serverRes.ok) {
      record('Directus API connection', 'PASS');
    } else {
      record('Directus API connection', 'FAIL', `HTTP ${serverRes.status}`);
      return;
    }
  } catch (err) {
    record('Directus API connection', 'FAIL', `${err.code || err.message}`);
    return;
  }

  const slug = process.env.DIRECTUS_SITE_SLUG;
  try {
    const filter = slug
      ? `filter[sites][sites_id][slug][_eq]=${encodeURIComponent(slug)}`
      : '';
    const articlesRes = await fetch(
      `${url}/items/blog_articles?limit=1&${filter}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (articlesRes.ok) {
      const data = await articlesRes.json();
      const count = Array.isArray(data.data) ? data.data.length : 0;
      record('Site slug returns content', count > 0 ? 'PASS' : 'FAIL',
        count > 0 ? `${count}+ article(s) found` : 'No articles found for configured site');
    } else {
      record('Site slug returns content', 'FAIL', `HTTP ${articlesRes.status}`);
    }
  } catch (err) {
    record('Site slug returns content', 'FAIL', `${err.message}`);
  }

  try {
    const filesRes = await fetch(`${url}/files?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    record('Asset access', filesRes.ok ? 'PASS' : 'FAIL',
      filesRes.ok ? 'Files endpoint accessible' : `HTTP ${filesRes.status}`);
  } catch (err) {
    record('Asset access', 'FAIL', `${err.message}`);
  }
}

function checkBuild() {
  try {
    execSync('pnpm build', { cwd: ROOT, stdio: 'pipe', timeout: 120000 });
    record('Build succeeds', 'PASS');
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().slice(0, 200) : 'Unknown error';
    record('Build succeeds', 'FAIL', stderr);
    return;
  }

  const distPath = join(ROOT, 'dist');
  if (existsSync(join(distPath, 'index.html'))) {
    record('dist/ contains pages', 'PASS');
  } else {
    record('dist/ contains pages', 'FAIL', 'dist/index.html not found');
  }

  try {
    execSync('node scripts/audit-build.mjs', { cwd: ROOT, stdio: 'pipe', timeout: 30000 });
    record('Token leakage audit', 'PASS');
  } catch {
    record('Token leakage audit', 'FAIL', 'audit-build.mjs found sensitive patterns');
  }
}

function printReport() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║              LAUNCH READINESS CHECK                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const maxName = Math.max(...results.map((r) => r.name.length));

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏭️';
    const pad = ' '.repeat(maxName - r.name.length);
    const detail = r.detail ? ` — ${r.detail}` : '';
    console.log(`  ${icon} ${r.name}${pad}  ${r.status}${detail}`);
  }

  const failed = results.filter((r) => r.status === 'FAIL').length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;

  console.log(`\n  Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  if (failed === 0) {
    console.log('\n  ✅ READY — All checks passed.\n');
  } else {
    console.log(`\n  ❌ NOT READY — ${failed} check(s) failed.\n`);
  }

  return failed;
}

async function main() {
  loadDotenv();

  console.log('Running launch readiness checks...\n');

  checkEnvVars();
  checkEnvExample();
  checkGitignore();
  await checkConnectivity();
  checkBuild();

  const failed = printReport();
  process.exit(failed > 0 ? 1 : 0);
}

main();
