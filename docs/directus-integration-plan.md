# Directus Integration Plan

Status: Authoritative implementation plan for the Directus bead tree as of 2026-06-07.

This document is the tracked public plan for `astro-template-directus-integration-rb2`. The local `prd/PRD.md` file is ignored by git and may contain draft notes; use this document plus the open `br` beads as the implementation source of truth.

## Purpose

`astro-template` is a static Astro business-site template with local content for blog posts, services, team members, and locations. The Directus integration makes future sites Directus-ready while preserving the template's no-CMS first-run experience.

The integration must:

- Fetch blog articles, blog categories, and cities from Directus when configured.
- Map Directus `cities` to the template's existing Locations UI and `/locations/` routes.
- Fall back to local content when Directus is not configured, unreachable, empty, or non-strict.
- Keep Team and Services local-only unless a future bead deliberately expands scope.
- Keep this public repository free of secrets, tokens, private instance URLs, and infrastructure hints.

## Architecture

Pages must not import Directus modules directly. They import the content provider:

```text
src/pages/*
  -> src/lib/content/provider.ts
       -> src/lib/content/local.ts
       -> src/lib/directus/*
```

The provider exposes source-agnostic APIs:

- `getBlogPosts()`
- `getBlogPostBySlug(slug)`
- `getBlogCategories()`
- `getRelatedPosts(post, limit?)`
- `getLocations()`
- `getLocationBySlug(slug)`

Each content area selects a source tier independently:

1. Live Directus
2. Site-slug-validated disk cache
3. Local content

Do not silently mix live CMS content with local fallback content for the same content area. If live CMS blog posts are active, local fallback blog posts should not be appended. If live CMS locations are active, local locations should not be appended. Fallback is selected when the higher tier is unavailable or empty in non-strict mode.

`DIRECTUS_REQUIRED=true` is production strict mode. In strict mode, live CMS failures or zero-item responses should fail clearly with redacted diagnostics instead of falling back silently.

## Security Rules

This is a public repository.

- `.env.example` must contain empty values only, including `CACHE_DIR=`.
- No committed file may contain a concrete private Directus host, token, bearer credential, or sensitive infrastructure hint.
- Directus values come from server-side env vars only. Do not use `PUBLIC_DIRECTUS_*`.
- `.cache/` remains ignored because it can contain content payloads, asset URLs, and site slugs.
- All Directus diagnostics pass through `redact()` before logging.
- Build output audit scripts scan `dist/` for tokens, bearer strings, unsafe Directus asset URLs, and common query-token patterns.
- CMS markdown is rendered through a custom sanitized Markdown pipeline before it reaches page templates.

## Environment Contract

Committed `.env.example` variables, all with empty values:

```bash
DIRECTUS_URL=
DIRECTUS_TOKEN=
DIRECTUS_SITE_SLUG=
DIRECTUS_ASSET_BASE_URL=
CACHE_DIR=
DIRECTUS_REQUIRED=
```

`src/env.d.ts` declares those fields as optional strings because the template must build with no Directus configuration.

## Data Scope

Directus collections in this plan:

- `blog_articles`
- `blog_categories`
- `cities`
- `directus_files` only as related asset metadata

Local-only content in this plan:

- `src/content/team/`
- `src/content/services/`
- Existing fallback blog posts under `src/content/blog/`
- Existing fallback locations under `src/content/locations/locations.json`

Row-level multitenancy is enforced by filtering Directus queries on `site.slug === DIRECTUS_SITE_SLUG`.

## Shared View Models

`src/lib/content/types.ts` defines the page-facing contract:

- `ImageMeta`
- `BlogPost`
- `BlogCategory`
- `Location`

Important constraints:

- `BlogPost.content` is raw markdown/text, never rendered HTML.
- `BlogPost.rendered` is sanitized HTML plus headings for CMS posts only.
- Local blog posts use Astro's native content rendering path.
- `Location.longDescription` and FAQ answers keep raw/plain text source.
- CMS-rendered location HTML uses separate fields such as `longDescriptionHtml` and `answerHtml`.
- `Location` must represent both existing local `locations.json` entries and Directus city records without fake placeholder fields.

