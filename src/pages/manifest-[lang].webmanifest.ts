// The web app manifest for each language, built from the copy in src/i18n/.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getRelativeLocaleUrl } from 'astro:i18n';
import { allLangs, htmlLang, type Lang } from '../config';
import { t } from '../i18n';

export const getStaticPaths = (() => allLangs.map((lang) => ({ params: { lang } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Lang;
  const d = t(lang).meta;
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const manifest = {
    name: d.siteName,
    short_name: d.shortName,
    description: d.appDescription,
    lang: htmlLang[lang],
    start_url: getRelativeLocaleUrl(lang, ''),
    scope: base,
    display: 'standalone',
    background_color: '#04192a',
    theme_color: '#04192a',
    icons: [
      { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${base}icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: `${base}favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
};
