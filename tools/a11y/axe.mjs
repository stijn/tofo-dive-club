// Run axe-core (all WCAG A/AA/AAA rules) against pages in headless Chrome.
// usage: node axe.mjs <axe.min.js path> <width> <url> [url...]
import { spawn } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [axePath, width, ...urls] = process.argv.slice(2);
const W = Number(width), H = 900;
const axeSrc = readFileSync(axePath, 'utf8');
const port = 9500 + Math.floor(Math.random() * 200);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'axe-'))}`, '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });
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
let total = 0;
for (const url of urls) {
  await send('Page.navigate', { url });
  await sleep(2500);
  // Audit the settled page: animations paused, everything revealed, lazy images loaded.
  await evaluate(`localStorage.setItem('tdc-motion','off'); 1`);
  await send('Page.reload');
  await sleep(3000);
  await evaluate(`document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager'); 1`);
  await sleep(1500);
  await evaluate(axeSrc + '; 1');
  const res = await evaluate(`(async () => {
    const r = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag2aaa','wcag21a','wcag21aa','wcag22aa','best-practice'] },
      rules: { 'color-contrast-enhanced': { enabled: true }, 'identical-links-same-purpose': { enabled: true }, 'target-size': { enabled: true }, 'meta-refresh-no-exceptions': { enabled: true } },
      resultTypes: ['violations', 'incomplete'],
    });
    const pick = (v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, nodes: v.nodes.slice(0, 6).map(n => (n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\\n').slice(1, 2).join(' ')).slice(0, 260)) });
    return JSON.stringify({ violations: r.violations.map(pick), incomplete: r.incomplete.map(pick) });
  })()`);
  const { violations, incomplete } = JSON.parse(res);
  total += violations.length;
  console.log(`\n=== ${url} @${W}px — ${violations.length} violations, ${incomplete.length} need review`);
  for (const v of violations) { console.log(`✗ ${v.id} (${v.impact}, ${v.n}) ${v.help}`); v.nodes.forEach((n) => console.log('    ' + n)); }
  for (const v of incomplete) console.log(`? ${v.id} (${v.n}) ${v.help} :: ${v.nodes[0] ?? ''}`.slice(0, 300));
}
ws.close(); chrome.kill();
process.exit(total ? 1 : 0);
