## ADDED Requirements

### Requirement: Homepage content sourcing
All homepage section content SHALL be defined in a single JSON data file (`src/data/homepage.json`). A Zod schema SHALL validate the JSON structure at build time, providing descriptive error messages for malformed data. Content and presentation SHALL be separated.

#### Scenario: Editing homepage content
- **WHEN** a developer wants to edit homepage section content (hero text, features, testimonials, FAQ items, stats, CTA)
- **THEN** all content SHALL be defined in `src/data/homepage.json` and imported by the homepage page (`src/pages/index.astro`), which passes the relevant data to each section component via props

#### Scenario: Homepage data validation
- **WHEN** homepage.json contains invalid or malformed data
- **THEN** the build SHALL fail with a descriptive Zod validation error identifying the invalid field

### Requirement: Hero section
The homepage SHALL include a hero section as the first section on the page. The hero SHALL be a full-viewport-width section with a minimum height of 60vh, responsive across all screen sizes.

#### Scenario: Hero displays on homepage
- **WHEN** a visitor loads the homepage
- **THEN** they SHALL see a hero section with headline text, supporting subheadline text, and a CTA button linking to a configurable destination

#### Scenario: Hero is responsive
- **WHEN** a visitor views the homepage on a mobile device
- **THEN** the hero section SHALL stack content vertically and remain readable without horizontal scrolling

### Requirement: Features grid section
The homepage SHALL include a features/benefits grid section that displays a configurable set of feature cards with icon, title, and description. Icons SHALL be implemented as inline SVG Astro components from `src/components/icons/`.

#### Scenario: Features display
- **WHEN** a visitor scrolls to the features section
- **THEN** they SHALL see a grid of feature cards, each with an inline SVG icon component, a title, and a short description

#### Scenario: Responsive grid
- **WHEN** viewed on mobile
- **THEN** the features grid SHALL collapse from multi-column to a single column layout

### Requirement: Stats and trust signals section
The homepage SHALL include a section displaying key statistics or trust signals (e.g., years in business, customers served, satisfaction rate).

#### Scenario: Stats data structure
- **WHEN** stats are defined in homepage.json
- **THEN** each stat SHALL be an object with `value` (string, e.g., "500+", "99.9%", "24/7") and `label` (string, e.g., "Happy Customers")

#### Scenario: Stats display
- **WHEN** a visitor views the stats section
- **THEN** they SHALL see all provided stats rendered as value/label pairs

### Requirement: Testimonials section
The homepage SHALL include a testimonials section displaying customer quotes with attribution. The section renders with 1 or more testimonials.

#### Scenario: Testimonial data structure
- **WHEN** testimonials are defined in homepage.json
- **THEN** each testimonial SHALL be an object with `quote` (string), `name` (string), and optional `attribution` (string, e.g., "CEO, Acme Corp" — author formats as desired)

#### Scenario: Testimonial display
- **WHEN** a visitor views the testimonials section
- **THEN** they SHALL see customer quotes with the customer's name and optional attribution

### Requirement: CTA section
The homepage SHALL include a call-to-action section with a contrasting background color differentiated from adjacent sections, designed to drive conversions.

#### Scenario: CTA data structure
- **WHEN** CTA data is defined in homepage.json
- **THEN** it SHALL include `headline` (string) and `button` object with `text` (string) and `link` (string)

#### Scenario: CTA section display
- **WHEN** a visitor views the CTA section
- **THEN** they SHALL see a section with a compelling headline and an action button

### Requirement: FAQ accordion section
The homepage SHALL include a FAQ section with expandable question/answer pairs. The section renders with 1 or more FAQ items.

#### Scenario: FAQ interaction
- **WHEN** a visitor clicks on a FAQ question
- **THEN** the answer SHALL expand below the question
- **AND** clicking again SHALL collapse it

#### Scenario: FAQ accessibility
- **WHEN** a visitor navigates the FAQ with a keyboard
- **THEN** each question SHALL be focusable and toggleable with Enter or Space keys

#### Scenario: FAQ structured data
- **WHEN** the FAQ section is rendered with data on any page
- **THEN** a `FAQPage` JSON-LD schema SHALL be included on that page with the question/answer pairs (see seo-infrastructure/spec.md)

### Requirement: Contact information section
The homepage SHALL include a contact information display section showing business contact details pulled from the site configuration, without a form.

#### Scenario: Contact info display
- **WHEN** a visitor views the contact section
- **THEN** they SHALL see the business phone number (when configured), physical address (when configured), and operating hours (when configured) as pulled from the site configuration

### Requirement: Default section order
The homepage SHALL render sections in the following default order: Hero, Features, Stats, Testimonials, CTA, FAQ, Contact. Developers reorder sections by changing the component import order in the homepage Astro file.

### Requirement: Empty section handling
Each homepage section SHALL conditionally render based on its data.

#### Scenario: Empty section data
- **WHEN** a section's data array is empty in the homepage data file
- **THEN** that section SHALL not render on the page

### Requirement: All sections use reusable components
Each homepage section SHALL be implemented as a standalone, props-driven Astro component that can be reordered, removed, or reused on other pages.

#### Scenario: Section reuse
- **WHEN** a developer wants to add the testimonials section to a service page
- **THEN** they SHALL be able to import and use the Testimonials component independently by passing different data via props. Section components SHALL NOT import directly from `homepage.json` — they receive all data as props from the page that uses them.
