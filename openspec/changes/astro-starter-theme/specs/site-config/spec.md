## ADDED Requirements

### Requirement: Central site configuration file
The system SHALL provide a single `src/config/site.ts` file that exports a typed configuration object containing all site-wide settings. All components and layouts SHALL import from this file rather than hardcoding values.

#### Scenario: Business identity fields
- **WHEN** a developer opens the site configuration file
- **THEN** it SHALL contain fields for: business name, tagline, description, phone number (optional), and logo path

#### Scenario: Business name special characters
- **WHEN** a business name contains special characters (e.g., "McDonald's", "AT&T")
- **THEN** the special characters SHALL be preserved in display and JSON-LD output

#### Scenario: Optional phone number
- **WHEN** the phone number is not configured in site config
- **THEN** components that display phone information (footer, contact section, JSON-LD) SHALL omit phone displays rather than rendering empty values

#### Scenario: Optional physical address
- **WHEN** a developer configures a physical address
- **THEN** the configuration SHALL accept an optional `address` object containing street, city, state, and zip
- **AND** when the address is not provided, components that display address information (footer, contact section, JSON-LD) SHALL omit address blocks rather than rendering empty values

#### Scenario: Social media links
- **WHEN** a developer configures social media
- **THEN** the configuration SHALL accept an object of social platform URLs (Facebook, Instagram, Twitter/X, LinkedIn, YouTube, TikTok) where each platform is optional

#### Scenario: Optional Twitter handle
- **WHEN** a developer configures a Twitter/X handle
- **THEN** the configuration SHALL accept an optional `twitterHandle` string (e.g., `@businessname`) used for `twitter:site` meta tags

#### Scenario: Default SEO settings
- **WHEN** a developer configures SEO defaults
- **THEN** the configuration SHALL include: default meta title template (e.g., `%s | Business Name`), default meta description, default Open Graph image path, default OG image width, default OG image height, and site URL

#### Scenario: Image paths in configuration
- **WHEN** a developer configures logo or default OG image paths
- **THEN** the values SHALL be string paths relative to the `public/` directory (e.g., `/images/logo.png`, `/images/og-default.jpg`)
- **AND** these images are served as-is (pre-optimized by the developer) since Astro's `<Image>` optimization is used for content images, not config images

#### Scenario: GTM configuration
- **WHEN** a developer sets up analytics
- **THEN** the configuration SHALL include a `gtmId` string field
- **AND** GTM injection behavior is specified in seo-infrastructure/spec.md

#### Advisory: GTM and privacy compliance
- **NOTE**: The `gtmId` configuration enables unconditional GTM injection on all pages. This does not include any consent management mechanism. GDPR, CCPA, and other privacy regulation compliance is a per-project responsibility.

#### Scenario: Type safety
- **WHEN** a developer edits the configuration file
- **THEN** TypeScript SHALL enforce the configuration shape with a typed interface, providing autocomplete and compile-time validation for all fields

#### Scenario: Build-time validation
- **WHEN** a developer provides invalid or missing required configuration values (e.g., empty business name, malformed social URLs, empty required fields)
- **THEN** the build SHALL fail with a descriptive error message identifying the invalid field and the validation rule that was violated

### Requirement: Default operating hours
The configuration SHALL accept optional default operating hours for the business, aligned with Schema.org's `openingHoursSpecification` format.

#### Scenario: Operating hours configuration
- **WHEN** a developer configures default operating hours
- **THEN** the configuration SHALL accept an array of operating hours objects, each containing: `dayOfWeek` (a string or array of strings), `open` (24-hour HH:MM format), and `close` (24-hour HH:MM format)
- **AND** the format SHALL support split hours (multiple entries for the same day), day grouping (multiple days in one entry), and omitted days (indicating closed)

#### Scenario: Operating hours validation
- **WHEN** operating hours are configured
- **THEN** `dayOfWeek` values SHALL be Schema.org-compliant: exactly one of Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday (case-sensitive, capitalized)
- **AND** `open` and `close` times SHALL be valid 24-hour format HH:MM (00:00 to 23:59)
- **AND** the build SHALL fail with a descriptive error if invalid day names or time formats are provided

#### Scenario: Operating hours display
- **WHEN** default operating hours are configured
- **THEN** they SHALL be displayed on the `/contact` page and included in Organization JSON-LD on the homepage

#### Scenario: Operating hours not configured
- **WHEN** default operating hours are not provided
- **THEN** operating hours SHALL be omitted from the contact page and JSON-LD

### Requirement: Configuration is the single source of truth
All components that display business information, SEO metadata, or social links SHALL read from the site configuration. No business-specific values SHALL be hardcoded in component files.

#### Scenario: Updating business name
- **WHEN** a developer changes the business name in site config
- **THEN** the name SHALL update everywhere it appears — header, footer, SEO titles, JSON-LD, and Open Graph tags — without editing any other file

#### Scenario: Updating contact info
- **WHEN** a developer changes the phone number in site config
- **THEN** all contact info displays (footer, contact section, JSON-LD) SHALL reflect the new values

### Requirement: Footer navigation configuration
The configuration SHALL include an array of secondary navigation links for the footer.

#### Scenario: Footer secondary navigation config
- **WHEN** a developer configures footer navigation
- **THEN** the configuration SHALL accept an optional `footerNav` array of objects, each containing `text` (display label) and `link` (URL path)
- **AND** the default value SHALL include: Privacy Policy (`/privacy`), Terms of Service (`/terms`), and Sitemap (`/sitemap-index.xml`)
