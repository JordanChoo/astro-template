## ADDED Requirements

### Requirement: Team content collection
The system SHALL support team member profiles using an Astro content collection at `src/content/team/`, serving as both blog authors and team page entries. The collection schema is defined in `src/content.config.ts`.

#### Scenario: Team collection schema
- **WHEN** a developer creates a team member entry in `src/content/team/`
- **THEN** the schema SHALL validate: name, slug, bio, avatar image path, role/title, and optional social links (including Twitter handle for `twitter:creator` meta tags)

#### Scenario: Invalid author reference
- **WHEN** a blog post references a nonexistent author in the team collection
- **THEN** the build SHALL fail with an error identifying the post and the invalid author reference

#### Scenario: Duplicate slugs
- **WHEN** two team member entries share the same slug
- **THEN** the build SHALL fail with an error identifying the duplicate

#### Advisory: Removing team members
- **NOTE**: To remove a team member, first reassign or delete their authored blog posts. Removing a team member while blog posts still reference them will cause a build failure due to invalid author references.

### Requirement: Team listing page
A team listing page SHALL exist at `/team/` showing all team members.

#### Scenario: Team listing display
- **WHEN** a visitor navigates to `/team/`
- **THEN** they SHALL see a list of all team members with name, avatar, and role

#### Scenario: Empty team listing
- **WHEN** no team members are defined in the collection
- **THEN** the team listing page SHALL display a "No team members yet" message

### Requirement: Individual team member pages
Each team member SHALL have a detail page at `/team/[slug]`.

#### Scenario: Team member detail page
- **WHEN** a visitor navigates to `/team/[slug]`
- **THEN** they SHALL see the team member's profile (name, avatar, bio, role, social links) and a list of all published blog posts authored by that team member

#### Scenario: Team member with no published posts
- **WHEN** a team member has 0 published blog posts
- **THEN** the posts section on their detail page SHALL be hidden entirely

#### Scenario: Static generation of team pages
- **WHEN** the site is built (SSG)
- **THEN** Astro's `getStaticPaths` SHALL generate a static page for every team member entry in the collection

### Requirement: Author display on blog posts
Team member data SHALL be used to display author information on blog posts.

#### Scenario: Author display on posts
- **WHEN** a visitor views a blog post
- **THEN** the author's name, avatar, and bio SHALL be displayed, linked to their team member page at `/team/[slug]`

### Requirement: Team member SEO
Each team member page SHALL include appropriate SEO metadata.

#### Scenario: Team member meta tags
- **WHEN** a team member page is rendered
- **THEN** the page SHALL have a unique title tag (e.g., "Jane Doe | Business Name") and meta description derived from the team member's bio

### Requirement: Team image optimization
All team-related images (avatars) SHALL use Astro's `<Image>` component for automatic optimization.

### Requirement: Demo team content
The starter SHALL include demo team members to demonstrate the system.

#### Scenario: Demo team members included
- **WHEN** a developer clones the starter and runs the dev server
- **THEN** they SHALL see at least 2 sample team members with realistic placeholder content, each authoring at least one demo blog post
