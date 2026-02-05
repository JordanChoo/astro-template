## Context

This is a greenfield Astro starter theme for marketing websites. There is no existing application code — the repo currently contains only workflow tooling (Beads, OpenSpec, Claude configuration). The starter will serve as a reusable template for spinning up client marketing sites with blog, service, and location pages.

**Constraints:**
- Astro 5.x, static site generation (SSG) only
- Pure `.astro` components — no React/Vue/Svelte
- Tailwind CSS for styling
- Cloudflare Pages for deployment
- All interactive behavior (mobile nav, FAQ accordion) must use vanilla JS or CSS-only techniques

## Goals / Non-Goals

**Goals:**
- Provide a production-ready marketing site template that can be customized for a new client in minimal time
- Establish strong SEO foundations (meta tags, structured data, programmatic local SEO)
- Keep the dependency footprint small — Astro + Tailwind + a handful of official integrations
- Full demo content so the theme looks complete out of the box
- Clean DX with TypeScript, linting, formatting, and editor config

**Non-Goals:**
- Server-side rendering or API routes (SSG only)
- Client-side JavaScript frameworks (React, Vue, Svelte)
- Dark mode or theme switching
- View transitions
- Contact form submission handling
- CMS integration (content lives in the repo)
- Authentication or user accounts
- E-commerce or payment processing
- i18n / multi-language support

## Decisions

### 1. Project structure

```
src/
├── components/
│   ├── icons/          # Inline SVG icon components + lookup object
│   ├── sections/       # Homepage sections (Hero, Features, etc.)
│   ├── seo/            # SEO, JSON-LD, GTM components
│   └── ui/             # Shared UI (Breadcrumbs, Card, etc.)
├── config/
│   └── site.ts         # Central site configuration
├── content/
│   ├── blog/           # MDX blog posts (content collection)
│   ├── team/           # Team member profiles (content collection)
│   ├── services/       # services.json (data collection)
│   └── locations/      # locations.json (data collection)
├── content.config.ts   # Content collection schemas (Astro 5.x)
├── data/
│   ├── homepage.json   # Homepage section content
│   └── pages.json      # Listing page metadata (titles, descriptions)
├── layouts/
│   ├── BaseLayout.astro
│   ├── PageLayout.astro
│   └── PostLayout.astro
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── contact.astro
│   ├── privacy.astro
│   ├── terms.astro
│   ├── 404.astro
│   ├── blog/
│   │   ├── [...page].astro
│   │   ├── [slug].astro
│   │   ├── tags/
│   │   │   ├── index.astro
│   │   │   └── [tag]/[...page].astro
│   │   └── categories/
│   │       ├── index.astro
│   │       └── [category]/[...page].astro
│   ├── services/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── locations/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── team/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── rss.xml.ts
├── styles/
│   └── global.css      # Tailwind v4 directives + @theme tokens + base styles
└── utils/
    └── reading-time.ts # Reading time calculation helper
```

**Rationale:** Separating `components/sections/` from `components/ui/` makes homepage sections easy to find and reorder. `components/icons/` contains inline SVG Astro components with a lookup object for icon resolution. `src/data/` holds `homepage.json` for homepage content. Content collections under `src/content/` handle blog, team, services, and locations.

### 2. Content strategy: Collections vs. data files

| Content type | Storage | Why |
|---|---|---|
| Blog posts | Content collection (MDX) at `src/content/blog/` | Rich content, needs MDX rendering, type-safe schema, per-post customization |
| Team members | Content collection (YAML/JSON) at `src/content/team/` | Referenced by blog posts, standalone team pages, benefits from collection references |
| Services | Content collection (`type: 'data'`) at `src/content/services/services.json` | Uniform structure, Zod-validated schema, build-time type safety via content collections |
| Locations | Content collection (`type: 'data'`) at `src/content/locations/locations.json` | Uniform structure, Zod-validated schema, programmatic SEO with templated content |
| Homepage | JSON data file at `src/data/homepage.json` | Section content passed to components via props, Zod-validated at build time, editable by non-developers |
| Page metadata | JSON data file at `src/data/pages.json` | Listing page titles and descriptions, Zod-validated at build time |

**Rationale:** Content collections provide Zod validation and type-safe queries for all content types. Services and locations use `type: 'data'` collections for build-time validation without needing MDX rendering. Homepage and page metadata use plain JSON files with Zod validation at build time for consistent error handling across all data sources.

### 3. Blog pagination approach

Use Astro's built-in `paginate()` function with `[...page].astro` dynamic route.

**Rationale:** This is Astro's first-class pagination pattern. It generates `/blog/`, `/blog/2/`, `/blog/3/` etc. as static pages. No client-side pagination needed.

### 4. Related posts algorithm

