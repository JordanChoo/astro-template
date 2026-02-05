## ADDED Requirements

### Requirement: Services content collection
Services SHALL be defined using an Astro content collection with `type: 'data'` backed by a single data file (`src/content/services/services.json`), validated by a Zod schema at build time.

#### Scenario: Service data schema
- **WHEN** a developer edits the services data file
- **THEN** each service entry SHALL include: slug, title, description, longDescription (plain text), icon identifier (string key mapping to an inline SVG Astro component in `src/components/icons/`), a features list (array of objects with `title` and `description` fields), a CTA object (with `text` and `link` fields), and a numeric `order` field for sort positioning

#### Scenario: Missing icon reference
- **WHEN** a service entry references an icon key that does not exist in the icon lookup object at `src/components/icons/`
- **THEN** the build SHALL fail with an error identifying the service and the invalid icon key

#### Scenario: Placeholder icon available
- **WHEN** a developer is building out service content and does not yet have a custom icon
- **THEN** they SHALL be able to use `"placeholder"` as the icon key, which maps to a generic placeholder SVG icon included in the starter

#### Scenario: Adding a new service
- **WHEN** a developer adds a new service object to the data file
- **THEN** the service SHALL automatically appear on the services listing page and generate its own detail page at `/services/[slug]` on the next build

#### Scenario: Schema validation
- **WHEN** a developer provides invalid or incomplete service data
- **THEN** the build SHALL fail with a descriptive error identifying the invalid entry and field

#### Scenario: Duplicate slugs
- **WHEN** two service entries share the same slug
- **THEN** the build SHALL fail with an error identifying the duplicate

### Requirement: Service listing page
A services listing page SHALL exist at `/services/` showing all defined services sorted by their `order` field in ascending order.

#### Scenario: Services listing display
- **WHEN** a visitor navigates to `/services/`
- **THEN** they SHALL see a grid or list of all services with title, short description, icon, and a link to the individual service page, sorted by the `order` field in ascending order, with ties broken alphabetically by title

#### Scenario: Empty services listing
- **WHEN** no services are defined in the data file
- **THEN** the services listing page SHALL display a "No services yet" message

### Requirement: Individual service detail pages
Each service SHALL have a dynamically generated detail page at `/services/[slug]`.

#### Scenario: Service detail page content
- **WHEN** a visitor navigates to `/services/web-design`
- **THEN** they SHALL see the service title, long description, features list, and CTA — all sourced from the services collection

#### Scenario: Static generation of service pages
- **WHEN** the site is built (SSG)
- **THEN** Astro's `getStaticPaths` SHALL generate a static page for every service entry in the data file

### Requirement: Service page SEO
Each service page SHALL include per-page SEO metadata and structured data.

#### Scenario: Service meta tags
- **WHEN** a service page is rendered
- **THEN** the page SHALL have a unique title tag (e.g., "Web Design | Business Name"), unique meta description derived from the service description, and Open Graph tags

#### Scenario: Service JSON-LD
- **WHEN** a service page is rendered
- **THEN** the page SHALL include a `Service` or `ProfessionalService` JSON-LD block with name, description, and provider (referencing the business from site config)

### Requirement: Service image optimization
All service-related content images SHALL use Astro's `<Image>` component for automatic optimization, with images stored in or co-located with `src/` directories for proper optimization.

### Requirement: Demo service content
The starter SHALL include demo services to demonstrate the system.

#### Scenario: Demo services included
- **WHEN** a developer clones the starter and runs the dev server
- **THEN** they SHALL see at least 3 sample services with realistic placeholder content demonstrating all service features
