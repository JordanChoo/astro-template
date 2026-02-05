# Astro Business Website Template

A ready-to-use, professional business website template built with [Astro](https://astro.build). Designed for service-based businesses, agencies, and consultancies that need a fast, SEO-friendly website without the complexity of a traditional CMS.

## What This Template Includes

**Pages:**

- **Homepage** -- Hero banner, feature highlights, statistics, services overview, client testimonials, FAQ, and call-to-action sections
- **Services** -- Listing page + individual detail pages for each service you offer
- **Team** -- Team listing + individual profile pages for each team member
- **Locations** -- Office/branch listing + detail pages with addresses, hours, and service areas
- **Blog** -- Full blog with pagination, tag filtering, category filtering, RSS feed, and table of contents
- **Contact** -- Contact page
- **Legal** -- Privacy policy and terms of service pages

**Built-in Features:**

- Mobile-friendly responsive design
- SEO optimized (meta tags, Open Graph images, XML sitemap, structured data for Google)
- Blog with Markdown/MDX support, reading time, and related posts
- Google Tag Manager integration (just add your GTM ID)
- Fast performance -- ships zero JavaScript to the browser by default

## Prerequisites

Before you start, you'll need the following installed on your computer:

1. **Node.js** (version 18.17.1 or higher) -- [Download Node.js](https://nodejs.org/)
2. **pnpm** (package manager) -- After installing Node.js, open a terminal and run:
   ```sh
   npm install -g pnpm
   ```
3. **Git** -- [Download Git](https://git-scm.com/downloads)

To check if these are installed, open a terminal and run:

```sh
node --version
pnpm --version
git --version
```

Each command should print a version number.

## Getting Started

### 1. Clone the repository

```sh
git clone <your-repo-url> my-website
cd my-website
```

### 2. Install dependencies

```sh
pnpm install
```

### 3. Start the development server

```sh
pnpm dev
```

Open your browser to **http://localhost:4321** to see the site. Changes you make to files will automatically appear in the browser.

### 4. Stop the server

Press `Ctrl + C` in the terminal.

## How to Customize the Site

### Site Identity & Contact Info

Edit `src/config/site.ts` and replace the placeholder values with your own:

- **name** -- Your business name
- **tagline** -- Your slogan or tagline
- **description** -- A short description of your business (used in search results)
- **phone** -- Your business phone number
- **address** -- Your business address
- **social** -- Links to your social media profiles
- **seo.siteUrl** -- Your live website URL (e.g., `https://www.yourbusiness.com`)
- **gtmId** -- Your Google Tag Manager ID (or remove the line if not using GTM)
- **operatingHours** -- Your business hours

### Homepage Content

Edit `src/data/homepage.json` to change the homepage hero text, features, statistics, testimonials, FAQ, and call-to-action content.

### Services

Edit the JSON files in `src/content/services/` to add, remove, or modify your service offerings. Each service has a name, description, icon, and list of features.

### Team Members

Add or edit Markdown files in `src/content/team/`. Each file represents a team member with their name, role, bio, avatar image, and social links.

### Blog Posts

Add Markdown (`.md`) or MDX (`.mdx`) files to `src/content/blog/`. Each post needs frontmatter at the top of the file with a title, description, publish date, author, and tags. Set `draft: true` to hide a post from the live site.

### Locations

Edit the JSON files in `src/content/locations/` to add or modify office locations with addresses, phone numbers, coordinates, operating hours, and service areas.

### Images

Place images in the `public/images/` directory. Reference them in your content as `/images/your-image.jpg`.

## Available Commands

Run these from the project root in a terminal:

| Command        | What it does                                       |
| :------------- | :------------------------------------------------- |
| `pnpm dev`     | Starts the local development server                |
| `pnpm build`   | Builds the production site to the `./dist/` folder |
| `pnpm preview` | Previews the production build locally              |
| `pnpm check`   | Runs TypeScript type checking                      |
| `pnpm lint`    | Checks code for style issues                       |
| `pnpm format`  | Auto-formats all code files                        |
| `pnpm test`    | Runs the test suite                                |

## Deploying to Cloudflare Pages via GitHub

Cloudflare Pages is a free hosting platform that automatically builds and deploys your site whenever you push changes to GitHub.

### Step 1: Push your code to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (do **not** initialize it with a README)
2. In your terminal, from the project folder:

   ```sh
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

### Step 2: Connect to Cloudflare Pages

1. Sign up or log in at [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. In the left sidebar, click **Workers & Pages**
3. Click **Create** then select the **Pages** tab
4. Click **Connect to Git**
5. Select your GitHub account and authorize Cloudflare if prompted
6. Choose the repository you pushed to in Step 1

### Step 3: Configure the build settings

On the build configuration screen, set the following:

| Setting                    | Value        |
| :------------------------- | :----------- |
| **Framework preset**       | Astro        |
| **Build command**          | `pnpm build` |
| **Build output directory** | `dist`       |

Under **Environment variables**, add:

| Variable name  | Value |
| :------------- | :---- |
| `NODE_VERSION` | `20`  |

Click **Save and Deploy**.

### Step 4: Wait for the first build

Cloudflare will build and deploy your site. This usually takes 1-2 minutes. Once complete, you'll get a live URL like `https://your-project.pages.dev`.

### Step 5: Set up a custom domain (optional)

1. From your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `www.yourbusiness.com`)
4. Follow the instructions to update your DNS records

### Automatic deployments

After the initial setup, every time you push changes to the `main` branch on GitHub, Cloudflare Pages will automatically rebuild and deploy your site. No manual steps required.

### Update your site URL

After deployment, update the `site` value in `astro.config.mjs` to your live URL:

```js
export default defineConfig({
  site: 'https://www.yourbusiness.com',
  // ...
});
```

Also update `seo.siteUrl` in `src/config/site.ts` to match.

## Project Structure

```
src/
  config/
    site.ts              -- Site-wide configuration (name, contact, SEO)
  content/
    blog/                -- Blog posts (Markdown/MDX files)
    team/                -- Team member profiles (Markdown files)
    services/            -- Service definitions (JSON files)
    locations/           -- Office locations (JSON files)
  data/
    homepage.json        -- Homepage content (hero, features, stats, etc.)
    pages.json           -- Page metadata for listing pages
  components/
    sections/            -- Page sections (Hero, Features, Stats, etc.)
    seo/                 -- Structured data components (JSON-LD)
    icons/               -- Icon components
  layouts/
    BaseLayout.astro     -- Root HTML layout
    PageLayout.astro     -- Standard page layout
    PostLayout.astro     -- Blog post layout
  pages/                 -- All site routes/pages
public/
  images/                -- Static images (logos, photos, etc.)
  fonts/                 -- Custom fonts (if any)
astro.config.mjs         -- Astro framework configuration
package.json             -- Project dependencies and scripts
```

## Tech Stack

- [Astro](https://astro.build) -- Static site framework
- [Tailwind CSS](https://tailwindcss.com) -- Utility-first CSS styling
- [TypeScript](https://www.typescriptlang.org) -- Type-safe JavaScript
- [MDX](https://mdxjs.com) -- Markdown with component support for blog posts
