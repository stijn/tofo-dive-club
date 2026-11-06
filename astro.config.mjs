// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The demo runs on GitHub Pages at https://stijn.github.io/tofo-dive-club/.
// When the club gets its own domain, set SITE to it and BASE to '/'.
const SITE = process.env.SITE ?? 'https://stijn.github.io';
const BASE = process.env.BASE ?? '/tofo-dive-club';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', pt: 'pt-MZ' } },
    }),
  ],
});
