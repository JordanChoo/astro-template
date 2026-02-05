## ADDED Requirements

### Requirement: Locations content collection
Locations SHALL be defined using an Astro content collection with `type: 'data'` backed by a single data file (`src/content/locations/locations.json`), validated by a Zod schema at build time. This approach is consistent with the services collection.

#### Scenario: Location data schema
- **WHEN** a developer edits the locations data file
- **THEN** each location entry SHALL include: slug, city, state, full address, phone number (optional — overrides the site config phone when provided; when neither the location phone nor the site config phone is configured, phone is omitted from the page and JSON-LD), description, longDescription (plain text), coordinates (lat/lng, optional), service area keywords (array of strings), and optional operating hours

#### Scenario: City name special characters
- **WHEN** a city name contains accented characters (e.g., "San José")
- **THEN** the accented characters SHALL be preserved in display
- **AND** the slug SHALL use transliterated characters (e.g., "san-jose")

#### Scenario: Operating hours schema
- **WHEN** a developer provides operating hours for a location
- **THEN** the hours SHALL be structured as an array of objects aligned with Schema.org's `openingHoursSpecification`, each containing: `dayOfWeek` (a string or array of strings), `open` (24-hour HH:MM format), and `close` (24-hour HH:MM format)
- **AND** the format SHALL support split hours (multiple entries for the same day, e.g., morning and afternoon shifts), day grouping (multiple days sharing the same hours in one entry), and omitted days (indicating the location is closed on that day)
- **AND** the data SHALL be included in the LocalBusiness JSON-LD `openingHoursSpecification` with minimal transformation

#### Scenario: Operating hours validation
- **WHEN** operating hours are configured for a location
- **THEN** `dayOfWeek` values SHALL be Schema.org-compliant: exactly one of Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday (case-sensitive, capitalized)
- **AND** `open` and `close` times SHALL be valid 24-hour format HH:MM (00:00 to 23:59)
- **AND** the build SHALL fail with a descriptive error if invalid day names or time formats are provided

#### Scenario: Adding a new location
- **WHEN** a developer adds a new location object to the data file
- **THEN** the location SHALL automatically appear on the locations listing page and generate its own detail page at `/locations/[slug]` on the next build

#### Scenario: Schema validation
- **WHEN** a developer provides invalid or incomplete location data
- **THEN** the build SHALL fail with a descriptive error identifying the invalid entry and field

#### Scenario: Duplicate slugs
- **WHEN** two location entries share the same slug
- **THEN** the build SHALL fail with an error identifying the duplicate

### Requirement: Location listing page
A locations listing page SHALL exist at `/locations/` showing all defined locations.

#### Scenario: Locations listing display
- **WHEN** a visitor navigates to `/locations/`
- **THEN** they SHALL see a list of all locations sorted alphabetically by city then by state, with city, state, and a link to the individual location page

#### Scenario: Empty locations listing
- **WHEN** no locations are defined in the data file
- **THEN** the locations listing page SHALL display a "No locations yet" message

### Requirement: Individual location detail pages
Each location SHALL have a dynamically generated detail page at `/locations/[slug]`.

#### Scenario: Location detail page content
- **WHEN** a visitor navigates to `/locations/austin-tx`
- **THEN** they SHALL see the location name, full address, phone number (location-specific, site config default, or omitted when neither exists), long description, service area information, and operating hours (when configured) — all sourced from the locations collection

#### Scenario: Static generation of location pages
- **WHEN** the site is built (SSG)
- **THEN** Astro's `getStaticPaths` SHALL generate a static page for every location entry in the data file

### Requirement: Programmatic SEO optimization per location
Each location page SHALL be optimized for local search with unique, keyword-rich content.

#### Scenario: Unique meta tags per location
- **WHEN** a location page is rendered
- **THEN** the page SHALL have a unique title tag (e.g., "Services in Austin, TX | Business Name") and meta description incorporating the city, state, and service area keywords

#### Scenario: LocalBusiness JSON-LD per location
- **WHEN** a location page is rendered
- **THEN** the page SHALL include a LocalBusiness JSON-LD schema with the location's name, address, and phone
- **AND** if coordinates are provided, the JSON-LD SHALL include `geo` data
- **AND** if operating hours are provided, the JSON-LD SHALL include `openingHoursSpecification`

#### Scenario: Coordinates are for structured data only
- **WHEN** coordinates are provided for a location
- **THEN** they SHALL be used in the JSON-LD structured data only — no embedded map is rendered
- **AND** developers MAY add map integration per-project

#### Scenario: Thin content risk (advisory)
- **NOTE**: Programmatic location pages risk Google penalties for thin/duplicate content. Each location's `longDescription` SHOULD contain substantially unique content — not just city/state name swapped into a template. Service area keywords SHOULD appear naturally in the page body, not only in meta tags. Content quality is the responsibility of the content author.

### Requirement: Location-to-service cross-references
Location detail pages SHALL display links to all available services. This is a one-way cross-reference — service pages do not link back to locations.

### Requirement: Location image optimization
All location-related images SHALL use Astro's `<Image>` component for automatic optimization.

### Requirement: Demo location content
The starter SHALL include demo locations to demonstrate the programmatic SEO system.

#### Scenario: Demo locations included
- **WHEN** a developer clones the starter and runs the dev server
- **THEN** they SHALL see at least 3 sample locations in different cities with realistic, unique placeholder content demonstrating all location features including varied operating hours
