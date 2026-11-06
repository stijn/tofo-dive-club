# Roadmap

Every change to the site is logged here, newest first. Add to it in the same commit as the change.

## Next

- Real contact details: WhatsApp number, email, Instagram (`src/config.ts`).
- Agree the founding offer: block rates with one or two partner dive centres, the monthly fee, and how sponsored Ocean access places are paid for.
- Isa's own photos instead of Unsplash stock, plus a short founder bio and portrait.
- Confirm the club name and check it doesn't clash with an existing business in Tofo.
- Name the partner dive centres once agreements exist.
- Real club calendar instead of the sample week.
- Store sign-ups (for example a form service or a shared sheet) so nobody gets lost in a WhatsApp chat.
- Portuguese copy reviewed by a Mozambican speaker.
- Accessibility check with real screen-reader users (VoiceOver, TalkBack, NVDA), beyond the automated AAA audit.
- Own domain.

## 0.3.1 · 2026-11-06

- **Mantas really swim forward now**: in 0.3.0 the wing-beat animation replaced the SVG transform that turned the manta, so it still showed head-up and clipped. The turn and the flap now sit on separate groups. Checked by rendering every manta (seasons glider, seasons cell, "manta" easter egg) frozen at three moments of the wing beat.

## 0.3.0 · 2026-11-06

- **Swimmers face forward**: the fish school and every manta (the gliding one, the "manta" easter egg) now face the way they swim; mantas flap their wings up and down.
- **Smooth ascent**: the buoy now glides up frame by frame with easing, eases into the 5 m safety stop, and surfaces in about 3.5 seconds. Scrolling or pressing a key takes back control. Below 1360 px the buoy only shows while you scroll up, so it never covers text you're reading.
- **Wavy nav underline**: the section you're in gets a coral wave that draws in and keeps rolling slowly; hovering previews it.
- **Tooltips**: one accessible tooltip (hover or keyboard focus, Escape to dismiss, hoverable) for the pause, language, menu and buoy buttons, and for every dive word in the copy, which now shows its meaning in place.
- **Duotone headings**: one keyword per section heading in italic accent colour (teal on sand, sun on deep water), all still AAA.
- **Charts react to the cursor**: a depth probe follows the pointer over the dive-site chart and lights up the sites at that depth; the seasons table gets a crosshair, and resting on a cell for 1.5 seconds sends its animal past (whale shark, manta, humpback fluke, fish) or a few bubbles when nothing is around.
- **Dive words redesign**: three grouped cards (on the boat, in the water, learning and kit) with an icon per word, definitions cut to one line, and short forms as chips.
- **Tests**: `npm run test:ui` checks tooltips, pause, depth probe, animals, form, easter egg and that the ascent only ever moves up without jumps.

## 0.2.0 · 2026-11-06

- **Roadmap** renamed to `ROADMAP.md` and kept as a log of every update.
- **Founding offer**: new Offer section with three plans (Visitor, Local crew, Ocean access) and six promises, built on a scan of the Tofo dive market (operator prices, reviews, resident access, wildlife decline). Prices are marked as proposals.
- **Honest wildlife copy**: mantas no longer have a "best" month, Manta Reef and the FAQ say numbers have fallen sharply, and the humpback note states club policy rather than a legal claim.
- **WCAG 2.2 AAA work**:
  - every text colour pair at 7:1 (4.5:1 for large text), checked against rendered pixels, including the hero photo
  - 44 × 44 px targets
  - a two-tone focus ring
  - the fixed header and floating buttons never cover the focused element
  - a pause/play animations button
  - glossary of dive words and short forms, linked from the copy
  - form help, a visible required marker and inline error
  - status messages
  - shorter sentences (Flesch-Kincaid grade about 4)
  - lines under 80 characters
  - localised landmarks
  - current section marked in the nav
  - forced-colours support
- **Animations and treats** (all off with the pause button):
  - rising bubbles in deep water
  - bubbles from the cursor
  - a manta that glides past the seasons table
  - a school of fish on the thermocline
  - dappled light on the hero
  - bubbly buttons
  - a flapping logo manta
  - a "logged" stamp when you send the form
  - a fast-ascent warning
  - type "manta" for a surprise
- **Back to the surface**: the back-to-top button is now an orange surface marker buoy (SMB). It launches, makes a short safety stop at 5 m, then surfaces and moves focus to the top.
- **Favicon set**: bolder manta mark readable at 16 px, `favicon.ico` (16/32/48), SVG favicon, Apple touch icon, 192/512 and maskable icons, web manifests per language.
- **SEO**:
  - shorter titles and descriptions
  - JSON-LD (WebSite, SportsClub with address and geo, WebPage, FAQPage)
  - branded 1200 × 630 share images per language
  - Twitter tags and `og:locale:alternate`
  - preloaded hero image and fonts
  - image width and height to stop layout shift
  - sitemap `lastmod`
  - robots meta
  - a bilingual 404 page ("You went too deep")

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
- Naming or comparing competitors on the site: the market scan stays private; the site only states what the club promises.
- A CMS or backend: the content changes rarely, and editing two TypeScript files is enough for now.
- More languages: English and Portuguese cover visitors and locals.
