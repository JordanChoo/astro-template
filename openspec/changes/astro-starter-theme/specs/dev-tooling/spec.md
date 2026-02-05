## ADDED Requirements

### Requirement: Package manager
The project SHALL use pnpm as its package manager.

#### Scenario: pnpm lockfile
- **WHEN** a developer clones the project
- **THEN** a `pnpm-lock.yaml` file SHALL be present and `pnpm install` SHALL be the documented installation command

### Requirement: Node.js version
The project SHALL specify a minimum Node.js version compatible with Astro 5.x.

#### Scenario: .nvmrc file
- **WHEN** a developer using nvm opens the project
- **THEN** an `.nvmrc` file SHALL pin the Node.js version to `22` (active LTS)

#### Scenario: engines field
- **WHEN** a developer runs `pnpm install` with an incompatible Node.js version
- **THEN** the `engines` field in `package.json` SHALL require `>=18.17.1` and cause a clear error indicating the minimum required Node version

### Requirement: Core Astro scripts
The project SHALL include standard Astro development scripts in `package.json`.

#### Scenario: Development scripts
- **WHEN** a developer runs project scripts
- **THEN** `package.json` SHALL include:
  - `pnpm run dev` — starts the Astro development server
  - `pnpm run build` — builds the site for production (static output)
  - `pnpm run preview` — previews the production build locally
  - `pnpm run lint` — runs ESLint
  - `pnpm run format` — runs Prettier
  - `pnpm run check` — runs `astro check`
  - `pnpm run test` — runs Vitest

### Requirement: TypeScript strict mode
The project SHALL use TypeScript in strict mode for all source files.

#### Scenario: TypeScript configuration
- **WHEN** a developer opens the project
- **THEN** `tsconfig.json` SHALL extend Astro's base TypeScript config with `strict: true` enabled

#### Scenario: Type errors caught at build
- **WHEN** the project is built
- **THEN** TypeScript type errors SHALL cause the build to fail

### Requirement: Astro check
The project SHALL use `astro check` for Astro-specific type validation.

#### Scenario: Astro check validation
- **WHEN** a developer runs `pnpm run check`
- **THEN** `astro check` SHALL validate `.astro` files, content collection schemas, and component props
- **AND** errors SHALL cause the check to fail with descriptive messages

### Requirement: ESLint configuration
The project SHALL include ESLint configured for Astro and TypeScript, with Prettier conflict resolution.

#### Scenario: ESLint setup
- **WHEN** a developer runs the lint command
- **THEN** ESLint SHALL check `.astro`, `.ts`, and `.js` files using Astro's recommended ESLint plugin and TypeScript ESLint rules
- **AND** `eslint-config-prettier` SHALL be included to disable ESLint rules that conflict with Prettier

### Requirement: Prettier configuration
The project SHALL include Prettier configured for consistent code formatting.

#### Scenario: Prettier setup
- **WHEN** a developer runs the format command
- **THEN** Prettier SHALL format `.astro`, `.ts`, `.js`, `.css`, `.md`, and `.mdx` files using Astro's Prettier plugin

### Requirement: Pre-commit hooks
The project SHALL enforce lint and format rules before commits using Husky and lint-staged.

#### Scenario: Pre-commit hook execution
- **WHEN** a developer commits code
- **THEN** Husky SHALL trigger lint-staged, which runs ESLint and Prettier on staged files
- **AND** the commit SHALL be blocked if lint or format checks fail

### Requirement: Tailwind CSS v4 configuration
The project SHALL include Tailwind CSS v4 with a configured theme.

#### Scenario: Tailwind setup
- **WHEN** the project is built or the dev server starts
- **THEN** Tailwind CSS v4 SHALL be configured as a Vite plugin in `astro.config.mjs` with CSS-based configuration in `src/styles/global.css`

#### Scenario: Design tokens in Tailwind theme
- **WHEN** a developer uses Tailwind utility classes
- **THEN** design tokens SHALL be defined using CSS `@theme` declarations in `src/styles/global.css` including: a color palette (primary, secondary, accent, neutral tones), font family (referencing the Google Fonts loaded in BaseLayout), and a spacing scale
- **AND** these tokens SHALL serve as the project's design system — developers customize per-project by editing `src/styles/global.css`

### Requirement: Testing with Vitest
The project SHALL include a Vitest testing framework configured for Astro.

#### Scenario: Vitest setup
- **WHEN** a developer runs `pnpm run test`
- **THEN** Vitest SHALL execute all test files matching `**/*.test.ts` or `**/*.spec.ts`

#### Scenario: Component testing
- **WHEN** a developer writes tests for Astro components
- **THEN** Vitest SHALL be configured to support testing Astro component output and utility functions

#### Scenario: Build smoke test
- **WHEN** the test suite runs
- **THEN** it SHALL include at minimum a smoke test that verifies `astro build` completes without errors

### Requirement: VS Code configuration
The project SHALL include VS Code workspace settings and recommended extensions.

#### Scenario: VS Code settings
- **WHEN** a developer opens the project in VS Code
- **THEN** `.vscode/settings.json` SHALL configure format-on-save with Prettier as the default formatter and ESLint auto-fix on save

#### Scenario: Recommended extensions
- **WHEN** a developer opens the project in VS Code
- **THEN** `.vscode/extensions.json` SHALL recommend: Astro, ESLint, Prettier, and Tailwind CSS IntelliSense extensions

### Requirement: EditorConfig
The project SHALL include an `.editorconfig` file for cross-editor consistency.

#### Scenario: EditorConfig settings
- **WHEN** a developer opens any source file in a compatible editor
- **THEN** the editor SHALL apply: 2-space indentation, UTF-8 charset, LF line endings, trailing whitespace trimming, and final newline insertion

### Requirement: GitHub Actions CI/CD
The project SHALL include a GitHub Actions workflow for continuous integration and deployment.

#### Scenario: CI checks on pull requests
- **WHEN** a pull request is opened or updated
- **THEN** GitHub Actions SHALL run: `pnpm run lint`, `pnpm run check`, `pnpm run build`, and `pnpm run test`
- **AND** the PR SHALL be blocked from merging if any check fails

#### Scenario: Deployment on merge
- **WHEN** code is merged to the main branch
- **THEN** GitHub Actions SHALL build the site and deploy to Cloudflare Pages

### Requirement: Performance targets
The project SHALL meet minimum performance standards as measured by Lighthouse.

#### Scenario: Lighthouse scores
- **WHEN** the built site is tested with Lighthouse on the homepage
- **THEN** it SHALL score 90 or higher in all four categories: Performance, Accessibility, Best Practices, and SEO

### Requirement: Cross-cutting image optimization
All content images across the site (blog, services, team, locations) SHALL use Astro's `<Image>` component for automatic optimization. Decorative and background images MAY use CSS instead.

#### Scenario: Image optimization applied
- **WHEN** any content image is rendered on the site
- **THEN** it SHALL use Astro's `<Image>` component providing responsive sizes, format conversion (WebP/AVIF), and lazy loading

#### Scenario: Content images stored in src/
- **WHEN** content images are added for blog posts, team avatars, or other content
- **THEN** they SHALL be stored in or co-located with `src/` directories to enable Astro's image optimization
- **AND** configuration images (logo, default OG image, favicons) remain in `public/` as pre-optimized assets
