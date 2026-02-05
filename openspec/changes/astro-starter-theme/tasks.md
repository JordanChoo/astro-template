## 1. Project Scaffolding and Configuration

- [ ] 1.1 Initialize Astro 5.x project with `pnpm create astro@latest` (empty template, TypeScript strict)
- [ ] 1.2 Install and configure Tailwind CSS v4 as a Vite plugin in `astro.config.mjs`, set up `src/styles/global.css` with Tailwind directives, `@theme` design tokens (semantic color palette: primary, secondary, accent, neutral; font family; spacing scale), and `@tailwindcss/typography` for prose styling
- [ ] 1.3 Install MDX integration (`@astrojs/mdx`)
- [ ] 1.4 Install sitemap integration (`@astrojs/sitemap`) and configure site URL with filter function to exclude paginated and noindex pages. Configure priority, changefreq, and lastmod per page type (see seo-infrastructure spec for values).
- [ ] 1.5 Install RSS helper (`@astrojs/rss`)
- [ ] 1.6 Configure `astro.config.mjs` — static output mode, Vite plugin for Tailwind v4, integrations, site URL

## 2. Developer Tooling

- [ ] 2.1 Configure `tsconfig.json` — extend Astro base config, strict mode
- [ ] 2.2 Set up ESLint with Astro plugin and TypeScript ESLint rules, add `eslint-config-prettier`, add `lint` script to `package.json`
- [ ] 2.3 Set up Prettier with Astro plugin, add `format` script to `package.json`
- [ ] 2.4 Create `.vscode/settings.json` — format-on-save, Prettier as default formatter, ESLint auto-fix
- [ ] 2.5 Create `.vscode/extensions.json` — recommend Astro, ESLint, Prettier, Tailwind IntelliSense
- [ ] 2.6 Create `.editorconfig` — 2-space indent, UTF-8, LF, trim trailing whitespace, final newline
- [ ] 2.7 Create `.nvmrc` pinned to Node.js `22`, add `engines` field `>=18.17.1` to `package.json`
- [ ] 2.8 Set up Husky + lint-staged — pre-commit hook runs ESLint and Prettier on staged files
- [ ] 2.9 Configure Vitest for Astro — `pnpm run test` script, support for component output and utility testing, build smoke test
- [ ] 2.10 Create GitHub Actions CI workflow — run `pnpm run lint`, `pnpm run check`, `pnpm run build`, `pnpm run test` on PRs; block merge on failure
- [ ] 2.11 Create GitHub Actions CD workflow — build and deploy to Cloudflare Pages on merge to main

## 3. Site Configuration

- [ ] 3.1 Create `src/config/site.ts` with typed interface — business identity (name, tagline, description, logo path), optional phone, optional address (street, city, state, zip), social links (all optional: Facebook, Instagram, Twitter/X, LinkedIn, YouTube, TikTok), optional Twitter handle, SEO defaults (title template, description, OG image path + dimensions, site URL), GTM ID, optional default operating hours (Schema.org-aligned: dayOfWeek must be Monday/Tuesday/Wednesday/Thursday/Friday/Saturday/Sunday capitalized, open/close in 24h HH:MM format 00:00-23:59, supports split hours and day grouping), footer secondary nav (array of {text, link} objects, defaults to Privacy/Terms/Sitemap)
- [ ] 3.2 Implement build-time validation — fail on empty business name, malformed social URLs, empty required fields, invalid operating hours day names or time formats; warn on missing optional fields
- [ ] 3.3 Populate with demo business data (placeholder company name, phone, address, social links, operating hours)

## 4. Layouts and Navigation

