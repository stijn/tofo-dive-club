// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { tohReady } from './src/i18n/progress.ts';

// The demo runs on GitHub Pages at https://stijn.github.io/tofo-dive-club/.
// When the club gets its own domain, set SITE to it and BASE to '/'.
const SITE = process.env.SITE ?? 'https://stijn.github.io';
const BASE = process.env.BASE ?? '/tofo-dive-club';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  // The stylesheet goes inside each page: on a slow connection the first paint
  // then needs one download instead of two.
  build: { inlineStylesheets: 'always' },
  i18n: {
    defaultLocale: 'en',
    // Gitonga (toh) is built but stays out of the sitemap until it's fully translated.
    locales: ['en', 'pt', 'toh'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', pt: 'pt-MZ', ...(tohReady && { toh: 'toh' }) } },
      filter: (page) => !/404|\.csv$|\.webmanifest$/.test(page) && (tohReady || !page.includes('/toh/')),
      lastmod: new Date(),
      changefreq: 'monthly',
    }),
  ],
});
