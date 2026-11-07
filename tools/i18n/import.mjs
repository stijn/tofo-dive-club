// Bring a filled-in translation sheet back into the site.
// usage: npm run i18n:import -- <sheet.csv>
// Reads the "key" and "Gitonga" columns and writes src/i18n/toh.json. Empty cells
// are left out (that text stays in Portuguese). Checks that the markup survived.
// Then: npm run build. At 100% the Gitonga version goes live by itself.
import { readFileSync, writeFileSync } from 'node:fs';
import en from '../../src/i18n/en.ts';
import { translatable } from '../../src/i18n/flat.ts';

const file = process.argv[2];
if (!file) {
  console.error('usage: npm run i18n:import -- <sheet.csv>');
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  // Spreadsheets set to Portuguese or Dutch save with ; instead of , — go by the header row.
  const header = text.slice(0, text.search(/\r?\n|$/));
  const sep = (header.match(/;/g) ?? []).length > (header.match(/,/g) ?? []).length ? ';' : ',';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

const rows = parseCsv(readFileSync(file, 'utf8'));
const head = rows[0].map((h) => h.trim().toLowerCase());
const keyCol = head.indexOf('key');
const tohCol = head.findIndex((h) => h === 'gitonga' || h === 'toh');
if (keyCol < 0 || tohCol < 0) {
  console.error('The sheet needs a "key" column and a "Gitonga" column.');
  process.exit(1);
}

const english = new Map(translatable(en));
const markup = (s) => [...s.matchAll(/\[\[[ga]:[\w-]+\||\*|\{\w+\}/g)].map((m) => m[0]).sort().join(' ');
const out = {};
const problems = [];
for (const r of rows.slice(1)) {
  const key = (r[keyCol] ?? '').trim();
  const text = (r[tohCol] ?? '').trim();
  if (!key || !text) continue;
  if (!english.has(key)) { problems.push(`${key}: not a text on the site (left out)`); continue; }
  if (markup(english.get(key)) !== markup(text)) problems.push(`${key}: the [[…|…]], *stars* or {by} don't match the English`);
  out[key] = text;
}

const sorted = Object.fromEntries([...english.keys()].filter((k) => k in out).map((k) => [k, out[k]]));
writeFileSync(new URL('../../src/i18n/toh.json', import.meta.url), JSON.stringify(sorted, null, 2) + '\n');
console.log(`Gitonga: ${Object.keys(sorted).length} of ${english.size} texts translated.`);
if (problems.length) {
  console.log(`\nCheck these ${problems.length}:`);
  problems.forEach((p) => console.log('  ' + p));
}
