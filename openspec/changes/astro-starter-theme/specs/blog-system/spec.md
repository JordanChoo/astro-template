**Cross-reference:** Blog author profiles are defined in team-pages/spec.md. Blog posts reference the team content collection for author data.

## ADDED Requirements

### Requirement: Blog content collection with MDX
The blog SHALL use Astro content collections with a typed schema. Blog posts SHALL support MDX format for rich content embedding.

#### Scenario: Blog post schema
- **WHEN** a developer creates a new blog post MDX file in `src/content/blog/`
- **THEN** the schema SHALL validate required frontmatter fields: title, description, pubDate, author (reference to team content collection, see team-pages/spec.md), image (optional), tags (array of strings), categories (array of strings), and draft (boolean, default false)

#### Scenario: Draft posts excluded from production
- **WHEN** the site is built for production
- **THEN** posts with `draft: true` SHALL be excluded from the blog listing, RSS feed, and sitemap

#### Scenario: Draft exclusion is comprehensive
- **WHEN** the site is built for production
- **THEN** draft posts SHALL be excluded from all public-facing surfaces including: blog listings, tag/category pages and their post counts, RSS feed, sitemap, related posts pool, and team member post lists

#### Scenario: Draft detection method
- **WHEN** determining whether to show or hide draft posts
- **THEN** the system SHALL use `import.meta.env.PROD` to detect production mode
- **AND** when `PROD === true`, drafts are hidden
- **AND** when `PROD === false` (dev mode), drafts are visible

#### Scenario: Draft posts visible in development
- **WHEN** the site is running in dev mode (`astro dev`)
- **THEN** posts with `draft: true` SHALL appear on the blog listing with a visual "Draft" badge
- **AND** they SHALL be accessible at their URL for preview

#### Scenario: Invalid author reference
- **WHEN** a blog post references a nonexistent author in the team collection
- **THEN** the build SHALL fail with an error identifying the post and the invalid author reference

#### Scenario: Blog post slugs
- **WHEN** blog posts are created in `src/content/blog/`
- **THEN** the filename (without extension) SHALL serve as the post slug
- **AND** the filesystem inherently prevents duplicate slugs within the collection

### Requirement: Blog listing page with pagination
The blog SHALL have a listing page at `/blog/` that displays posts in reverse chronological order with pagination of 9 posts per page.

#### Scenario: Paginated listing
- **WHEN** a visitor navigates to `/blog/`
- **THEN** they SHALL see a paginated list of blog post cards showing title, description, date, author, reading time, and featured image
- **AND** pagination controls SHALL appear only when more than one page exists (more than 9 posts)

#### Scenario: Pagination navigation
- **WHEN** a visitor clicks "Next" on the blog listing
- **THEN** they SHALL navigate to `/blog/2/` showing the next page of posts

#### Scenario: First page redirect
- **WHEN** a visitor navigates to `/blog/1/`
- **THEN** they SHALL be redirected to `/blog/` (canonical first page has no number)

#### Scenario: Invalid page numbers
- **WHEN** a visitor navigates to an invalid page number (0, negative, or exceeding available pages)
- **THEN** the system SHALL return a 404 error

#### Scenario: Empty blog listing
- **WHEN** no published posts exist (all drafts or no posts)
- **THEN** the blog listing page SHALL display a "No posts yet" message

### Requirement: Individual blog post pages
Each blog post SHALL have its own page at `/blog/[slug]/` rendered using the post layout.

#### Scenario: Post page rendering
- **WHEN** a visitor navigates to a blog post URL
- **THEN** they SHALL see the full post content rendered from MDX, with title, author, publish date, reading time, tags, categories, and featured image

### Requirement: Reading time calculation
Each blog post SHALL display an estimated reading time calculated at 238 words per minute (the commonly cited English average), rounded up to the nearest minute, with a minimum of 1 minute.

#### Scenario: Reading time display
- **WHEN** a blog post is rendered
- **THEN** the reading time SHALL be calculated from the post body content at 238 words per minute, rounded up, and displayed as "X min read"

#### Scenario: Reading time word count
- **WHEN** calculating reading time
- **THEN** the word count SHALL include prose text and MDX component text content
- **AND** SHALL exclude code blocks and frontmatter

#### Scenario: Minimum reading time
- **WHEN** a post has very few words (or only code/images)
- **THEN** the minimum reading time SHALL be 1 minute (never show "0 min read")

### Requirement: Tag and category pages
The blog SHALL support browsing by tags and categories. Tags and categories SHALL be forced to lowercase for both display and URLs.