Match by shared tags, falling back to shared categories, then deterministic pseudo-random selection seeded by the current post's slug. Limit to 3 related posts. If fewer than 3 posts are available, show however many exist. If 0 related posts can be shown, hide the section entirely.

**Rationale:** Simple, deterministic, works at build time. No search index or scoring engine needed. Tags are more specific than categories so they get priority. Pseudo-random fallback (instead of most recent) evenly distributes traffic and doesn't change when new posts are added.

### 5. FAQ accordion — CSS-only with `<details>/<summary>`

Use native HTML `<details>` and `<summary>` elements styled with Tailwind for the FAQ section.

**Rationale:** Zero JavaScript, accessible by default (keyboard + screen reader support built in), and progressive enhancement — works even if CSS fails to load.

**Alternative considered:** Vanilla JS toggle with `aria-expanded`. Rejected because `<details>/<summary>` achieves the same result with less code and better baseline accessibility.

### 6. Mobile navigation — vanilla JS

Small inline `<script>` in the Header component to toggle a CSS class on the mobile nav.

**Rationale:** This is the one interactive element that genuinely needs JS (CSS-only hamburger menus have poor accessibility). Keeping it as a small inline script in the component avoids any framework dependency. Astro bundles inline scripts efficiently.

### 7. SEO component architecture

Single `SEO.astro` component that accepts props and renders all meta/OG/Twitter tags. Separate components for JSON-LD schemas (`BlogPostingLD.astro`, `LocalBusinessLD.astro`, `ServiceLD.astro`, `BreadcrumbLD.astro`, `OrganizationLD.astro`, `WebSiteLD.astro`, `FAQLD.astro`). Each outputs its own `<script type="application/ld+json">` tag.

**Rationale:** The meta tags are always the same structure — one component handles them. JSON-LD schemas vary by page type, so separate components are cleaner than overloading one component with conditional logic.

### 8. Astro integrations

| Integration | Purpose |
|---|---|
| `@astrojs/mdx` | MDX content in blog posts |
| `@astrojs/sitemap` | Auto-generated sitemap.xml (with filter for paginated/noindex pages) |
| `@astrojs/rss` | RSS feed generation helper |

Tailwind CSS v4 is configured as a Vite plugin directly in `astro.config.mjs` — no dedicated Astro integration needed.

No Cloudflare adapter needed — static output mode deploys to Cloudflare Pages without an adapter. The default static output is sufficient.

**Alternative considered:** `@astrojs/cloudflare` adapter. Not needed for pure SSG. The adapter is only required for SSR/hybrid mode with Cloudflare Workers.

### 9. Tailwind configuration

Use Tailwind CSS v4 configured as a Vite plugin in `astro.config.mjs`. Define a semantic design token system using CSS `@theme` declarations in `src/styles/global.css` — colors (primary, secondary, accent, neutral), typography (referencing Google Fonts), and spacing scale. Use `@tailwindcss/typography` for prose styling in blog posts.

**Rationale:** CSS-based configuration is simpler than the JS config file approach from Tailwind v3. Semantic token names make it easy to re-theme per project by changing CSS custom properties. Tailwind v4 uses automatic content detection — no file glob configuration needed.

### 10. TypeScript approach

Strict mode. Type the site config interface, service/location data schemas, and component props. Use Astro's built-in `CollectionEntry` types for content collections.

**Rationale:** TypeScript strict catches errors at build time — especially important for a template where people will be modifying config/data files.

## Risks / Trade-offs

**[No framework for interactivity]** → The FAQ and mobile nav work without a framework, but if a future project needs more complex interactivity (search, filters, dynamic forms), a framework will need to be added per-project. **Mitigation:** Astro's island architecture makes it easy to add React/Vue/Svelte to individual components later without refactoring.

**[Homepage JSON validation]** → The homepage data file (`src/data/homepage.json`) uses Zod validation at build time, consistent with services/locations collections. This provides runtime validation with descriptive error messages for malformed data.

**[Demo content maintenance]** → Full demo content means more files to maintain and update when Astro changes. **Mitigation:** Keep demo content minimal but representative. Document the schema clearly so content is easy to replace.

**[SEO component scope creep]** → Full SEO suite (meta, OG, Twitter, JSON-LD, sitemap, robots, GTM) is a lot of surface area. **Mitigation:** Each concern is a separate component/file. The SEO component is a composition of focused pieces, not a monolith.

## Open Questions

_(All questions resolved during spec review.)_

- **Image optimization strategy:** Resolved — use local placeholder images committed to the repo. Works offline, no external service dependency, and Astro `<Image>` optimization works best with local files.
- **Font loading:** Resolved — Google Fonts with `font-display: swap` and `<link rel="preconnect">` (specified in layouts-and-navigation spec).
