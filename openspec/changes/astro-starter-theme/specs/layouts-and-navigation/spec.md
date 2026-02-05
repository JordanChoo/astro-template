## ADDED Requirements

### Requirement: WCAG 2.1 AA compliance
All components across the site SHALL meet WCAG 2.1 Level AA. Component-specific accessibility scenarios (such as FAQ keyboard interaction) are defined in their respective specs.

#### Scenario: Interactive elements
- **WHEN** any interactive element (button, link, toggle) is rendered
- **THEN** it SHALL be keyboard-focusable with a visible focus indicator
- **AND** it SHALL have an accessible name (via text content or `aria-label`)

#### Scenario: Decorative elements
- **WHEN** an icon or image is purely decorative
- **THEN** it SHALL have `aria-hidden="true"` or an empty `alt` attribute

### Requirement: Base layout
The system SHALL provide a `BaseLayout.astro` that wraps every page with the HTML document structure.

#### Scenario: Base layout structure
- **WHEN** any page is rendered
- **THEN** the BaseLayout SHALL provide the `<!DOCTYPE html>`, `<html>`, `<head>` (with SEO component, GTM, favicon references, Google Fonts with `font-display: swap` and `<link rel="preconnect">` for the fonts domain), and `<body>` tags

#### Scenario: Base layout accepts props
- **WHEN** a page uses the BaseLayout
- **THEN** the page SHALL be able to pass SEO props (title, description, image, type) that are forwarded to the SEO component

### Requirement: Page layout
The system SHALL provide a `PageLayout.astro` that extends BaseLayout with the site header, footer, and main content area.

#### Scenario: Page layout structure
- **WHEN** a standard page is rendered using PageLayout
- **THEN** the page SHALL display the site header, a `<main>` content area (slot), and the site footer

### Requirement: Post layout
The system SHALL provide a `PostLayout.astro` for blog post pages that extends PageLayout with post-specific elements.

#### Scenario: Post layout structure
- **WHEN** a blog post is rendered using PostLayout
- **THEN** the page SHALL display the post title, author info, publish date, reading time, featured image, post content (MDX), tags, and related posts

### Requirement: Responsive site header
The system SHALL provide a sticky Header component with site navigation that remains visible at the top of the viewport as the user scrolls.

#### Scenario: Skip-to-content link
- **WHEN** a keyboard user presses Tab on any page
- **THEN** the first focusable element SHALL be a "Skip to content" link that, when activated, moves focus to the `<main>` content area

#### Scenario: Desktop navigation
- **WHEN** a visitor views the site on a desktop browser
- **THEN** the header SHALL display the site logo/name and horizontal navigation links to: Home, Services, Locations, Blog, Team, and Contact

#### Scenario: Active page indicator
- **WHEN** a visitor is on a page whose URL path starts with a navigation link's path
- **THEN** that navigation link SHALL be visually distinguished (e.g., different color, underline, or font weight) and have `aria-current="page"`
- **AND** the Home link SHALL use exact path matching (`/` only) to avoid being active on every page
- **AND** all other links SHALL use prefix matching (e.g., `/blog/some-post` activates the "Blog" link, `/services/web-design` activates the "Services" link)

#### Scenario: Mobile breakpoint
- **WHEN** determining mobile vs. desktop layout
- **THEN** the system SHALL use Tailwind's `md` breakpoint (768px)
- **AND** below 768px is considered mobile, 768px and above is desktop

#### Scenario: Mobile navigation
- **WHEN** a visitor views the site on a mobile device (below 768px)
- **THEN** the header SHALL display a hamburger menu icon that, when tapped, reveals the navigation links in a full-screen overlay

#### Scenario: Mobile menu toggle
- **WHEN** a visitor taps the hamburger menu icon
- **THEN** the mobile navigation SHALL expand as a full-screen overlay / collapse
- **AND** this interaction SHALL work without a JavaScript framework (vanilla JS or CSS-only)

#### Scenario: Mobile menu focus trapping
- **WHEN** the mobile navigation overlay is open
- **THEN** keyboard Tab focus SHALL be trapped within the overlay — Tab and Shift+Tab SHALL cycle only through focusable elements inside the overlay and not reach elements behind it

#### Scenario: Mobile menu Escape to close
- **WHEN** the mobile navigation overlay is open and a user presses the Escape key
- **THEN** the overlay SHALL close and focus SHALL return to the hamburger menu button

