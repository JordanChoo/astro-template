## ADDED Requirements

### Requirement: SEO component for meta tags
The system SHALL provide a reusable SEO component (`SEO.astro`) that renders all standard meta tags in the document head.

#### Scenario: Default meta tags
- **WHEN** a page uses the SEO component without overrides
- **THEN** the component SHALL render the default meta title (from site config template), default meta description, canonical URL, and viewport meta tag

#### Scenario: Per-page meta overrides
- **WHEN** a page passes custom title and description props to the SEO component
- **THEN** those values SHALL override the defaults from site config

#### Scenario: Canonical URL generation
- **WHEN** a page is rendered
- **THEN** the SEO component SHALL generate a canonical URL using the site URL from config combined with the current page path

#### Scenario: Self-referencing canonicals for paginated pages
- **WHEN** a paginated page is rendered (e.g., `/blog/2/`)
- **THEN** the canonical URL SHALL point to the paginated page itself (e.g., `/blog/2/`), not to the first page

#### Scenario: Noindex support
- **WHEN** a page passes `noindex: true` to the SEO component
- **THEN** the HTML head SHALL include a `<meta name="robots" content="noindex">` tag
- **AND** the page SHALL be excluded from the sitemap

#### Scenario: Meta description length warning
- **WHEN** a page is built with a meta description exceeding 160 characters
- **THEN** the build SHALL log a console warning identifying the page and the description length
- **AND** the build SHALL NOT fail — the long description is rendered as-is

#### Scenario: Listing page meta descriptions
- **WHEN** a listing page is rendered (`/blog/`, `/services/`, `/locations/`, `/team/`, tag pages, category pages)
- **THEN** the meta title and description SHALL be sourced from `src/data/pages.json`
- **AND** the pages.json file SHALL be Zod-validated at build time

### Requirement: Open Graph tags
The SEO component SHALL render Open Graph meta tags for social sharing.

#### Scenario: Open Graph output
- **WHEN** a page is rendered with the SEO component
- **THEN** the HTML head SHALL include `og:title`, `og:description`, `og:url`, `og:image`, `og:type`, and `og:site_name` tags

#### Scenario: Open Graph image dimensions
- **WHEN** an OG image is set for a page
- **THEN** the HTML head SHALL also include `og:image:width` and `og:image:height` tags
- **AND** for the default OG image, dimensions SHALL come from site config

#### Scenario: OG image fallback chain
- **WHEN** a page does not have a page-specific OG image
- **THEN** the SEO component SHALL fall back to the default OG image from site config
- **AND** if the default OG image is also not configured, the `og:image` tag SHALL be omitted entirely

#### Scenario: Blog post OG type
- **WHEN** a blog post page is rendered
- **THEN** the `og:type` SHALL be set to "article" with `article:published_time` and `article:author` tags

### Requirement: Twitter card tags
The SEO component SHALL render Twitter card meta tags.

#### Scenario: Twitter card output
- **WHEN** a page is rendered with the SEO component
- **THEN** the HTML head SHALL include `twitter:card` (set to "summary_large_image"), `twitter:title`, `twitter:description`, and `twitter:image` tags

#### Scenario: Twitter site handle
- **WHEN** the site config contains a `twitterHandle` value
- **THEN** the HTML head SHALL include a `twitter:site` tag with that handle

#### Scenario: Twitter creator on blog posts
- **WHEN** a blog post is rendered and the post author has a Twitter handle in their team profile
- **THEN** the HTML head SHALL include a `twitter:creator` tag with the author's handle

### Requirement: JSON-LD structured data
The system SHALL provide JSON-LD structured data components for different page types.

#### Scenario: Organization and WebSite schema on homepage
- **WHEN** the homepage is rendered
- **THEN** the page SHALL include an `Organization` JSON-LD block with business name, logo, phone (when configured), address (when configured), operating hours (when configured), and social profile URLs from site config
- **AND** the page SHALL include a `WebSite` JSON-LD block with site name and URL

#### Scenario: BlogPosting schema on blog posts
- **WHEN** a blog post page is rendered
- **THEN** the page SHALL include a `BlogPosting` JSON-LD block with headline, description, datePublished, author, and image

#### Scenario: Service schema on service pages
- **WHEN** a service page is rendered
- **THEN** the page SHALL include a `Service` or `ProfessionalService` JSON-LD block with name, description, and provider (referencing the business from site config)

