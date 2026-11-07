# Translating the site into Gitonga

The site has a Gitonga version at [/toh/](https://stijn.github.io/tofo-dive-club/toh/). Until every text is translated it shows Portuguese, and it stays out of the menu, search results and sitemap.

Gitonga needs a native speaker. No Gitonga dictionary or translation tool online is good enough to publish from, and a page full of mistakes would put off the very people it's for.

## For Isa

1. Find a Gitonga speaker in Tofo or Inhambane, ideally someone who writes it (teachers, church translators and radio presenters often do).
2. Send them the sheet: [gitonga.csv](https://stijn.github.io/tofo-dive-club/translations/gitonga.csv). It's always up to date with the site.
3. When they send it back, import it (below). Partial sheets are fine: each import shows what's done.

## For the translator

The sheet opens in Excel, Google Sheets or LibreOffice. Each row is one text on the site.

- Fill in the **Gitonga** column. Translate from whichever column you read best, Portuguese or English.
- Leave a cell empty if you're not sure. That text stays in Portuguese for now.
- Read the **Notes** column. Some texts have markers that must stay:
  - `[[g:buddy|buddy]]` links a word to the site's word list. Only translate the part after the `|`, for example `[[g:buddy|…]]`.
  - `*reefs*`: the stars mark the one highlighted word in a heading. Keep the stars around the matching word.
  - `{by}` is filled in with a name. Keep it as it is.
- Keep sentences short and plain. The site is written so that a 15-year-old can read it.
- Save it as CSV (UTF-8).

## Importing a sheet

```bash
npm run i18n:import -- path/to/gitonga.csv
npm run build
```

The import writes `src/i18n/toh.json`, says how many texts are done, and lists any rows where the markers don't match the English. Commit `toh.json` and push.

When every text is filled in, the Gitonga version goes live by itself:

- it appears in the footer's language list,
- its pages say `lang="toh"`,
- it gets `hreflang` links and a sitemap entry,
- search engines may index it.

## Still to do by hand when Gitonga goes live

- A Gitonga preview image for sharing (`public/og/og-toh.jpg`, then point `Base.astro` at it).
- Check the join form's preferred-language list in `src/data.ts`. It already offers Gitonga.
