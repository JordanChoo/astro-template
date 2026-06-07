# Astro Business Website Template

A professional business website template built with [Astro](https://astro.build), designed for service-based businesses, agencies, and consultancies. Works out of the box with local content files, and optionally connects to a Directus CMS for team-managed content.

## What This Template Includes

**Pages:**

- **Homepage:** Hero banner, feature highlights, statistics, services overview, client testimonials, FAQ, and call-to-action sections
- **Services:** Listing page + individual detail pages for each service you offer
- **Team:** Team listing + individual profile pages for each team member
- **Locations:** Office/branch listing + detail pages with addresses, hours, and service areas
- **Blog:** Full blog with pagination, tag filtering, category filtering, RSS feed, and table of contents
- **Contact:** Contact page
- **Legal:** Privacy policy and terms of service pages

**Built-in Features:**

- Mobile-friendly responsive design
- SEO optimized (meta tags, Open Graph images, XML sitemap, structured data for Google)
- Blog with Markdown/MDX support, reading time, and related posts
- Optional CMS integration via [Directus](https://directus.io) with graceful fallback
- Google Tag Manager integration (just add your GTM ID)
- Fast performance: zero JavaScript shipped to the browser by default
- Comprehensive test suite (unit tests + end-to-end build integration tests)
- Build-time security auditing to prevent sensitive data leakage

## Prerequisites

Before you start, you'll need the following installed on your computer:

1. **Node.js** (version 18.17.1 or higher): [Download Node.js](https://nodejs.org/)
2. **pnpm** (package manager). After installing Node.js, open a terminal and run:
   ```sh
   npm install -g pnpm
   ```
3. **Git**: [Download Git](https://git-scm.com/downloads)

To check if these are installed, open a terminal and run:

```sh
node --version
pnpm --version
git --version
```

Each command should print a version number.

## Getting Started

### 1. Clone the repository

```sh
git clone <your-repo-url> my-website
cd my-website
```

### 2. Install dependencies

```sh
pnpm install
```

### 3. Start the development server

```sh
pnpm dev
```

Open your browser to **http://localhost:4321** to see the site. Changes you make to files will automatically appear in the browser.

### 4. Stop the server

Press `Ctrl + C` in the terminal.

## Content Architecture

The template supports two content modes that work together:

### Local Content (default)

Out of the box, all content lives in the repository as structured files:

- **Blog posts:** Markdown/MDX files in `src/content/blog/`
- **Services:** JSON in `src/content/services/services.json`
- **Team members:** Markdown files in `src/content/team/`
- **Locations:** JSON in `src/content/locations/locations.json`

Local content is validated at build time using Zod schemas, so invalid data (missing required fields, malformed slugs, duplicate entries) fails the build immediately rather than producing broken pages.

### CMS Mode (Directus)

When configured, the site connects to a [Directus](https://directus.io) instance (self-hosted or cloud) and fetches content at build time. Directus provides a visual editing interface, user roles, and a structured API, which is useful when non-technical team members need to manage content.

The CMS integration uses a **three-tier fallback chain**:

1. **Live CMS.** Fetch directly from Directus via its REST API.
2. **Disk cache.** If the CMS is unreachable, fall back to the last successful fetch (stored in `.cache/`).
3. **Local content.** If no cache exists, fall back to the repository's local content files.

The site always builds successfully, even if the CMS is temporarily down. The fallback is automatic and requires no manual intervention.

To enable CMS mode, set the environment variables in `.env`:

```sh
DIRECTUS_URL=              # Your Directus instance URL
DIRECTUS_TOKEN=            # Static access token
DIRECTUS_SITE_SLUG=        # Site identifier for multi-tenant setups
DIRECTUS_ASSET_BASE_URL=   # Override base URL for image/asset links (defaults to DIRECTUS_URL)
```

Set `DIRECTUS_REQUIRED=true` to make the build fail when the CMS is unreachable (useful for production CI where you never want stale content).

### Multi-Tenancy

The Directus integration supports row-level multi-tenancy through a `sites` collection. Articles and locations are scoped to a site via the `DIRECTUS_SITE_SLUG` environment variable; categories are shared across all sites. A single Directus instance can serve content for multiple websites, each seeing only its own articles and locations while sharing a common category taxonomy.

## Setting Up Directus

If you want to use Directus as your CMS, you need to create the expected collections and fields in your Directus instance. The template queries three collections: `blog_articles`, `blog_categories`, and `cities`. Optionally, a `sites` collection enables multi-tenancy.

The tables below list only the fields you need to create manually. Directus system fields (`id`, `date_created`, `date_updated`) are added automatically to every collection.

### 1. Create the `sites` collection (optional, for multi-tenancy)

If you plan to serve multiple websites from one Directus instance, create a `sites` collection first. Otherwise, skip this step.

| Field  | Type   | Notes                           |
| :----- | :----- | :------------------------------ |
| `slug` | String | Unique identifier for each site |

### 2. Create the `blog_categories` collection

| Field         | Type    | Notes                         |
| :------------ | :------ | :---------------------------- |
| `name`        | String  | Category display name         |
| `slug`        | String  | URL-friendly identifier       |
| `description` | Text    | Optional category description |
| `sort`        | Integer | Display order                 |

### 3. Create the `blog_articles` collection

| Field                 | Type         | Notes                                             |
| :-------------------- | :----------- | :------------------------------------------------ |
| `status`              | String       | Use Directus status field (`draft`, `published`)  |
| `date_published`      | DateTime     | Publication date                                  |
| `title`               | String       | Article title                                     |
| `slug`                | String       | URL-friendly identifier (unique)                  |
| `short_description`   | Text         | Excerpt / meta description fallback               |
| `content`             | WYSIWYG/MD   | Article body (Markdown)                           |
| `author_slug`         | String       | Matches a team member slug in `src/content/team/` |
| `category`            | M2O          | Relation to `blog_categories`                     |
| `featured_image_file` | File (image) | Uploaded featured image                           |
| `featured_image`      | String       | External image URL (fallback if no file uploaded) |
| `og_image_file`       | File (image) | Open Graph image                                  |
| `og_image`            | String       | External OG image URL                             |
| `twitter_image_file`  | File (image) | Twitter card image                                |
| `twitter_image`       | String       | External Twitter image URL                        |
| `ai_key_takeaways`    | JSON         | Array of `{ text: string }` objects               |
| `source_links`        | JSON         | Array of URL strings                              |
| `title_tag`           | String       | Custom `<title>` override                         |
| `meta_description`    | String       | Custom meta description override                  |
| `canonical_url`       | String       | Canonical URL (if content is syndicated)          |
| `robots`              | String       | Robots directive (e.g., `noindex, nofollow`)      |
| `site`                | M2O          | Relation to `sites` (only if using multi-tenancy) |

### 4. Create the `cities` collection

| Field                   | Type         | Notes                                                |
| :---------------------- | :----------- | :--------------------------------------------------- |
| `status`                | String       | Use Directus status field (`draft`, `published`)     |
| `city_name`             | String       | City display name                                    |
| `slug`                  | String       | URL-friendly identifier (unique)                     |
| `state_code`            | String       | State/province abbreviation (e.g., `TX`)             |
| `heading`               | String       | Custom page heading (falls back to city name)        |
| `short_description`     | Text         | Excerpt for listings                                 |
| `content`               | WYSIWYG/MD   | Extended description (Markdown)                      |
| `featured_image_file`   | File (image) | Location photo                                       |
| `featured_image`        | String       | External image URL                                   |
| `address`               | String       | Full street address                                  |
| `phone`                 | String       | Location phone number                                |
| `latitude`              | Float        | Geographic latitude                                  |
| `longitude`             | Float        | Geographic longitude                                 |
| `service_area_keywords` | JSON         | Array of strings for local SEO                       |
| `key_statistics`        | JSON         | Array of `{ text: string }` (format: `Label: Value`) |
| `questions_answers`     | JSON         | Array of `{ question, answer }` for FAQ section      |
| `title_tag`             | String       | Custom `<title>` override                            |
| `meta_description`      | String       | Custom meta description override                     |
| `canonical_url`         | String       | Canonical URL                                        |
| `robots`                | String       | Robots directive                                     |
| `site`                  | M2O          | Relation to `sites` (only if using multi-tenancy)    |

### 5. Create an access token

1. In Directus, create a dedicated role (e.g., "API Read Only") with read-only access to the collections above
2. Create a user with that role, then generate a static token for that user under their user settings
3. Add the token to your `.env` file as `DIRECTUS_TOKEN`

### 6. Configure environment variables

```sh
DIRECTUS_URL=https://your-directus-instance.example.com
DIRECTUS_TOKEN=your-static-token
DIRECTUS_SITE_SLUG=your-site-slug        # leave empty if not using multi-tenancy
DIRECTUS_ASSET_BASE_URL=                  # leave empty to use DIRECTUS_URL for assets
```

Run `pnpm build` to verify the connection. The build log will show `[directus] Source: live (connected)` if everything is working.

## How to Customize the Site

### Site Identity & Contact Info

Edit `src/config/site.ts` and replace the placeholder values with your own:

- **name:** Your business name
- **tagline:** Your slogan or tagline
- **description:** A short description of your business (used in search results)
- **phone:** Your business phone number
- **address:** Your business address
- **social:** Links to your social media profiles
- **seo.siteUrl:** Your live website URL (e.g., `https://www.yourbusiness.com`)
- **gtmId:** Your Google Tag Manager ID (or remove the line if not using GTM)
- **operatingHours:** Your business hours

### Homepage Content

Edit `src/data/homepage.json` to change the homepage hero text, features, statistics, testimonials, FAQ, and call-to-action content.

### Services

Edit the JSON files in `src/content/services/` to add, remove, or modify your service offerings. Each service has a name, description, icon, and list of features.

### Team Members

Add or edit Markdown files in `src/content/team/`. Each file represents a team member with their name, role, bio, avatar image, and social links.

### Blog Posts

Add Markdown (`.md`) or MDX (`.mdx`) files to `src/content/blog/`. Each post needs frontmatter at the top of the file with a title, description, publish date, author, and tags. Set `draft: true` to hide a post from the live site.

### Locations

Edit the JSON files in `src/content/locations/` to add or modify office locations with addresses, phone numbers, coordinates, operating hours, and service areas.

### Images

Place images in the `public/images/` directory. Reference them in your content as `/images/your-image.jpg`.

## Available Commands

Run these from the project root in a terminal:

| Command         | What it does                                                  |
| :-------------- | :------------------------------------------------------------ |
| `pnpm dev`      | Starts the local development server                           |
| `pnpm build`    | Builds the production site to `./dist/` (runs security audit) |
| `pnpm preview`  | Previews the production build locally                         |
| `pnpm check`    | Runs TypeScript type checking (strict mode)                   |
| `pnpm lint`     | Checks code for style issues                                  |
| `pnpm format`   | Auto-formats all code files                                   |
| `pnpm test`     | Runs unit tests (158 tests across 11 files)                   |
| `pnpm test:e2e` | Runs end-to-end build integration tests (4 scenarios)         |

## Deploying to Cloudflare Pages via GitHub

Cloudflare Pages is a free hosting platform that automatically builds and deploys your site whenever you push changes to GitHub.

### Step 1: Push your code to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (do **not** initialize it with a README)
2. In your terminal, from the project folder:

   ```sh
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

### Step 2: Connect to Cloudflare Pages

1. Sign up or log in at [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. In the left sidebar, click **Workers & Pages**
3. Click **Create** then select the **Pages** tab
4. Click **Connect to Git**
5. Select your GitHub account and authorize Cloudflare if prompted
6. Choose the repository you pushed to in Step 1

### Step 3: Configure the build settings

On the build configuration screen, set the following:

| Setting                    | Value        |
| :------------------------- | :----------- |
| **Framework preset**       | Astro        |
| **Build command**          | `pnpm build` |
| **Build output directory** | `dist`       |

Under **Environment variables**, add:

| Variable name  | Value |
| :------------- | :---- |
| `NODE_VERSION` | `20`  |

If you are using Directus, also add:

| Variable name        | Value                                    |
| :------------------- | :--------------------------------------- |
| `DIRECTUS_URL`       | Your Directus instance URL               |
| `DIRECTUS_TOKEN`     | Your static access token                 |
| `DIRECTUS_SITE_SLUG` | Your site slug (for multi-tenant setups) |
| `DIRECTUS_REQUIRED`  | `true` (recommended for production)      |

Click **Save and Deploy**.

### Step 4: Wait for the first build

Cloudflare will build and deploy your site. This usually takes 1-2 minutes. Once complete, you'll get a live URL like `https://your-project.pages.dev`.

### Step 5: Set up a custom domain (optional)

1. From your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `www.yourbusiness.com`)
4. Follow the instructions to update your DNS records

### Automatic deployments

After the initial setup, every time you push changes to the `main` branch on GitHub, Cloudflare Pages will automatically rebuild and deploy your site. No manual steps required.

### Update your site URL

After deployment, update the `site` value in `astro.config.mjs` to your live URL:

```js
export default defineConfig({
  site: 'https://www.yourbusiness.com',
  // ...
});
```

Also update `seo.siteUrl` in `src/config/site.ts` to match.

## Project Structure

```
src/
  config/
    site.ts                     Site-wide configuration (name, contact, SEO)
  content/
    blog/                       Blog posts (Markdown/MDX files)
    team/                       Team member profiles (Markdown files)
    services/                   Service definitions (JSON + Zod schema)
    locations/                  Office locations (JSON + Zod schema)
  data/
    homepage.json               Homepage content (hero, features, stats, etc.)
    pages.json                  Page metadata for listing pages
  lib/
    content/
      provider.ts               Content source router (CMS > cache > local)
      types.ts                  Shared content type definitions
      local.ts                  Local file content adapters
      authors.ts                Author resolution with caching
    directus/
      client.ts                 Directus SDK client and fetch functions
      normalize.ts              CMS to internal type transformers (articles)
      normalize-locations.ts    CMS to internal type transformers (locations)
      markdown.ts               Unified markdown pipeline (remark/rehype)
      cache.ts                  Disk cache read/write with validation
      assets.ts                 Asset URL resolution and token safety
      logger.ts                 Redacted logging and build diagnostics
      types.ts                  Raw Directus type definitions
  components/
    sections/                   Page sections (Hero, Features, Stats, etc.)
    seo/                        Structured data components (JSON-LD)
    icons/                      Icon components
  layouts/
    BaseLayout.astro            Root HTML layout
    PageLayout.astro            Standard page layout
    PostLayout.astro            Blog post layout
  pages/                        All site routes/pages
  utils/
    reading-time.ts             Word-count-based reading time estimator
    related-posts.ts            Tag/category-scored related post algorithm
scripts/
  audit-build.mjs               Post-build security scanner for dist/
  launch-check.mjs              Pre-deploy readiness checker
tests/
  directus/                     Unit tests for CMS integration layer
  content/                      Unit tests for content adapters
  e2e/                          End-to-end build integration tests
public/
  images/                       Static images (logos, photos, etc.)
  fonts/                        Custom fonts (if any)
astro.config.mjs                Astro framework configuration
package.json                    Project dependencies and scripts
.env.example                    Environment variable template (empty placeholders only)
```

## SEO and Structured Data

Every page type emits the appropriate [Schema.org](https://schema.org) structured data as JSON-LD, which helps search engines understand your content:

| Page Type    | Schema Type    | What it Provides                                            |
| :----------- | :------------- | :---------------------------------------------------------- |
| Homepage     | Organization   | Business name, logo, contact info, social profiles          |
| Homepage     | WebSite        | Site-level search and identity                              |
| Blog posts   | BlogPosting    | Title, author, publish date, images, article body           |
| Services     | Service        | Service name, description, provider info                    |
| Locations    | LocalBusiness  | Address, phone, coordinates, operating hours, service areas |
| Team members | Person         | Name, role, social profiles                                 |
| All pages    | BreadcrumbList | Navigation hierarchy for search result breadcrumbs          |
| FAQ sections | FAQPage        | Question/answer pairs for rich results                      |

The sitemap automatically excludes paginated pages (only the first page of each archive is indexed) and respects per-page `robots` directives from the CMS.

## Related Posts Algorithm

The blog uses a scoring algorithm to surface relevant related posts on each article page:

1. **Tag matching.** Each shared tag between the current post and a candidate is worth 10 points.
2. **Category matching.** Each shared category is worth 5 points. Tags are weighted higher because they are more specific.
3. **Deterministic tiebreaking.** When posts have equal scores, a hash-based sort (djb2 algorithm seeded by the current post's slug) produces a stable ordering that won't shuffle between builds.
4. **Guaranteed results.** If no posts share any tags or categories, the algorithm falls back to the deterministic hash order rather than showing nothing.

This approach avoids the "same three posts everywhere" problem of naive category-only matching while remaining fully deterministic (no randomness means no build-to-build churn in your HTML output).

## Security Model

Because the template connects to an external CMS at build time, it prevents credentials and infrastructure details from leaking into the public output through several checks:

- **Redacted logging.** All console output from the Directus integration passes through a `redact()` function that replaces environment variable values (URLs, tokens, slugs) with placeholder masks like `[redacted-url]`. This covers info, warning, and error messages.
- **Build-time asset auditing.** Every resolved asset URL is checked by `assertNoTokenLeakage()` before it reaches any template. If a URL contains an `access_token` or `token` query parameter, the build fails immediately.
- **Post-build scan.** After `astro build` completes, `scripts/audit-build.mjs` runs automatically (via `postbuild`) and scans every text file in `dist/` for patterns like Bearer tokens, access_token parameters, and literal env var values. Any match fails the build.
- **No public env vars.** Directus environment variables intentionally avoid Astro's `PUBLIC_` prefix, so they are only available server-side during the build and never bundled into client JavaScript.
- **Safe `.env.example`.** The example env file contains only empty placeholders with no sample values, instance URLs, or infrastructure hints.

## Testing

The test suite has two layers:

### Unit Tests

158 tests across 11 files, run with [Vitest](https://vitest.dev) and [happy-dom](https://github.com/capricorn86/happy-dom) for DOM emulation:

- **Content provider:** Verifies the fallback chain logic (live CMS, cache, local) and strict mode behavior
- **Directus client:** Tests SDK configuration, site-scoped filtering, timeout handling
- **Normalization:** Validates article, category, and location data transformation from raw CMS types to the internal content model
- **Cache:** Tests read/write, version checking, site-slug validation, and corruption handling
- **Asset safety:** Verifies token detection and URL sanitization across edge cases
- **Markdown:** Tests the sanitization pipeline (allowed/blocked tags, attribute filtering, XSS prevention)
- **Logger:** Tests redaction of env values across both `import.meta.env` and `process.env`, including URL-encoded variants

### End-to-End Build Integration Tests

4 scenarios that run full `astro build` processes with controlled environment variables:

1. **Local-only.** No CMS configured; verifies blog, RSS, and locations build from local content.
2. **CMS-live.** Connected to a real Directus instance; verifies CMS content renders and cache is written. Skipped in CI without credentials.
3. **CMS-unreachable.** Points to `127.0.0.1:9` (guaranteed-unreachable); verifies graceful fallback to local content.
4. **Strict mode.** Same unreachable URL with `DIRECTUS_REQUIRED=true`; verifies the build fails clearly without leaking the URL or token in the error output.

Each scenario also scans the full `dist/` output for credential leakage.

## Design Principles

**Content-source agnostic.** Pages import from `src/lib/content/provider.ts`, which returns a unified `BlogPost`, `BlogCategory`, or `Location` type regardless of whether the data came from Directus, a cache file, or a local Markdown/JSON file. Page templates never know or care about the content source.

**Fail-fast validation.** Zod schemas validate local content at import time. If a `locations.json` entry has a malformed slug or duplicate key, the build fails with a clear error message before any pages are generated. The Directus integration validates cache metadata (version, site slug) on read, rejecting stale or mismatched data.

**Memoized data fetching.** Each content type (posts, categories, locations) is fetched exactly once per build via module-level promise memoization. Subsequent calls to `getBlogPosts()`, `getBlogCategories()`, or `getLocations()` return the same resolved promise, avoiding redundant CMS requests or file reads across pages.

**Unified markdown pipeline.** CMS content and local content both pass through the same remark/rehype pipeline (GFM, sanitization, slug generation). The sanitization schema explicitly allowlists HTML tags and attributes, stripping anything not in the list rather than blocklisting known-bad patterns.

**Zero client JavaScript by default.** Astro's static output mode means no JavaScript is shipped to the browser unless a component explicitly opts in with `client:*` directives. The entire site is pre-rendered HTML and CSS.

## Tech Stack

- [Astro](https://astro.build) for static site generation
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [TypeScript](https://www.typescriptlang.org) in strict mode (`exactOptionalPropertyTypes`)
- [MDX](https://mdxjs.com) for Markdown with component support in blog posts
- [Directus](https://directus.io) for optional headless CMS integration
- [Zod](https://zod.dev) for schema validation of content and configuration
- [Vitest](https://vitest.dev) for unit and E2E testing
- [unified](https://unifiedjs.com) for the Markdown processing pipeline (remark + rehype)
- [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) for pre-commit quality gates
