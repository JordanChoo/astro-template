#!/usr/bin/env node

/**
 * Directus connectivity verification and optional data seeding.
 *
 * Usage:
 *   node scripts/directus-sync.mjs --verify
 *   node scripts/directus-sync.mjs --seed
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REDACT_KEYS = ['DIRECTUS_URL', 'DIRECTUS_TOKEN', 'DIRECTUS_SITE_SLUG', 'DIRECTUS_ASSET_BASE_URL'];

function loadDotenv() {
  try {
    const envPath = resolve(process.cwd(), '.env');
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
    // .env file not found — use existing env
  }
}

function redact(message) {
  let result = String(message);
  for (const key of REDACT_KEYS) {
    const value = process.env[key];
    if (value) {
      result = result.replaceAll(value, `[redacted-${key.toLowerCase().replace('directus_', '')}]`);
    }
  }
  return result;
}

function log(...args) {
  console.log('[directus-sync]', redact(args.join(' ')));
}

function logError(...args) {
  console.error('[directus-sync]', redact(args.join(' ')));
}

function getConfig() {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;
  const siteSlug = process.env.DIRECTUS_SITE_SLUG;

  if (!url) {
    logError('DIRECTUS_URL not set — copy .env.example to .env and fill in values');
    process.exit(1);
  }

  return { url: url.replace(/\/$/, ''), token, siteSlug };
}

async function directusFetch(config, path) {
  const headers = { 'Content-Type': 'application/json' };
  if (config.token) {
    headers['Authorization'] = `Bearer ${config.token}`;
  }

  const response = await fetch(`${config.url}${path}`, { headers });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function verify() {
  const config = getConfig();

  log('Verifying connection...');

  try {
    await directusFetch(config, '/server/info');
    log(`Connected — Directus project active`);
  } catch (err) {
    logError(`Connection failed: ${err.message}`);
    process.exit(1);
  }

  const collections = ['blog_articles', 'blog_categories', 'cities'];
  for (const collection of collections) {
    try {
      const params = new URLSearchParams({ 'aggregate[count]': 'id' });
      if (config.siteSlug) {
        params.set('filter[site][slug][_eq]', config.siteSlug);
      }
      const result = await directusFetch(config, `/items/${collection}?${params}`);
      const count = result?.data?.[0]?.count?.id ?? '?';
      log(`${collection}: ${count} items`);
    } catch (err) {
      log(`${collection}: unavailable (${err.message})`);
    }
  }

  try {
    await directusFetch(config, '/assets?limit=1');
    log('Asset access: OK');
  } catch {
    log('Asset access: requires authentication or is restricted');
  }

  log('Verification complete');
}

async function seed() {
  const config = getConfig();

  if (!config.siteSlug) {
    logError('DIRECTUS_SITE_SLUG not set — required for seeding');
    process.exit(1);
  }

  log(`Seeding for site slug...`);

  try {
    const existing = await directusFetch(
      config,
      `/items/sites?filter[slug][_eq]=${encodeURIComponent(config.siteSlug)}&limit=1`,
    );

    if (existing?.data?.length > 0) {
      log('Site record already exists — skipping');
    } else {
      const headers = { 'Content-Type': 'application/json' };
      if (config.token) {
        headers['Authorization'] = `Bearer ${config.token}`;
      }

      const response = await fetch(`${config.url}/items/sites`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ slug: config.siteSlug, name: config.siteSlug }),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      log('Site record created');
    }
  } catch (err) {
    logError(`Seed failed: ${err.message}`);
    process.exit(1);
  }

  const defaultCategories = [
    { name: 'General', slug: 'general', sort: 1 },
    { name: 'News', slug: 'news', sort: 2 },
  ];

  for (const cat of defaultCategories) {
    try {
      const existing = await directusFetch(
        config,
        `/items/blog_categories?filter[slug][_eq]=${encodeURIComponent(cat.slug)}&limit=1`,
      );

      if (existing?.data?.length > 0) {
        log(`Category "${cat.name}" already exists — skipping`);
        continue;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (config.token) {
        headers['Authorization'] = `Bearer ${config.token}`;
      }

      const response = await fetch(`${config.url}/items/blog_categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify(cat),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      log(`Category "${cat.name}" created`);
    } catch (err) {
      logError(`Failed to seed category "${cat.name}": ${err.message}`);
    }
  }

  log('Seeding complete');
}

loadDotenv();

const mode = process.argv[2];

if (mode === '--verify') {
  await verify();
} else if (mode === '--seed') {
  await seed();
} else {
  console.log('Usage: node scripts/directus-sync.mjs [--verify | --seed]');
  process.exit(1);
}
