// Makes the link preview images (public/og/og-en.jpg, og-pt.jpg) that WhatsApp,
// Facebook and others show when someone shares the site. Needs Google Chrome.
// usage: node tools/og/make.mjs   (change the words in `copy` below)
// The headings use the same font as the site on iPhone and Mac (New York), so
// run it on a Mac.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { whaleShark } from '../../src/lib/whale-shark.ts';

const copy = {
  en: { place: 'Praia do Tofo · Inhambane · Mozambique', name: 'Tofo Dive Club', sub: 'Community diving on the', em: 'coast of giants', line: 'Whale sharks · Mantas · Reef dives', langs: 'English · Português', size: 96 },
  pt: { place: 'Praia do Tofo · Inhambane · Moçambique', name: 'Clube de Mergulho do Tofo', sub: 'Mergulho em comunidade na', em: 'costa dos gigantes', line: 'Tubarões-baleia · Mantas · Recifes', langs: 'Português · English', size: 76 },
};

const mark = '<svg class="mark" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30.5" fill="#0a3d57"/><circle cx="32" cy="32" r="29" fill="none" stroke="#ff8a6e" stroke-width="3.5"/><path fill="#f5efe4" d="M32 17.5c-6 0-12 5-27.5 11.8 13.2 2 20.8 6.6 24.3 12.4 1 1.8 2.1 4.3 3.2 7.3 1.1-3 2.2-5.5 3.2-7.3 3.5-5.8 11.1-10.4 24.3-12.4C44 22.5 38 17.5 32 17.5Z"/><path d="M32 47v10" stroke="#f5efe4" stroke-width="2.6" stroke-linecap="round"/><path d="M28.2 19.2c-2.6-1.9-3.1-4.6-1.4-6.6M35.8 19.2c2.6-1.9 3.1-4.6 1.4-6.6" fill="none" stroke="#f5efe4" stroke-width="3" stroke-linecap="round"/></svg>';

// Bubbles in fixed places, so the image only changes when the words do.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const bubbles = Array.from({ length: 24 }, () => {
  const r = [3, 4, 5, 6, 8, 10, 13][Math.floor(rnd() * 7)];
  return `<circle cx="${Math.round(640 + rnd() * 540)}" cy="${Math.round(20 + rnd() * 580)}" r="${r}" fill="none" stroke="rgba(220,245,250,${[0.18, 0.25, 0.35][Math.floor(rnd() * 3)]})" stroke-width="1.5"/>`;
}).join('');

const page = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{position:relative;background:linear-gradient(170deg,#0e5a74 0%,#0a3d57 45%,#04192a 100%);color:#f5efe4;font-family:system-ui,-apple-system,sans-serif}
svg.bg{position:absolute;inset:0}
.shark{position:absolute;left:560px;top:330px;width:760px;color:#04192a;opacity:.5;transform:rotate(-6deg)}
.shark svg{display:block;width:100%;height:auto;overflow:visible}
.shark .spots,.shark .stripes,.shark .ridges{fill:none;stroke:none}
.shark .spots{fill:#bfe8e3;opacity:.35}
.shark .belly,.shark .gills,.shark .mouth,.shark .pilot{display:none}
.mark{position:absolute;left:84px;top:84px;width:132px;height:132px}
.txt{position:absolute;left:84px;right:84px;top:250px}
.place{font-weight:700;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:#bfe8e3}
h1{margin:18px 0 12px;font-family:ui-serif,Georgia,serif;font-weight:600;font-size:${c.size}px;line-height:1;letter-spacing:-.02em}
p.sub{margin:0;font-family:ui-serif,Georgia,serif;font-size:44px;font-weight:500}
em{color:#ffd27a}
.foot{position:absolute;left:84px;right:84px;bottom:56px;display:flex;justify-content:space-between;font-weight:700;font-size:24px;color:#d3e3e8}
.pill{padding:8px 18px;border:2px solid #ff8a6e;border-radius:999px;color:#ffa58f}
</style></head><body>
<svg class="bg" viewBox="0 0 1200 630"><path d="M0 120c160 30 300 40 450 22s300-60 450-44 230 52 300 48V0H0Z" fill="rgba(255,255,255,.05)"/>${bubbles}</svg>
<div class="shark">${whaleShark}</div>
${mark}
<div class="txt"><div class="place">${c.place}</div><h1>${c.name}</h1><p class="sub">${c.sub} <em>${c.em}</em></p></div>
<div class="foot"><span>${c.line}</span><span class="pill">${c.langs}</span></div>
</body></html>`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dir = mkdtempSync(join(tmpdir(), 'og-'));
const port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, 'about:blank'], { stdio: 'ignore' });
let target;
for (let i = 0; i < 60 && !target; i++) {
  await sleep(150);
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); pending.get(msg.id)?.(msg); pending.delete(msg.id); };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
for (const [lang, c] of Object.entries(copy)) {
  const file = join(dir, `og-${lang}.html`);
  writeFileSync(file, page(c));
  await send('Page.navigate', { url: `file://${file}` });
  await sleep(800);
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
  writeFileSync(new URL(`../../public/og/og-${lang}.jpg`, import.meta.url), Buffer.from(shot.result.data, 'base64'));
  console.log(`public/og/og-${lang}.jpg`);
}
ws.close();
chrome.kill();