#### Scenario: Mobile menu scroll lock
- **WHEN** the mobile navigation overlay is open
- **THEN** the page body behind the overlay SHALL not scroll

#### Scenario: Mobile menu ARIA expanded state
- **WHEN** the hamburger menu button is rendered
- **THEN** it SHALL have an `aria-expanded` attribute that is `"false"` when the menu is closed and `"true"` when the menu is open

#### Scenario: Mobile menu button accessible name
- **WHEN** the hamburger menu button is rendered
- **THEN** it SHALL have an `aria-label` (e.g., "Open menu" / "Close menu") since the button contains only an icon with no visible text

### Requirement: Site footer
The system SHALL provide a Footer component with business information and navigation.

#### Scenario: Footer content
- **WHEN** any page is rendered
- **THEN** the footer SHALL display: business name, contact information (phone, address from site config — each omitted when not configured), social media icon links (inline SVG Astro components, from site config), secondary navigation links, and a copyright notice

#### Scenario: Footer secondary navigation
- **WHEN** the footer is rendered
- **THEN** it SHALL display secondary navigation links configured in site config
- **AND** the default links SHALL be: Privacy Policy (`/privacy`), Terms of Service (`/terms`), and Sitemap (`/sitemap-index.xml`)
- **AND** the secondary nav links SHALL be configurable via site config (array of `{ text, link }` objects)

#### Scenario: Dynamic copyright year
- **WHEN** the footer is rendered
- **THEN** the copyright year SHALL be set to the year at build time — no client-side JavaScript is used for the copyright year

### Requirement: Breadcrumb navigation
The system SHALL provide a Breadcrumbs component for interior pages.

#### Scenario: Breadcrumb display
- **WHEN** a visitor is on an interior page
- **THEN** breadcrumbs SHALL display the navigation path according to the page type:
  - `/services/web-design` → Home > Services > Web Design
  - `/locations/austin-tx` → Home > Locations > Austin TX
  - `/blog/post-slug` → Home > Blog > Post Title
  - `/blog/tags/javascript` → Home > Blog > Tags > javascript (lowercase)
  - `/blog/categories/tech` → Home > Blog > Categories > tech (lowercase)
  - `/team/jane-doe` → Home > Team > Jane Doe
  - `/about` → Home > About
  - `/contact` → Home > Contact
  - `/privacy` → Home > Privacy Policy
  - `/terms` → Home > Terms of Service

#### Scenario: Breadcrumb on homepage
- **WHEN** a visitor is on the homepage
- **THEN** no breadcrumbs SHALL be displayed

#### Scenario: Breadcrumb on 404 page
- **WHEN** a visitor is on the 404 error page
- **THEN** no breadcrumbs SHALL be displayed

### Requirement: Contact page
The system SHALL provide a dedicated contact page at `/contact` displaying business contact details.

#### Scenario: Contact page content
- **WHEN** a visitor navigates to `/contact`
- **THEN** they SHALL see the physical address (when configured), phone number (when configured), and default operating hours (when configured in site config) — all sourced from the site configuration
- **AND** the page SHALL NOT include a contact form

### Requirement: Custom 404 page
The system SHALL provide a branded 404 error page.

#### Scenario: 404 page display
- **WHEN** a visitor navigates to a nonexistent URL
- **THEN** they SHALL see a custom `404.astro` page using the PageLayout (header + footer) with a friendly error message and a link back to the homepage

### Requirement: External link behavior
All external links SHALL follow consistent behavior for security and usability.

#### Scenario: External links
- **WHEN** a link points to an external domain (social media, external resources)
- **THEN** it SHALL open in a new tab using `target="_blank"`
- **AND** it SHALL include `rel="noopener noreferrer"` for security

#### Scenario: Internal links
- **WHEN** a link points to an internal page
- **THEN** it SHALL open in the same tab without special attributes

### Requirement: Privacy and Terms pages
The system SHALL provide placeholder legal pages.

#### Scenario: Privacy Policy page
- **WHEN** a visitor navigates to `/privacy`
- **THEN** they SHALL see a Privacy Policy page with boilerplate placeholder content that developers customize per-project

#### Scenario: Terms of Service page
- **WHEN** a visitor navigates to `/terms`
- **THEN** they SHALL see a Terms of Service page with boilerplate placeholder content that developers customize per-project
