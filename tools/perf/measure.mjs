// Load a page in headless Chrome on a throttled phone connection and report
// what it costs: bytes over the wire, requests, and when things appear.
// usage: node measure.mjs <url> [profile] [--scroll] [--repeat]
//   profile: slow3g (400 kbps, 400 ms), 3g (1.6 Mbps, 150 ms), none
//   --scroll  also scroll to the bottom, so lazy images load
//   --repeat  load a second time with a warm cache and report that too
//   --save    with the site's data saver mode switched on
//   --timeline  list every request with its start and end
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const url = args[0];
const profile = args.find((a) => ['slow3g', '3g', 'none'].includes(a)) ?? 'slow3g';
const doScroll = args.includes('--scroll');
const doRepeat = args.includes('--repeat');
const doTimeline = args.includes('--timeline');
const doSave = args.includes('--save'); // data saver mode on
const profiles = {
  slow3g: { latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 },
  '3g': { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
  none: { latency: 0, downloadThroughput: -1, uploadThroughput: -1 },
};

const port = 9700 + Math.floor(Math.random() * 200);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'perf-'))}`, '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) { await sleep(150); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const listeners = [];
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } else if (msg.method) listeners.forEach((l) => l(msg)); };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.result?.value;

const reqs = new Map();
listeners.push(({ method, params }) => {
  if (method === 'Network.requestWillBeSent' && !reqs.has(params.requestId)) reqs.set(params.requestId, { url: params.request.url, type: params.type, bytes: 0, start: params.timestamp, prio: params.request.initialPriority });
  if (method === 'Network.responseReceived' && reqs.has(params.requestId)) Object.assign(reqs.get(params.requestId), { type: params.type, fromCache: params.response.fromDiskCache || params.response.fromServiceWorker });
  if (method === 'Network.loadingFinished' && reqs.has(params.requestId)) Object.assign(reqs.get(params.requestId), { bytes: params.encodedDataLength, end: params.timestamp });
  if (method === 'Network.loadingFailed' && reqs.has(params.requestId)) Object.assign(reqs.get(params.requestId), { end: params.timestamp, failed: true });
});

await send('Page.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
await send('Network.emulateNetworkConditions', { offline: false, ...profiles[profile] });
if (doSave) await send('Page.addScriptToEvaluateOnNewDocument', { source: `try { localStorage.setItem('tdc-data', 'save') } catch (e) {}` });
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__perf = { fcp: 0, lcp: 0, lcpEl: '' };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') __perf.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
  new PerformanceObserver((l) => { const e = l.getEntries().at(-1); __perf.lcp = e.startTime; __perf.lcpEl = (e.element?.tagName || '') + ' ' + (e.url || '').slice(0, 60); }).observe({ type: 'largest-contentful-paint', buffered: true });
` });

/** Wait until nothing is downloading for a second (or 90 s pass). */
async function networkIdle() {
  let quiet = 0;
  for (let i = 0; i < 900 && quiet < 10; i++) {
    await sleep(100);
    const busy = [...reqs.values()].some((r) => !r.end && !r.url.startsWith('data:'));
    quiet = busy ? 0 : quiet + 1;
  }
}

async function run(label, viaWorker) {
  reqs.clear();
  // A service worker fetches on the page's behalf, out of this page's sight. On the
  // first visit, bypass it so every byte is counted; the repeat visit uses it.
  await send('Network.setBypassServiceWorker', { bypass: !viaWorker });
  const t0 = Date.now();
  await send('Page.navigate', { url });
  // wait for load
  for (let i = 0; i < 600; i++) { await sleep(100); if ((await evaluate('document.readyState')) === 'complete') break; }
  const loadMs = Date.now() - t0;
  await sleep(1000);
  await networkIdle();
  const p = await evaluate('JSON.stringify(window.__perf)');
  if (doTimeline) {
    const all = [...reqs.values()].filter((r) => r.end);
    const t0 = Math.min(...all.map((r) => r.start));
    for (const r of all.sort((a, b) => a.start - b.start)) console.log(`   ${(r.start - t0).toFixed(2).padStart(5)}s → ${(r.end - t0).toFixed(2).padStart(5)}s  ${String(r.prio).padEnd(8)} ${(r.bytes / 1024).toFixed(0).padStart(4)} KB  ${r.url.replace(/^https?:\/\/[^/]+/, '').slice(0, 80)}`);
  }
  const firstView = [...reqs.values()];
  let scrolled = [];
  if (doScroll) {
    const before = new Set(reqs.keys());
    const h = await evaluate('document.documentElement.scrollHeight');
    for (let y = 0; y < h; y += 700) { await evaluate(`window.scrollTo({top:${y},behavior:'instant'}); 1`); await sleep(350); }
    await sleep(1000);
    await networkIdle();
    scrolled = [...reqs.entries()].filter(([k]) => !before.has(k)).map(([, v]) => v);
  }
  const sum = (list) => list.reduce((a, r) => a + r.bytes, 0);
  const kb = (n) => (n / 1024).toFixed(0).padStart(5) + ' KB';
  const perf = JSON.parse(p);
  console.log(`\n=== ${label}: ${url} on ${profile}`);
  console.log(`first paint ${(perf.fcp / 1000).toFixed(1)} s · largest paint ${(perf.lcp / 1000).toFixed(1)} s (${perf.lcpEl.trim()}) · load ${(loadMs / 1000).toFixed(1)} s`);
  console.log(`first view: ${firstView.length} requests, ${kb(sum(firstView))} over the wire`);
  const byType = {};
  for (const r of firstView) { const k = r.url.startsWith('data:') ? 'data' : r.type; byType[k] = (byType[k] || 0) + r.bytes; }
  for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1])) console.log(`   ${kb(v)}  ${k}`);
  for (const r of firstView.sort((a, b) => b.bytes - a.bytes).slice(0, 12)) console.log(`      ${kb(r.bytes)}  ${r.url.replace(/^https?:\/\//, '').slice(0, 90)}`);
  if (doScroll) console.log(`after scrolling to the bottom: +${scrolled.length} requests, +${kb(sum(scrolled))} (total ${kb(sum(firstView) + sum(scrolled))})`);
}

await run('first visit', false);
if (doRepeat) await run('repeat visit', true);
ws.close(); chrome.kill();
