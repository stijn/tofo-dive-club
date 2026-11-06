// Tiny markup for copy strings, so jargon and abbreviations stay accessible
// (WCAG 3.1.3 Unusual Words, 3.1.4 Abbreviations):
//   [[g:buddy|buddies]]  → link to the glossary entry #g-buddy
//   [[a:c|°C]]           → <abbr title="degrees Celsius">°C</abbr>
import type { Lang } from '../config';
import { t } from '../i18n';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function rich(text: string, lang: Lang): string {
  const d = t(lang);
  const abbr = Object.fromEntries(d.glossary.abbreviations.map((a) => [a.id, a.title]));
  return esc(text).replace(/\[\[(g|a):([\w-]+)\|([^\]]+)\]\]/g, (_, kind: string, id: string, label: string) => {
    if (kind === 'a') {
      const title = abbr[id];
      if (!title) throw new Error(`Unknown abbreviation "${id}" in ${lang} copy`);
      return `<abbr title="${esc(title)}">${label}</abbr>`;
    }
    if (!d.glossary.terms.some((term) => term.id === id)) throw new Error(`Unknown glossary term "${id}" in ${lang} copy`);
    return `<a class="term" href="#g-${id}">${label}<span class="visually-hidden"> (${esc(d.glossary.linkHint)})</span></a>`;
  });
}

/** Strip the markup, for meta tags and structured data. */
export function plain(text: string): string {
  return text.replace(/\[\[(?:g|a):[\w-]+\|([^\]]+)\]\]/g, '$1');
}