#### Scenario: LocalBusiness schema on location pages
- **WHEN** a location page is rendered
- **THEN** the page SHALL include a `LocalBusiness` JSON-LD block with name, address, telephone, and optionally geo coordinates and opening hours (as specified in location-pages/spec.md)

#### Scenario: BreadcrumbList schema
- **WHEN** any page with breadcrumbs is rendered
- **THEN** the page SHALL include a `BreadcrumbList` JSON-LD block reflecting the breadcrumb navigation path

#### Scenario: FAQPage schema
- **WHEN** any page includes a FAQ section component with data
- **THEN** the page SHALL include a `FAQPage` JSON-LD block with all question/answer pairs from the FAQ data

### Requirement: JSON-LD component architecture
Each JSON-LD schema type SHALL be implemented as a separate Astro component that outputs its own self-contained `<script type="application/ld+json">` tag. Pages with multiple schemas (e.g., BlogPosting + BreadcrumbList) SHALL include multiple separate script tags, not a single `@graph` array.

### Requirement: Sitemap generation
The system SHALL automatically generate a `sitemap.xml` at build time.

#### Scenario: Sitemap includes all public pages
- **WHEN** the site is built
- **THEN** `sitemap.xml` SHALL include: the homepage, individual blog posts, service pages, location pages, team member pages, static pages (about, contact, privacy, terms), and the first page of listing views (`/blog/`, `/services/`, `/locations/`, `/team/`, `/blog/tags/[tag]/`, `/blog/categories/[category]/`)
- **AND** sitemap.xml SHALL exclude: paginated pages (e.g., `/blog/2/`, `/blog/tags/javascript/2/`), pages with a `noindex` meta tag, and draft blog posts

#### Scenario: Sitemap attributes
- **WHEN** sitemap.xml is generated
- **THEN** each URL entry SHALL include `<priority>`, `<changefreq>`, and `<lastmod>` attributes according to page type:

| Page Type | Priority | Changefreq |
|-----------|----------|------------|
| Homepage | 1.0 | weekly |
| Services listing | 0.8 | weekly |
| Service detail | 0.7 | weekly |
| Locations listing | 0.8 | weekly |
| Location detail | 0.7 | weekly |
| Blog listing | 0.8 | weekly |
| Blog post | 0.6 | monthly |
| Team listing | 0.5 | weekly |
| Team detail | 0.4 | weekly |
| Contact | 0.5 | monthly |
| About | 0.5 | monthly |
| Privacy/Terms | 0.2 | monthly |

- **AND** `<lastmod>` SHALL use file modification time for content collection entries, and build time for static pages

### Requirement: Robots.txt
The system SHALL include a `robots.txt` file allowing search engine crawling and referencing the sitemap.

#### Scenario: Robots.txt content
- **WHEN** a search engine requests `/robots.txt`
- **THEN** it SHALL receive a file that allows all crawlers and references the sitemap URL
- **AND** no `Disallow` rules SHALL be included (static site has no admin or draft paths in production builds)

### Requirement: Favicon and app icons
The system SHALL include favicon files for cross-browser compatibility.

#### Scenario: Favicon files
- **WHEN** the site is deployed
- **THEN** the `public/` directory SHALL contain `favicon.svg` (modern browsers), `favicon.ico` (legacy browsers), and `apple-touch-icon.png` (iOS)
- **AND** the BaseLayout SHALL reference these in the `<head>`

### Requirement: Google Tag Manager injection
The system SHALL inject the GTM script when a GTM ID is configured. The `gtmId` field is defined in site-config/spec.md.

#### Scenario: GTM enabled
- **WHEN** the site config contains a non-empty `gtmId`
- **THEN** the GTM `<script>` tag SHALL be injected into the `<head>` of every page
- **AND** the GTM `<noscript><iframe>` tag SHALL be injected immediately after the opening `<body>` tag of every page, before the header or any other content (per Google's GTM installation requirements)

#### Scenario: GTM disabled
- **WHEN** the site config `gtmId` is empty or not set
- **THEN** no GTM scripts or noscript tags SHALL be injected

#### Advisory: Privacy compliance
- **NOTE**: GTM injection as specified does not include any consent management mechanism. GDPR, CCPA, and other privacy regulation compliance (cookie consent banners, opt-out mechanisms, "Do Not Track" support) is a per-project responsibility and must be implemented separately when required.