## Current Route Targets

Use the existing Astro route files:

- Blog listing: `src/pages/blog/[...page].astro`
- Blog detail: `src/pages/blog/[slug].astro`
- Blog tags index: `src/pages/blog/tags/index.astro`
- Blog tag pages: `src/pages/blog/tags/[tag]/[...page].astro`
- Blog categories index: `src/pages/blog/categories/index.astro`
- Blog category pages: `src/pages/blog/categories/[category]/[...page].astro`
- Locations listing: `src/pages/locations/index.astro`
- Location detail: `src/pages/locations/[slug].astro`
- RSS: `src/pages/rss.xml.ts`

Do not create singular `/blog/tag/` or `/blog/category/` routes. Do not create duplicate Locations routes.

## Phase Plan

### Phase 0: Plan Reconciliation and Baseline Quality

- This document is the tracked public Directus plan.
- `prd/PRD.md` is ignored and may remain local draft material.
- Baseline quality gates must be known before implementation phases proceed.

### Phase 1: DX and Config Foundation

- Create `.env.example` with empty placeholders only.
- Add `src/env.d.ts` Directus env declarations.
- Verify `.cache/` remains ignored.
- Add generic Astro remote image support without hardcoded domains.
- Add diagnostic logger and `redact()`.

### Phase 2: Core Client and Types

- Add Directus SDK and Markdown pipeline dependencies.
- Define raw Directus API types.
- Define shared content view model types.
- Create Directus client with auth, timeouts, site-scoped queries, and draft-mode behavior.
- Create asset URL safety helpers.
- Create sanitized Markdown renderer.
- Create Directus verify/sync script.
- Create test factories.

### Phase 3: Content Provider and Blog Integration

- Create local content adapter for existing Astro collections.
- Create disk cache with site slug validation and atomic writes.
- Create CMS normalization for blog articles and categories.
- Create content provider with memoized fallback chain.
- Update ImageMeta-consuming components.
- Migrate blog listing, detail, related posts, taxonomy pages, and RSS to provider APIs.
- Add cache, provider, normalization, asset-safety, Markdown-sanitization, and local-adapter tests.

Taxonomy pages use the current `/blog/tags/` and `/blog/categories/` routes. Directus tags are deferred, so CMS posts may have `tags: []`; tag routes must build gracefully.

### Phase 4: Locations Integration

- Normalize Directus `cities` records into the shared `Location` view model.
- Add provider location methods with local `locations.json` fallback.
- Update existing location listing and detail pages to consume provider data.
- Keep the Locations nav link based on provider data availability after fallback.
- Add location normalization and location provider fallback tests.

With Directus unset, `/locations/` and existing local location detail pages must continue to render.

### Phase 5: Supporting Features

- Add team/blog author resolution utilities.
- Validate CMS `author_slug` values against local team entries.
- Keep Team local-only.
- Warn in non-strict mode and fail clearly in strict mode for unresolved CMS author slugs.

### Phase 6: Safety and Audit Scripts

- Add build output audit script for token leakage.
- Add launch readiness signoff script.
- Add multi-config build integration tests.
- Scripts and artifacts must redact sensitive values and avoid private hosts/tokens.

## Acceptance Criteria

- The template builds with no Directus env vars set.
- Valid Directus configuration renders CMS blog/categories/locations.
- Non-strict unreachable/empty CMS falls back to cache or local content per content area.
- Strict mode fails clearly and redacts sensitive values.
- Existing local blog, locations, services, and team content remains usable.
- RSS and sitemap behavior remains source-agnostic.
- No committed file or build artifact leaks secrets, tokens, private hosts, or sensitive infrastructure hints.
- Tests cover provider fallback, cache site-slug isolation, normalization, markdown sanitization, token-safe asset URLs, and local fallback behavior.
