// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        // Exclude paginated pages (except first page) and noindex pages
        const url = new URL(page);
        const path = url.pathname;
        // Exclude /blog/2/, /blog/3/, etc. but allow /blog/
        if (/\/blog\/\d+\/$/.test(path)) return false;
        if (/\/blog\/tags\/[^/]+\/\d+\/$/.test(path)) return false;
        if (/\/blog\/categories\/[^/]+\/\d+\/$/.test(path)) return false;
        return true;
      },
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
