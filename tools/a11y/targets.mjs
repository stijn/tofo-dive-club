// List interactive targets smaller than 44×44 that aren't inline links in running text.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [width, ...urls] = process.argv.slice(2);
const W = +width;
const port = 9600 + Math.floor(Math.random() * 90);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'tg-'))}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target; for (let i = 0; i < 50 && !target; i++) { await sleep(150); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 768 });
for (const url of urls) {
  await send('Page.navigate', { url }); await sleep(2500);
  const res = await send('Runtime.evaluate', { returnByValue: true, expression: `(() => {
    const out = [];
    const inText = (el) => { const p = el.parentElement; if (!p) return false; const own = [...p.childNodes].filter(n => n !== el).map(n => n.textContent).join('').trim(); return own.length > 2 && ['P','DD','LI','SPAN','STRONG','ADDRESS'].includes(p.tagName); };
    document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary').forEach(el => {
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (el.closest('[hidden]')) return;
      let r = el.getBoundingClientRect();
      if (el.type === 'radio' || el.type === 'checkbox') r = el.closest('label').querySelector('span').getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (el.classList.contains('skip') || el.classList.contains('term') || inText(el)) return;
      if (r.width < 44 || r.height < 44) out.push(el.tagName.toLowerCase() + '.' + (el.className||'').toString().split(' ')[0] + ' "' + (el.textContent||el.name||'').trim().slice(0,30) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height));
    });
    return out;
  })()` });
  console.log(`\n=== ${url} @${W}: ${res.result.result.value.length} small targets`); res.result.result.value.forEach((x) => console.log('  ' + x));
}
ws.close(); chrome.kill();