- [ ] 4.1 Create `BaseLayout.astro` — HTML shell, head with SEO component slot, GTM injection, Google Fonts with `font-display: swap` and `<link rel="preconnect">`, favicon references, body with GTM noscript
- [ ] 4.2 Create `PageLayout.astro` — extends BaseLayout, adds Header, main content slot with `id="main-content"`, Footer
- [ ] 4.3 Create `PostLayout.astro` — extends PageLayout, adds post title, author info (linked to team page), date, reading time, featured image, content slot, tags, related posts
- [ ] 4.4 Create `Header.astro` — logo/business name, desktop nav links (Home, Services, Locations, Blog, Team, Contact), active nav states (prefix matching for all links, exact match for Home), skip-to-content link as first focusable element
- [ ] 4.5 Create mobile navigation (below Tailwind `md` breakpoint / 768px) — hamburger menu with vanilla JS toggle, full-screen overlay, focus trapping, Escape-to-close, scroll lock, `aria-expanded`, `aria-label` on toggle button
- [ ] 4.6 Create `Footer.astro` — business name, contact info from config (phone/address omitted when not configured), social media icon links (inline SVG Astro components, external links open in new tab with rel="noopener noreferrer"), configurable secondary nav from site config (defaults: Privacy Policy, Terms of Service, Sitemap), copyright with build-time year
- [ ] 4.7 Create `Breadcrumbs.astro` — path-based breadcrumb navigation: Home > Services > [Service], Home > Locations > [Location], Home > Blog > [Post Title], Home > Blog > Tags > [tag] (lowercase), Home > Blog > Categories > [category] (lowercase), Home > Team > [Name], Home > Contact, Home > About, Home > Privacy Policy, Home > Terms of Service. Hidden on homepage and 404 page.
- [ ] 4.8 Create `src/pages/contact.astro` — display phone (when configured), address (when configured), default operating hours (when configured) from site config. No contact form.
- [ ] 4.9 Create `src/pages/about.astro` — about page with placeholder content
- [ ] 4.10 Create `src/pages/404.astro` — custom 404 page using PageLayout, no breadcrumbs, friendly error message and link to homepage
- [ ] 4.11 Create `src/pages/privacy.astro` — Privacy Policy page with boilerplate placeholder content
- [ ] 4.12 Create `src/pages/terms.astro` — Terms of Service page with boilerplate placeholder content

## 5. SEO Infrastructure

