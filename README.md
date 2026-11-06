# Tofo Dive Club

MVP website for a community dive club in Praia do Tofo, Mozambique, in English and Portuguese.

**Demo:** https://stijn.github.io/tofo-dive-club/ · Português: https://stijn.github.io/tofo-dive-club/pt/

Plans and history: [ROADMAP.md](ROADMAP.md)

## What's on the page

One long page that reads like a dive: it starts on the sand and gets darker as you scroll, with a depth gauge on wide screens.

- **Hero**: what the club is, with a "join" call to action.
- **The club**: why a club, and who started it.
- **Dives**: reef dives, ocean safaris, courses, club nights, and a sample club week.
- **Dive sites**: Manta Reef, Giant's Castle, The Office and Salon on a shared depth chart.
- **Seasons**: whale sharks, mantas, humpbacks and water temperature by month. The current month is highlighted.
- **Offer**: three founding plans and six promises, based on a scan of the local dive market. Prices are proposals.
- **Join**: a form that writes a message and opens it in WhatsApp or the visitor's email app. The site stores nothing.
- **Questions**, **Dive words** (a glossary of jargon and short forms) and the footer.
- A bilingual **404** page.

## Treats

All of these switch off with the pause button in the header, and are off by default for visitors who ask their system for reduced motion.

- Bubbles rise through the deep sections, and from the cursor.
- A manta glides past the seasons table; a school of fish rides the wave between light and deep water.
- The back-to-top button is a surface marker buoy. It launches, makes a short safety stop at 5 m, then surfaces.
- Scroll up too fast and a dive computer-style warning tells you to slow down.
- Type "manta" anywhere on the page.

## Accessibility

The site targets WCAG 2.2 level AAA. Checks run for each release:

- **axe-core**: every A, AA and AAA rule, on both languages and the 404 page, at desktop and phone widths. No violations.
- **Contrast**: a pixel check of every text run against what is actually rendered behind it, including over the hero photo. Normal text is at least 7:1 and large text at least 4.5:1.
- **Targets**: all controls are at least 44 × 44 px.
- **Reflow**: no horizontal scroll at 320 px.
- **Reading level**: Flesch-Kincaid grade about 4 for the English copy.

Run them with `npm run audit` and `npm run audit:targets` while `npm run preview` is running (see [tools/a11y](tools/a11y/README.md)). Automated checks can't prove conformance on their own. A review with screen-reader users is still on the roadmap.

Copy uses a small markup (`src/lib/rich.ts`):
- `[[g:id|text]]` links a word to its glossary entry.
- `[[a:id|text]]` marks an abbreviation.
- Unknown ids fail the build.

## Stack

- [Astro](https://astro.build) 7, static output, no client framework.
- [Font Awesome Free](https://fontawesome.com) icons from the official `@fortawesome/*` packages, inlined as SVG at build time.
- [line-md](https://github.com/cyberalien/line-md) animated icons via Iconify, inlined so their animations run. They replay when scrolled into view.
- Fonts: Fraunces and Manrope, self-hosted through Fontsource and preloaded.
- SEO: canonical and hreflang links, JSON-LD (SportsClub, FAQPage), branded share images, sitemap and web manifests.
- Photos: hotlinked from Unsplash (Unsplash License), credited in the footer.

## Editing

| What | Where |
| --- | --- |
| Club name, WhatsApp number, email, socials, map link | `src/config.ts` |
| Photos | `photos` in `src/config.ts` |
| English copy | `src/i18n/en.ts` |
| Portuguese copy | `src/i18n/pt.ts` (TypeScript checks it has the same keys as English) |
| Icons, dive-site depths, season patterns | `src/data.ts` |
| Glossary terms and short forms | `glossary` in `src/i18n/en.ts` and `pt.ts` |
| Membership plans and promises | `offer` in `src/i18n/en.ts` and `pt.ts` |
| Favicons and share images | `public/` (regenerate the PNGs if the mark changes) |
| Styles | `src/styles/global.css` |

Contact details are empty on purpose. Until they are filled in, the WhatsApp button lets the visitor pick a contact and the email button opens a blank draft.

## Run it locally

Needs Node 22.23 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:4321/tofo-dive-club/.

```bash
npm run check   # type check
npm run build   # static site in dist/
```

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).

To move it to its own domain, set `SITE` (for example `https://tofodiveclub.com`) and `BASE=/` in the workflow, and add a `public/CNAME` file.

## Release steps

1. Run `npm run check` and `npm run build`, and rerun the accessibility checks.
2. Move finished items out of "Next" in [ROADMAP.md](ROADMAP.md) and add a dated section for the release.
3. Bump `version` in `package.json`.
4. Commit, tag `vX.Y.Z` and push the tag.