#### Scenario: Tag and category slugification
- **WHEN** a tag or category is processed for display and URL generation
- **THEN** it SHALL be converted to lowercase
- **AND** spaces SHALL be replaced with hyphens
- **AND** non-alphanumeric characters (except hyphens) SHALL be stripped
- **AND** examples: "Machine Learning" → `machine-learning`, "JavaScript" → `javascript`, "C++" → `c`

#### Advisory: Slug-friendly tag names
- **NOTE**: Authors should use slug-friendly tag names in frontmatter (e.g., "cpp" instead of "C++") to ensure predictable URLs. Special characters are stripped during slugification, which may produce unexpected or ambiguous results.

#### Scenario: Tag listing page
- **WHEN** a visitor navigates to `/blog/tags/`
- **THEN** they SHALL see a list of all tags with post counts
- **AND** tags with 0 visible posts (all posts are drafts in production) SHALL be excluded from the listing

#### Scenario: Tag detail page
- **WHEN** a visitor navigates to `/blog/tags/[tag]/`
- **THEN** they SHALL see all posts tagged with that tag in reverse chronological order, paginated at 9 posts per page

#### Scenario: Tag detail pagination
- **WHEN** posts tagged with a given tag exceed 9
- **THEN** pagination controls SHALL appear and subsequent pages SHALL be available at `/blog/tags/[tag]/2/`, `/blog/tags/[tag]/3/`, etc.

#### Scenario: Category listing page
- **WHEN** a visitor navigates to `/blog/categories/`
- **THEN** they SHALL see a list of all categories with post counts
- **AND** categories with 0 visible posts (all posts are drafts in production) SHALL be excluded from the listing

#### Scenario: Category detail page
- **WHEN** a visitor navigates to `/blog/categories/[category]/`
- **THEN** they SHALL see all posts in that category in reverse chronological order, paginated at 9 posts per page

#### Scenario: Category detail pagination
- **WHEN** posts in a given category exceed 9
- **THEN** pagination controls SHALL appear and subsequent pages SHALL be available at `/blog/categories/[category]/2/`, `/blog/categories/[category]/3/`, etc.

### Requirement: Related posts
Each blog post page SHALL display related posts when available.

#### Scenario: Related posts display
- **WHEN** a visitor views a blog post
- **THEN** they SHALL see up to 3 related posts at the bottom of the page, determined by shared tags or categories

#### Scenario: Related posts fallback
- **WHEN** no posts share tags or categories with the current post
- **THEN** the related posts section SHALL display up to 3 pseudo-randomly selected posts (excluding the current post), determined by a deterministic seed derived from the current post's slug, ensuring reproducible builds

#### Scenario: Posts with no tags or categories
- **WHEN** a blog post has no tags and no categories
- **THEN** the related posts section SHALL use the deterministic pseudo-random fallback to select posts

#### Scenario: Insufficient posts available
- **WHEN** fewer than 3 other published posts exist
- **THEN** the related posts section SHALL show however many are available (0, 1, or 2)

#### Scenario: No related posts available
- **WHEN** the current post is the only published post (or no other posts can be shown)
- **THEN** the related posts section SHALL be hidden entirely

### Requirement: Code syntax highlighting
Blog posts SHALL support syntax-highlighted code blocks using Astro's built-in Shiki integration.

#### Scenario: Code block rendering
- **WHEN** a blog post contains fenced code blocks with a language identifier
- **THEN** the code SHALL be rendered with syntax highlighting using Shiki's default theme

### Requirement: Blog image optimization
All blog content images SHALL use Astro's `<Image>` component for automatic optimization.

#### Scenario: Featured image optimization
- **WHEN** a blog post with a featured image is rendered
- **THEN** the featured image SHALL be served using Astro's `<Image>` component with responsive sizes, format conversion (WebP/AVIF), and lazy loading

### Requirement: RSS feed
The blog SHALL generate an RSS feed at `/rss.xml` containing the 25 most recent published posts.

#### Scenario: RSS feed generation
- **WHEN** the site is built
- **THEN** an RSS feed SHALL be generated at `/rss.xml` containing the 25 most recent published (non-draft) posts with title, description (excerpt), link, pubDate, author, and categories

### Requirement: Demo blog content
The starter SHALL include demo blog posts to demonstrate the full blog system.

#### Scenario: Demo content included
- **WHEN** a developer clones the starter and runs the dev server
- **THEN** they SHALL see at least 3 sample blog posts with varied tags, categories, and authors demonstrating all blog features including at least one draft post
