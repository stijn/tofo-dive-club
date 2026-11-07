// Club details in one place. Empty values are hidden on the site,
// and the join form still works without them (it lets people pick a contact).
// The club's name in each language is meta.siteName in src/i18n/.
import { tohReady } from './i18n/progress';

export const club = {
  // International format, digits only, e.g. '258841234567'. Empty: WhatsApp asks who to send to.
  whatsapp: '',
  // Empty: the email app opens with no recipient filled in.
  email: '',
  instagram: '', // full URL
  facebook: '', // full URL
  map: 'https://www.openstreetmap.org/?mlat=-23.8525&mlon=35.5465#map=15/-23.8525/35.5465',
  // The site's code and plans. The demo notice in the footer links here, and to a form
  // for ideas (.github/ISSUE_TEMPLATE/idea.yml). Remove the notice at launch.
  repo: 'https://github.com/stijn/tofo-dive-club',
};

export type Lang = 'en' | 'pt' | 'toh';
/** Every language that has a page. */
export const allLangs: Lang[] = ['en', 'pt', 'toh'];
/** Languages in the menu, search results and sitemap. Gitonga joins once it's fully translated. */
export const langs: Lang[] = tohReady ? ['en', 'pt', 'toh'] : ['en', 'pt'];
export const listed = (lang: Lang) => langs.includes(lang);
/** The page's lang attribute. Until Gitonga is done its page is Portuguese text, so it says so. */
export const htmlLang: Record<Lang, string> = { en: 'en', pt: 'pt-MZ', toh: tohReady ? 'toh' : 'pt-MZ' };
/** Each language in its own words, for the footer's language list. */
export const langNames: Record<Lang, string> = { en: 'English', pt: 'Português', toh: 'Gitonga' };
/** og:locale. Facebook has no Gitonga, so that page shares as Portuguese (Mozambique). */
export const ogLocale: Record<Lang, string> = { en: 'en_GB', pt: 'pt_MZ', toh: 'pt_MZ' };

// Photos come from Unsplash (Unsplash License: free to use and to host yourself).
// The masters live in src/assets/photos/<key>.jpg and src/lib/photo.ts turns them into
// small AVIF/WebP files at build time. To use the club's own photos, replace a JPEG
// there (keep the file name) and update the credit here.
const utm = '?utm_source=tofo_dive_club&utm_medium=referral';

export const photos = {
  heroWhaleShark: {
    id: 'photo-1544552866-49ce864ff896',
    by: 'Sebastian Pena Lambarri',
    url: `https://unsplash.com/photos/whale-shark-swimming-in-blue-ocean-Abj_zUko6Mg${utm}`,
  },
  whaleSharkAbove: {
    id: 'photo-1540202404-b2979d19ed37',
    by: '@seefromthesky',
    url: `https://unsplash.com/photos/whale-shark-swimming-in-deep-ocean-wXt0DiISf38${utm}`,
  },
  mantas: {
    id: 'photo-1544552866-fef1d68c69b5',
    by: 'Sebastian Pena Lambarri',
    url: `https://unsplash.com/photos/grey-and-black-stingray-in-underwater-photography-F54xLcv9wQ0${utm}`,
  },
  diverSigns: {
    id: 'photo-1544551763-8dd44758c2dd',
    by: 'Sebastian Pena Lambarri',
    url: `https://unsplash.com/photos/man-underwater-making-hand-signs-44r12Ck_CoI${utm}`,
  },
  diversSchool: {
    id: 'photo-1544551763-46a013bb70d5',
    by: 'Sebastian Pena Lambarri',
    url: `https://unsplash.com/photos/two-people-scuba-diving-underwater-7i5HMCGupVw${utm}`,
  },
  tofoBeach: {
    id: 'photo-1706214332832-40128663a380',
    by: '@claudia_74',
    url: `https://unsplash.com/photos/a-sandy-beach-with-people-walking-on-it-EPeiTygoH58${utm}`,
  },
  tofoSurf: {
    id: 'photo-1721403955612-e3c9fa45d69f',
    by: '@mocream_coffee',
    url: `https://unsplash.com/photos/a-person-walking-on-a-beach-with-a-surfboard-_zfsjBFxpzE${utm}`,
  },
  humpback: {
    id: 'photo-1568430462989-44163eb1752f',
    by: 'Todd Cravens',
    url: `https://unsplash.com/photos/humpback-whale-breaching-blue-ocean-lwACYK8ScmA${utm}`,
  },
} as const;

export type PhotoKey = keyof typeof photos;
