# Roadmap

## Next

- Real contact details: WhatsApp number, email, Instagram (`src/config.ts`).
- Isa's own photos instead of Unsplash stock, plus a short founder bio and portrait.
- Name and logo: confirm the club name and check it doesn't clash with an existing business in Tofo.
- Partner dive centres: name them once agreements exist.
- Membership tiers and prices, set with the founding members.
- Real club calendar instead of the sample week.
- Store sign-ups (for example a form service or a shared sheet) so nobody gets lost in a WhatsApp chat.
- Own domain.
- Portuguese copy reviewed by a Mozambican speaker.

## 0.1.0 · 2026-11-06

First MVP, live as a demo on GitHub Pages.

- One-page site in English (`/`) and Portuguese (`/pt/`), with hreflang links, a language switch that keeps your place, and a sitemap.
- Sections: hero, the club, dives with a sample club week, dive sites on a depth chart, month-by-month seasons, join form, FAQ.
- Join form that composes a message for WhatsApp or email; nothing is stored.
- Font Awesome Free and line-md icons, inlined at build time.
- Depth gauge and "descent" colour scheme; scroll reveals that respect reduced-motion settings.
- GitHub Actions deploy to GitHub Pages on every push to `main`.

## Not planned

- Online booking and payments: dives are run and sold by licensed dive centres, not the club.
- A CMS or backend: the content changes rarely, and editing two TypeScript files is enough for now.
- More languages: English and Portuguese cover visitors and locals.
