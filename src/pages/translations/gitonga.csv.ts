// The translation sheet for Gitonga, built from the live copy so it's never out of date.
// Opens in Excel, Google Sheets or LibreOffice. Columns: key, English, Portuguese,
// Gitonga (empty until translated), notes. Bring it back with `npm run i18n:import`.
import type { APIRoute } from 'astro';
import en from '../../i18n/en';
import pt from '../../i18n/pt';
import done from '../../i18n/toh.json';
import { translatable, flatten } from '../../i18n/flat';

const cell = (s: string) => `"${s.replace(/"/g, '""')}"`;

function note(english: string, portuguese: string) {
  const n: string[] = [];
  if (english.includes('[[g:')) n.push('Keep [[g:…|…]]: only translate the words after the | sign. It links to the word list.');
  if (english.includes('[[a:')) n.push('Keep [[a:…|…]]: an abbreviation. Change the part after | only if Gitonga uses another one.');
  if (/\*[^*]+\*/.test(english)) n.push('Keep the *stars* around the one word that is highlighted.');
  if (/\{\w+\}/.test(english)) n.push('Keep {by} as it is: a name goes there.');
  if (english === portuguese) n.push('A name, number or code: it often stays the same.');
  return n.join(' ');
}

export const GET: APIRoute = () => {
  const ptText = new Map(flatten(pt));
  const toh = done as Record<string, string>;
  const rows = [['key', 'English', 'Português', 'Gitonga', 'Notes']];
  for (const [key, english] of translatable(en)) {
    const portuguese = ptText.get(key) ?? '';
    rows.push([key, english, portuguese, toh[key] ?? '', note(english, portuguese)]);
  }
  // A BOM so Excel reads the accents (ç, ã, ’) correctly.
  const csv = '\uFEFF' + rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
