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
- **Gitonga translation** by a native speaker: send them [the sheet](https://stijn.github.io/tofo-dive-club/translations/gitonga.csv), then `npm run i18n:import` (see [translations/README.md](translations/README.md)). At 100% the Gitonga version goes live by itself. Then add a Gitonga share image.
- Another language (French or German are the likeliest) once the join form's "preferred language" answers show demand.
- Club photos: replace the masters in `src/assets/photos/` (same file names) and update the credits.

## 0.6.0 · 2026-11-07

No font files, a whale shark, a headline that matches its photo, a data saver that decides for itself, a smoother language switch, and small moments of delight. Measured like 0.5.0 (throttled slow 3G, first visit, data saver off), against the live 0.5.0:

| | 0.5.0 | 0.6.0 |
| --- | --- | --- |
| First screen | 434 KB | 146 KB |
| Whole page, scrolled to the bottom | 632 KB | 344 KB |
| The same, letting data saver decide (it switches on over slow 3G) | 632 KB | 146 KB |
| Largest paint (Google's LCP) | 4.0 s | 0.9 s |

Lighthouse: 100 for accessibility, best practices and SEO on mobile and desktop; performance 99 on mobile, 100 on desktop.

**Speed and fonts**
- **No font files.** The site uses the phone's own fonts: New York on iPhone and Mac, Georgia on Windows and Noto Serif on Android for headings, and the system sans for text. Compared side by side as they render on each, they hold up, and they save 289 KB, two thirds of the first screen. Text no longer waits for a font, which is why the largest paint dropped to under a second.
- **Lighthouse fixes**: the header and depth gauge no longer force a layout of the whole page while it starts up; the club photos and the humpback photo ask for the size they're shown at (the humpback was too small, so soft, on screens 960 to 1023 px wide); the whale shark's spots are one shape instead of 170.

**Data saver**
- **It decides by itself.** Once a page has arrived, the site measures how fast it came, which works in every browser. Below about 500 kbit/s data saver switches on, on wifi or good mobile data it stays off. The phone's own data saver setting always switches it on. The tooltip says why ("Slow connection, so saving data") and how much it saves on the page.
- **The button's choice lasts for the visit.** 0.5.0 remembered it for good, so a choice made once could leave you without photos on fast home wifi. Choices saved by 0.5.0 are cleared.
- **Android's own Data Saver icon** instead of the feather: most phones in Mozambique run Android and show this icon in their quick settings.

**Look and feel**
- **A whale shark** cruises along the surface at the top of the dive sites, where the depth chart says whale sharks feed: broad flat head, gill slits, ridges, its spot-and-stripe pattern, a tail that sweeps side to side, and three pilot fish riding its bow wave. It joins the fish on the thermocline, the manta at the seasons table and the humpback at the bottom. It swims at most every 40 seconds, and the pause button stops it.
- **The hero headline matches its photo**: "A dive club on the coast of giants" over the whale shark, instead of "Manta Coast" over a whale shark. The coast's real name stays where people and search engines look for it: the page title, the description, the hero's first sentence ("Tofo is on Mozambique's Manta Coast…"), the footer and the structured data. The shade behind the headline is a little wider, so the longer line keeps AAA contrast over the photo.
- **Little moments**: pointing at a photo sends a beam of sunlight across it; card and stat icons give a nudge; each section's depth label ticks up from the one above as you reach it; the depth gauge bounces at every 10 m; form chips pop with a bubble; FAQ answers float in; a dive word you jump to glows. All of them stop with the pause button and the phone's reduce-motion setting (also without JavaScript).
- **Smoother language switch**: the page cross-fades while the header and depth gauge stay put (Chrome, Edge, Safari 18.2+; skipped while animations are paused). Hovering over or touching the switch loads the other language in advance, so it opens at once (Chrome, Edge; not in data saver mode). Back and Forward come straight from the browser's back/forward cache, checked by a test.
- **Fixed: the "manta" easter egg spoiled its own surprise.** The second and third mantas wait their turn before swimming in, and during that wait they sat in plain view. They now wait off-screen.
- **Fixed: no icon in Safari.** Safari 27 picks the SVG icon, which had no size of its own, and showed a letter instead. The SVG now has one, and the icon links carry a version (`?v=2`) so Safari fetches them again instead of trusting its cache.

**Working on the site**
- **GitHub links in the demo notice**: "Suggest it on GitHub" opens a short form for ideas, in English and Portuguese (`.github/ISSUE_TEMPLATE/idea.yml`), and "The project on GitHub" opens the code and plans. Sending an idea needs a free GitHub account.
- **New share images** with the new headline and a faint whale shark. `tools/og/make.mjs` makes them, so they can be remade when the words change.
- **Tests**: `npm run test:ui` now also checks the whale shark, the easter-egg mantas starting off-screen, no font files, data saver switching itself on over slow 3G and off on a fast line, the language switch (aimed at the section in view, loaded in advance, cross-fading, back/forward cache), the depth labels and the saved-data count. Animal checks wait for the animation to start instead of a fixed time, which made them fail now and then on a busy machine. `npm run perf` keeps data saver off unless you pass `--save` or `--auto`, so releases compare like with like.

## 0.5.0 · 2026-11-07

Built for patchy mobile data. Measured on a throttled slow 3G phone connection (400 kbit/s, 400 ms), first visit, against 0.4.1:

| | 0.4.1 | 0.5.0 |
| --- | --- | --- |
| Text on screen | 2.6 s | 1.0 s |
| Whole page, scrolled to the bottom | 996 KB | 635 KB |
| Photos | 652 KB | 284 KB |
| With data saver on | – | 61 KB |
| Second visit | from the network | 0 KB, opens instantly, also offline |

- **Gitonga version** at `/toh/`, ready for a translator. I couldn't find a Gitonga dictionary good enough to publish from (Glosbe's English–Gitonga dictionary is empty), so the page shows Portuguese until a Gitonga speaker fills in the translation sheet. Until then it's not in the menu, search results or sitemap, and its pages say `lang="pt-MZ"`. The sheet is built from the live copy (361 texts) and opens in Excel or Google Sheets; `npm run i18n:import` brings it back and checks the markup. At 100% Gitonga goes live by itself: footer language list, `lang="toh"`, hreflang and sitemap.
- **Works offline after one visit**: a service worker keeps the page on the phone. Later visits show the saved copy at once and update in the background; with no signal at all, the saved copy is what you get, with a "No signal" note. Nothing is downloaded just to fill the cache: files the page already loaded are copied from the browser's cache. The join form still works offline, because WhatsApp sends the message when the signal is back, and the form says so.
- **Data saver mode**: a feather button next to the pause button. It's on by itself when the phone's data saver is on or the connection is 2G. Photos then load only when tapped ("Show photo · 22 KB", the size this phone would download), and the phone's own fonts are used.
- **Blurred photo previews**: each photo starts as a tiny blurred version built into the page, then fades in. A photo that fails keeps its preview, gets a "Try again" button, and retries by itself when the signal comes back.
- **Photos served from the site** as AVIF and WebP, sized for common phone screens, instead of hotlinked from Unsplash. That saves a second connection, and the photos are about 30% smaller at the same quality (compared side by side at full size).
- **Stylesheet inside the page**, so text appears after one download instead of two. The hero now fades in with CSS alone, so a slow script never holds it back.
- **Lighter on cheap phones**: looping animations pause while their section is off-screen.
- **Smaller link previews**: the WhatsApp and Facebook share image went from 205 KB (PNG) to about 50 KB (JPEG).
- **Footer language list**, and web manifests built from the copy, one per language.
- **Tests**: `npm run test:ui` now also checks self-hosted photos, previews, data saver, failed photos, offline, and the Gitonga page and sheet. `npm run audit` covers the Gitonga page and data saver mode. `npm run perf` measures a page on throttled slow 3G.

## 0.4.1 · 2026-11-07

- **Preferred language** in the join form: English, Português, Afrikaans, Deutsch, Español, Français, Gitonga, Nederlands, or "another language" with a text field. Defaults to the page's language, each option is marked with its own language for screen readers, and the answer is added to the WhatsApp or email message. This tells the club which third language, if any, is worth adding.

## 0.4.0 · 2026-11-07

- **Fixed: clicks jumped to the top.** `<main>` is focusable (the skip link's target), so a mouse click on any plain text focused it. A guard that keeps focused elements out from under the fixed header then scrolled to `<main>`'s top, which is the top of the page. This also broke the `#join` links: the next click after landing threw you back up. The guard now only acts on keyboard focus of normal-sized elements.
- **Diving-mask cursor** over the dive-site depth chart on desktop: the 🤿 emoji, with a drawn mask image for Safari and a crosshair as last resort.
- **A humpback at the bottom**: when you reach the footer, a humpback whale (long white pectoral fin, beating tail) glides across the empty band above it, at most every 40 seconds.
- **Tests**: `npm run test:ui` now also checks that clicking text keeps your place, that `#join` lands under the header, the cursor and the whale.

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
- Web fonts (Fraunces and Manrope until 0.6.0): dropped. The phone's own fonts look nearly as good and save 289 KB on a first visit. If the club ever wants its own look back, one small heading font is worth adding, not the old full set.
- Machine translation into Gitonga: no tool covers it. Glosbe's English–Gitonga dictionary has no entries in either direction, and its "automatic translator" page doesn't exist for this pair (checked again for 0.6.0).
- Other data saver icons: a feather (unclear, and odd on a diving site), a lightning bolt (reads as "fast", not "light"), a weak or broken wifi signal (reads as "no connection", which the "No signal" note already covers, and would make the site look broken when data saver switches on by itself). The Noun Project's "wifi error" icon would also need a credit or a paid licence.
- Longer cache lifetimes, as Lighthouse suggests: GitHub Pages fixes them at 10 minutes. The service worker already makes repeat visits free. Revisit with the club's own domain and host.
- Reusing repeated icons through an SVG sprite: measured at 1.5 KB saved after compression, not worth the extra code.
- Moving hosting from GitHub Pages (to Cloudflare Pages, for Brotli and HTTP/3): not now. With offline saving the host matters less. Revisit with the club's own domain.
