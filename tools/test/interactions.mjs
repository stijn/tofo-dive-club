// Browser checks for the interactive bits. Needs Google Chrome and a running
// `npm run preview`. usage: node tools/test/interactions.mjs [base-url]
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.argv[2] ?? 'http://localhost:4321/tofo-dive-club';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const check = (name, ok, info = '') => { if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${name}${info ? '  ' + info : ''}`); };

async function browser(width, height = 860) {
  const port = 9300 + Math.floor(Math.random() * 600);
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'ui-'))}`, 'about:blank'], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 60 && !target; i++) { await sleep(150); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map(); const errors = [];
  ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } else if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description); };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  const ev = async (e) => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result.result?.value;
  const move = (x, y) => send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  const key = (k, code = 27) => send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k, windowsVirtualKeyCode: code });
  const rect = (sel) => ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; })()`);
  const go = async (path) => { await send('Page.navigate', { url: base + path }); await sleep(2800); };
  const scrollTo = async (sel, off = 120) => { await ev(`window.scrollTo({top: document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect().top + scrollY - ${off}, behavior: 'instant'}); 1`); await sleep(800); };
  return { ev, move, key, rect, go, scrollTo, errors, close: () => { ws.close(); chrome.kill(); } };
}

// Desktop --------------------------------------------------------------
{
  console.log(`\nDesktop 1280px`);
  const b = await browser(1280);
  await b.go('/');
  check('animations on by default', await b.ev(`document.documentElement.classList.contains('js-motion')`));

  let r = await b.rect('[data-motion-btn]'); await b.move(r.x + r.w / 2, r.y + r.h / 2); await sleep(600);
  check('pause button has a tooltip', (await b.ev(`document.getElementById('tip').textContent`)) === 'Pause animations');
  await b.key('Escape'); await sleep(250);
  check('Escape dismisses the tooltip', await b.ev(`document.getElementById('tip').hidden`));
  await b.ev(`document.querySelector('[data-motion-btn]').click(); 1`); await sleep(200);
  check('pause button pauses everything', await b.ev(`document.documentElement.classList.contains('motion-off') && document.querySelector('[data-motion-btn]').dataset.tip === 'Play animations'`));
  await b.ev(`document.querySelector('[data-motion-btn]').click(); 1`); await sleep(200);
  await b.move(5, 600);

  await b.scrollTo('#sites', 60);
  check('nav marks the section in view', await b.ev(`document.querySelector('[data-spy="sites"]').getAttribute('aria-current') === 'true'`));
  r = await b.rect('.site-list .site-track'); await b.move(r.x + 500, r.y + r.h * 0.7); await sleep(300); await b.move(r.x + 520, r.y + r.h * 0.72); await sleep(300);
  check('depth probe follows the cursor', await b.ev(`document.querySelector('.profile').classList.contains('is-probing')`), await b.ev(`document.querySelector('[data-probe-label]').textContent`));
  check('sites at that depth light up', (await b.ev(`document.querySelectorAll('.site.is-hit').length`)) > 0);
  await b.move(5, 5); await sleep(300);

  await b.scrollTo('#sites .note', 300);
  r = await b.rect('#sites .note a.term'); await b.move(r.x + 10, r.y + r.h / 2); await sleep(800);
  check('dive words show their meaning', !!(await b.ev(`document.querySelector('#tip strong')?.textContent`)));
  await b.move(5, 5); await sleep(300);

  await b.scrollTo('[data-season-wrap]', 140);
  for (const row of ['sharks', 'mantas', 'whales', 'temp']) {
    r = await b.rect(`tr[data-row="${row}"] td[data-month="10"]`);
    await b.move(r.x + r.w / 2 - 3, r.y + r.h / 2); await sleep(120); await b.move(r.x + r.w / 2, r.y + r.h / 2); await sleep(1900);
    check(`a long hover on ${row} brings an animal`, await b.ev(`!!document.querySelector('.cell-${row}')`));
    await b.move(5, 5); await sleep(200);
  }

  await b.ev(`document.querySelector('[data-join-form] button[value=whatsapp]').click(); 1`); await sleep(300);
  check('empty name shows an error', await b.ev(`!document.getElementById('f-name-error').hidden && document.activeElement.id === 'f-name'`));
  await b.ev(`window.open = (u) => { window.__opened = u; }; document.getElementById('f-name').value = 'Isa'; document.querySelector('[data-join-form] button[value=whatsapp]').click(); 1`); await sleep(400);
  check('form opens WhatsApp with the message', await b.ev(`decodeURIComponent(window.__opened || '').includes('Isa')`));

  await b.ev(`document.body.focus(); for (const k of 'manta') document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); 1`); await sleep(200);
  check('typing "manta" releases mantas', (await b.ev(`document.querySelectorAll('.fx-manta').length`)) === 3);

  // Ascent: record scrollY every frame and check it only ever moves up, without jumps.
  await b.ev(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); 1`); await sleep(500);
  await b.ev(`window.scrollBy({ top: -40, behavior: 'instant' }); 1`); await sleep(400);
  check('buoy shows when scrolling up', await b.ev(`document.querySelector('.smb-float').classList.contains('is-visible')`));
  const trace = await b.ev(`new Promise((resolve) => {
    const ys = []; const t0 = performance.now();
    const rec = () => { ys.push(scrollY); if (scrollY === 0 && performance.now() - t0 > 600 && !document.documentElement.dataset.ascending) resolve(ys); else if (performance.now() - t0 < 8000) requestAnimationFrame(rec); else resolve(ys); };
    document.querySelector('.smb-float').click(); requestAnimationFrame(rec);
  })`);
  const steps = trace.slice(1).map((y, i) => trace[i] - y);
  const backwards = steps.filter((d) => d < -1).length;
  const biggest = Math.max(...steps);
  const distance = trace[0];
  check('ascent only moves up', backwards === 0, `${trace.length} frames`);
  check('ascent has no jumps', biggest < distance * 0.06, `largest step ${Math.round(biggest)}px of ${Math.round(distance)}px`);
  check('ascent ends at the top with focus on the heading', (await b.ev('scrollY')) === 0 && (await b.ev('document.activeElement.id')) === 'hero-title');
  check('no script errors', b.errors.length === 0, b.errors.join(' | '));
  b.close();
}

// Phone ----------------------------------------------------------------
{
  console.log(`\nPhone 375px`);
  const b = await browser(375, 812);
  await b.go('/pt/');
  await b.ev(`document.querySelector('[data-menu-btn]').click(); 1`); await sleep(300);
  check('menu opens', await b.ev(`document.querySelector('[data-menu-btn]').getAttribute('aria-expanded') === 'true'`));
  check('menu button tooltip updates', (await b.ev(`document.querySelector('[data-menu-btn]').dataset.tip`)) === 'Fechar menu');
  check('pause button reachable in the menu', await b.ev(`getComputedStyle(document.querySelector('[data-motion-btn]')).visibility === 'visible'`));
  await b.ev(`document.querySelector('[data-menu-btn]').click(); 1`); await sleep(300);
  check('no horizontal scroll', await b.ev(`document.documentElement.scrollWidth <= innerWidth`));
  check('no script errors', b.errors.length === 0, b.errors.join(' | '));
  b.close();
}

console.log(failed ? `\n${failed} failed` : '\nAll passed');
process.exit(failed ? 1 : 0);
