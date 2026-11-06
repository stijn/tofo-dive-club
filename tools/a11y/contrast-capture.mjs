// Collect every visible text run (rect, colour, size, weight), then screenshot the
// page with all text made transparent, so a checker can read the real pixels behind it.
// usage: node textbg.mjs <url> <width> <out-prefix>
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, width, out] = process.argv.slice(2);
const W = Number(width), H = 900;
const port = 9700 + Math.floor(Math.random() * 90);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'tb-'))}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(150); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.result.value;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 768 });
await send('Page.navigate', { url });
await sleep(1500);
await evaluate(`localStorage.setItem('tdc-motion','off'); 1`);
await send('Page.reload');
await sleep(3000);
await evaluate(`document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager'); window.scrollTo(0,0); 1`);
await sleep(2500);

const runs = await evaluate(`(() => {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || el.closest('[aria-hidden="true"], .visually-hidden, script, style, noscript, .smb-float, .toast, .safety-stop, .gauge')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 2 || r.height < 2) continue;
      out.push({ t: n.textContent.trim().slice(0, 40), x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height, color: cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight, sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '') });
    }
  }
  return JSON.stringify(out);
})()`);
writeFileSync(out + '.json', runs);

// Hide text (and anything drawn in currentColor), keep backgrounds.
await evaluate(`(() => { const s = document.createElement('style'); s.textContent = '*{color:transparent !important;text-shadow:none !important;text-decoration-color:transparent !important;-webkit-text-fill-color:transparent !important;caret-color:transparent !important} ::placeholder{color:transparent !important} .gauge,.smb-float,.fx-layer{display:none !important}'; document.head.appendChild(s); return 1; })()`);
await sleep(600);
const { result } = await send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true });
const total = result.result.value, SLICE = 6000;
const slices = [];
for (let y = 0; y < total; y += SLICE) {
  const h = Math.min(SLICE, total - y);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: W, height: h, scale: 1 } });
  writeFileSync(`${out}-s${slices.length}.png`, Buffer.from(shot.result.data, 'base64'));
  slices.push({ y, h });
}
writeFileSync(out + '-slices.json', JSON.stringify({ W, total, slices }));
ws.close(); chrome.kill();
console.log('ok', JSON.parse(runs).length, 'runs');
