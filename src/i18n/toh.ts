// Gitonga (Tonga of Inhambane, ISO 639-3 "toh").
// The text comes from a Gitonga speaker, through the translation sheet at
// /translations/gitonga.csv (see translations/README.md). Their answers live in
// toh.json. Anything not translated yet shows in Portuguese, which most Gitonga
// readers also read. The Gitonga version goes live (menu, search, sitemap) once
// every text is translated: see `ready` in progress.ts.
import pt from './pt';
import done from './toh.json';
import { setPath } from './flat';
import type { Dict } from './en';

const toh = structuredClone(pt) as Dict;
for (const [path, text] of Object.entries(done as Record<string, string>)) {
  if (text.trim()) setPath(toh as unknown as Record<string, unknown>, path, text);
}

export default toh;
