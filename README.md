# Tofo Dive Club

MVP website for a community dive club in Praia do Tofo, Mozambique, in English and Portuguese.

**Demo:** https://stijn.github.io/tofo-dive-club/ · Português: https://stijn.github.io/tofo-dive-club/pt/

Plans and history: [roadmap.md](roadmap.md)

## What's on the page

One long page that reads like a dive: it starts on the sand and gets darker as you scroll, with a depth gauge on wide screens.

- **Hero**: what the club is, with a "join" call to action.
- **The club**: why a club, and who started it.
- **Dives**: reef dives, ocean safaris, courses, club nights, and a sample club week.
- **Dive sites**: Manta Reef, Giant's Castle, The Office and Salon on a shared depth chart.
- **Seasons**: whale sharks, mantas, humpbacks and water temperature by month. The current month is highlighted.
- **Join**: a form that writes a message and opens it in WhatsApp or the visitor's email app. The site stores nothing.
- **FAQ** and footer.

## Stack

- [Astro](https://astro.build) 7, static output, no client framework.
- [Font Awesome Free](https://fontawesome.com) icons from the official `@fortawesome/*` packages, inlined as SVG at build time.
- [line-md](https://github.com/cyberalien/line-md) animated icons via Iconify, inlined so their animations run. They replay when scrolled into view.
- Fonts: Fraunces and Manrope, self-hosted through Fontsource.
- Photos: hotlinked from Unsplash (Unsplash License), credited in the footer.

## Editing

| What | Where |
| --- | --- |
| Club name, WhatsApp number, email, socials, map link | `src/config.ts` |
| Photos | `photos` in `src/config.ts` |
| English copy | `src/i18n/en.ts` |
| Portuguese copy | `src/i18n/pt.ts` (TypeScript checks it has the same keys as English) |
| Icons, dive-site depths, season patterns | `src/data.ts` |
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

1. Move finished items out of "Next" in [roadmap.md](roadmap.md) and add a dated section for the release.
2. Bump `version` in `package.json`.
3. Commit, tag `vX.Y.Z` and push the tag.