- [ ] 5.0 Create `src/data/pages.json` with Zod schema — listing page titles and descriptions for /blog/, /services/, /locations/, /team/, tag pages, category pages
- [ ] 5.1 Create `SEO.astro` component — meta title (with template from config), meta description (console warning when >160 chars, sourced from pages.json for listings), canonical URL (self-referencing for paginated pages), viewport, optional `noindex` support via `<meta name="robots" content="noindex">`
- [ ] 5.2 Add Open Graph tags to SEO component — og:title, og:description, og:url, og:image (with dimensions, fallback chain: page → config → omit), og:type (article for blog posts with article:published_time and article:author), og:site_name
- [ ] 5.3 Add Twitter card tags to SEO component — twitter:card (summary_large_image), twitter:title, twitter:description, twitter:image, twitter:site (from config), twitter:creator (from author's team profile on blog posts)
- [ ] 5.4 Create `OrganizationLD.astro` — JSON-LD for homepage (business name, logo, contact, social profiles from site config)
- [ ] 5.5 Create `WebSiteLD.astro` — JSON-LD for homepage (site name, URL)
- [ ] 5.6 Create `BlogPostingLD.astro` — JSON-LD for blog posts (headline, description, datePublished, author, image)
- [ ] 5.7 Create `ServiceLD.astro` — JSON-LD for service pages (Service/ProfessionalService, name, description, provider from site config)
- [ ] 5.8 Create `LocalBusinessLD.astro` — JSON-LD for location pages (name, address, telephone when available, optional geo, optional openingHoursSpecification)
- [ ] 5.9 Create `BreadcrumbLD.astro` — JSON-LD for breadcrumb navigation
- [ ] 5.10 Create `FAQLD.astro` — FAQPage JSON-LD for pages with FAQ section (question/answer pairs)
- [ ] 5.11 Create `GTM.astro` — conditional GTM head script + body noscript injection based on site config gtmId
- [ ] 5.12 Create `public/robots.txt` — allow all, reference sitemap URL
- [ ] 5.13 Create favicon files — `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`; reference in BaseLayout head
- [ ] 5.14 Ensure all JSON-LD components output separate `<script type="application/ld+json">` tags (no @graph array)

## 6. Marketing Homepage

- [ ] 6.1 Create `src/data/homepage.json` with Zod schema for build-time validation — hero data (headline, subheadline, CTA with text + link), features array (icon, title, description), stats array ({value: string, label: string}), testimonials array ({quote, name, attribution?}), CTA data ({headline, button: {text, link}}), FAQ items array ({question, answer}), contact section toggle
- [ ] 6.2 Create `Hero.astro` section component — accepts data via props, headline, subheadline, CTA button, full-width min 60vh, responsive layout
- [ ] 6.3 Create `Features.astro` section component — accepts data via props, grid of feature cards (icon from lookup object, title, description), responsive columns
- [ ] 6.4 Create `Stats.astro` section component — accepts data via props, numerical statistics with labels in a responsive row
- [ ] 6.5 Create `Testimonials.astro` section component — accepts data via props, customer quotes with name/role attribution
- [ ] 6.6 Create `CTA.astro` section component — accepts data via props, contrasting background, headline and action buttons
- [ ] 6.7 Create `FAQ.astro` section component — accepts data via props, `<details>`/`<summary>` accordion styled with Tailwind, keyboard accessible. Includes FAQLD component for FAQPage JSON-LD.
- [ ] 6.8 Create `ContactInfo.astro` section component — accepts data via props, phone/address/operating hours from site config (no form, no email)
- [ ] 6.9 Create `src/pages/index.astro` — import homepage.json, pass data to each section component via props, render in order: Hero, Features, Stats, Testimonials, CTA, FAQ, Contact. Sections hidden when data is empty. Include OrganizationLD and WebSiteLD.

## 7. Blog System

- [ ] 7.1 Define blog content collection schema in `src/content.config.ts` — title, description, pubDate, author (reference to team collection), image (optional), tags (array of strings), categories (array of strings), draft (boolean, default false)
- [ ] 7.2 Define team content collection schema in `src/content.config.ts` — name, slug, bio, avatar image path, role/title, optional social links including Twitter handle
- [ ] 7.3 Create `src/utils/reading-time.ts` — calculate reading time from post body (prose + MDX text, excluding code blocks) at 238 wpm, rounded up, minimum 1 minute
- [ ] 7.4 Create blog listing page `src/pages/blog/[...page].astro` with pagination (9 per page) using `paginate()` — exclude drafts in production (use `import.meta.env.PROD`), show draft badge in dev. Redirect /blog/1/ to /blog/. Show "No posts yet" when empty. Pagination controls only when >1 page. Invalid page numbers return 404.
- [ ] 7.5 Create blog post page `src/pages/blog/[slug].astro` — render MDX with PostLayout, include BlogPostingLD and BreadcrumbLD
- [ ] 7.6 Create tag listing page `src/pages/blog/tags/index.astro` — all tags (lowercase, slugified: spaces to hyphens, strip special chars) with post counts (excluding drafts in production). Exclude tags with 0 visible posts.
- [ ] 7.7 Create tag detail page `src/pages/blog/tags/[tag]/[...page].astro` — posts filtered by tag, paginated at 9 per page, reverse chronological
- [ ] 7.8 Create category listing page `src/pages/blog/categories/index.astro` — all categories (lowercase, slugified) with post counts (excluding drafts in production). Exclude categories with 0 visible posts.
- [ ] 7.9 Create category detail page `src/pages/blog/categories/[category]/[...page].astro` — posts filtered by category, paginated at 9 per page, reverse chronological
- [ ] 7.10 Implement related posts logic — match by shared tags, fall back to categories, then deterministic pseudo-random fallback seeded by post slug. Show up to 3 (or fewer if unavailable). Hide section entirely when 0 available. Posts with no tags/categories go directly to pseudo-random.
- [ ] 7.11 Create RSS feed endpoint `src/pages/rss.xml.ts` — 25 most recent published (non-draft) posts with title, description (excerpt), link, pubDate, author, and categories

## 8. Team Pages

- [ ] 8.1 Create team listing page `src/pages/team/index.astro` — list of all team members with name, avatar, role. Show "No team members yet" when empty.
- [ ] 8.2 Create team detail page `src/pages/team/[slug].astro` — member profile (name, avatar, bio, role, social links) and list of their published blog posts (hide posts section when 0 published). Include BreadcrumbLD. Build fails on duplicate slugs.
- [ ] 8.3 Create 2+ demo team member profiles in `src/content/team/` with avatar images, each authoring at least one demo blog post

## 9. Service Pages

- [ ] 9.1 Create `src/content/services/services.json` with Zod schema in `src/content.config.ts` — slug, title, description, longDescription (plain text), icon key (string mapping to icon lookup), features array (array of {title, description} objects), CTA object ({text, link}), numeric `order` field. Build fails on duplicate slugs.
- [ ] 9.2 Create icon lookup object at `src/components/icons/index.ts` — maps string keys to inline SVG Astro components, includes `"placeholder"` generic icon, build fails on missing icon key
- [ ] 9.3 Create services listing page `src/pages/services/index.astro` — grid of service cards sorted by `order` ascending, ties broken alphabetically by title. Show "No services yet" when empty.
- [ ] 9.4 Create service detail page `src/pages/services/[slug].astro` — service title, long description, features list, CTA, ServiceLD and BreadcrumbLD
- [ ] 9.5 Populate `services.json` with 3+ demo services with realistic placeholder content

## 10. Location Pages

- [ ] 10.1 Create `src/content/locations/locations.json` with Zod schema in `src/content.config.ts` — slug, city (preserve accents in display, transliterate for URLs), state, full address, phone (optional, falls back to site config, omitted when neither exists), description, longDescription (plain text), coordinates (lat/lng, optional), service area keywords (array), optional operating hours (Schema.org-aligned: dayOfWeek must be Monday/Tuesday/Wednesday/Thursday/Friday/Saturday/Sunday capitalized, open/close in 24h HH:MM 00:00-23:59, supports split hours and day grouping). Build fails on duplicate slugs or invalid operating hours.
- [ ] 10.2 Create locations listing page `src/pages/locations/index.astro` — list of all locations sorted alphabetically by city then state. Show "No locations yet" when empty.
- [ ] 10.3 Create location detail page `src/pages/locations/[slug].astro` — location content, unique SEO (title, description), LocalBusinessLD and BreadcrumbLD, links to all service pages (one-way cross-reference)
- [ ] 10.4 Populate `locations.json` with 3+ demo locations in different cities with unique placeholder content, varied operating hours

## 11. Demo Content and Finishing

- [ ] 11.1 Create 3+ demo blog posts in `src/content/blog/` with varied tags (lowercase), categories (lowercase), and authors — including at least one draft post
- [ ] 11.2 Add local placeholder images to `public/images/` for blog posts, team avatars, OG default image, and favicons
- [ ] 11.3 Wire up all navigation links in Header (Home, Services, Locations, Blog, Team, Contact) and Footer (Privacy, Terms, Sitemap + social links with target="_blank" rel="noopener noreferrer") to actual routes
- [ ] 11.4 Verify full site builds successfully with `pnpm run build` and renders correctly with `pnpm run preview`
- [ ] 11.5 Run `pnpm run lint` and `pnpm run check` — fix any errors
- [ ] 11.6 Run Vitest smoke test — verify build completes without errors
- [ ] 11.7 Verify Lighthouse scores 90+ on homepage (Performance, Accessibility, Best Practices, SEO)
