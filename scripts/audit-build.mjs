#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST_DIR = join(process.cwd(), 'dist');
const TEXT_EXTENSIONS = new Set(['.html', '.xml', '.json', '.js', '.css', '.txt', '.svg']);

function getPatterns() {
  const patterns = [
    { name: 'access_token param', regex: /access_token=/gi },
    { name: 'Bearer token header', regex: /Bearer\s+[A-Za-z0-9_\-./+=]{10,}/gi },
    { name: 'authorization header', regex: /authorization:\s*Bearer/gi },
    { name: 'Directus asset token param', regex: /[?&]token=[A-Za-z0-9_\-./+=]{10,}/gi },
  ];

  const envToken = process.env.DIRECTUS_TOKEN;
  if (envToken && envToken.length >= 8) {
    patterns.push({ name: 'DIRECTUS_TOKEN value', regex: new RegExp(escapeRegex(envToken), 'g') });
  }

  const envUrl = process.env.DIRECTUS_URL;
  if (envUrl) {
    patterns.push({ name: 'DIRECTUS_URL value', regex: new RegExp(escapeRegex(envUrl), 'g') });
  }

  const envSlug = process.env.DIRECTUS_SITE_SLUG;
  if (envSlug && envSlug.length >= 3) {
    patterns.push({
      name: 'DIRECTUS_SITE_SLUG in /items/ path',
      regex: new RegExp(`/items/[^"'\\s]*${escapeRegex(envSlug)}`, 'g'),
    });
  }

  return patterns;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function collectFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else if (TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function auditFile(filePath, patterns) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const findings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        findings.push({
          file: filePath.replace(DIST_DIR + '/', ''),
          line: i + 1,
          pattern: pattern.name,
        });
        pattern.regex.lastIndex = 0;
      }
    }
  }

  return findings;
}

async function main() {
  const patterns = getPatterns();
  let files;
  try {
    files = await collectFiles(DIST_DIR);
  } catch {
    console.error('No dist/ directory found. Run `pnpm build` first.');
    process.exit(1);
  }

  const allFindings = [];
  for (const file of files) {
    const findings = await auditFile(file, patterns);
    allFindings.push(...findings);
  }

  if (allFindings.length === 0) {
    console.log(`Build audit PASSED: no sensitive patterns found in dist/ (${files.length} files scanned)`);
    process.exit(0);
  } else {
    console.error(`Build audit FAILED: ${allFindings.length} finding(s) in dist/\n`);
    for (const f of allFindings) {
      console.error(`  ${f.file}:${f.line} — ${f.pattern}`);
    }
    process.exit(1);
  }
}

main();
