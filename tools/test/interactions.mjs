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
  const click = async (x, y) => { for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); };
  const key = (k, code = 27) => send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k, windowsVirtualKeyCode: code });
  const rect = (sel) => ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; })()`);
  const go = async (path) => { await send('Page.navigate', { url: base + path }); await sleep(2800); };
  const scrollTo = async (sel, off = 120) => { await ev(`window.scrollTo({top: document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect().top + scrollY - ${off}, behavior: 'instant'}); 1`); await sleep(800); };
  return { ev, send, move, click, key, rect, go, scrollTo, errors, close: () => { ws.close(); chrome.kill(); } };
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

  // Clicking plain text must never move the page (it used to jump to the top).
  await b.scrollTo('#seasons .lead', 300);
  let y0 = await b.ev('scrollY');
  r = await b.rect('#seasons .lead'); await b.click(r.x + r.w / 2, r.y + r.h / 2); await sleep(700);
  check('clicking text keeps your place', Math.abs((await b.ev('scrollY')) - y0) < 5, `${y0} → ${await b.ev('scrollY')}`);
  await b.ev(`window.scrollTo({ top: 0, behavior: 'instant' }); 1`); await sleep(400);
  r = await b.rect('.hero-actions a[href="#join"]'); await b.click(r.x + r.w / 2, r.y + r.h / 2); await sleep(2500);
  const joinTop = () => b.ev(`Math.round(document.getElementById('join').getBoundingClientRect().top)`);
  check('"Join" lands just under the header', Math.abs((await joinTop()) - 72) < 12, `${await joinTop()}px`);
  r = await b.rect('#join .lead'); await b.click(r.x + r.w / 2, r.y + r.h / 2); await sleep(700);
  check('and clicking there keeps your place', Math.abs((await joinTop()) - 72) < 12, `${await joinTop()}px`);
  check('depth chart has the diving-mask cursor', /svg\+xml.*image\/png/.test(await b.ev(`getComputedStyle(document.querySelector('.profile')).cursor`)));

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
  check('preferred language defaults to the page language', (await b.ev(`document.getElementById('f-language').value`)) === 'en');
  await b.ev(`(() => { const l = document.getElementById('f-language'); l.value = 'fr'; l.dispatchEvent(new Event('change', { bubbles: true })); document.querySelector('[data-join-form] button[value=whatsapp]').click(); return 1; })()`); await sleep(300);
  check('message includes the preferred language', await b.ev(`decodeURIComponent(window.__opened).includes('Preferred language: Français')`));
  await b.ev(`(() => { const l = document.getElementById('f-language'); l.value = 'other'; l.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()`); await sleep(200);
  check('"Another language" opens a text field', await b.ev(`!document.querySelector('[data-language-other]').hidden`));
  await b.ev(`document.getElementById('f-language-other').value = 'Kiswahili'; document.querySelector('[data-join-form] button[value=whatsapp]').click(); 1`); await sleep(300);
  check('and that language goes in the message', await b.ev(`decodeURIComponent(window.__opened).includes('Preferred language: Kiswahili')`));

  await b.ev(`document.body.focus(); for (const k of 'manta') document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); 1`); await sleep(200);
  check('typing "manta" releases mantas', (await b.ev(`document.querySelectorAll('.fx-manta').length`)) === 3);

  await b.ev(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); 1`); await sleep(1200);
  check('a whale swims past at the bottom', await b.ev(`document.querySelector('.whale-pass').classList.contains('is-swimming')`));

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
  check('save data button reachable in the menu', await b.ev(`getComputedStyle(document.querySelector('[data-data-btn]')).visibility === 'visible'`));
  await b.ev(`document.querySelector('[data-menu-btn]').click(); 1`); await sleep(300);
  check('no horizontal scroll', await b.ev(`document.documentElement.scrollWidth <= innerWidth`));
  check('no script errors', b.errors.length === 0, b.errors.join(' | '));
  b.close();
}

// Weak signal --------------------------------------------------------
{
  console.log(`\nWeak signal 375px`);
  const b = await browser(375, 812);
  await b.send('Network.enable');
  await b.go('/');
  const resources = (re) => b.ev(`performance.getEntriesByType('resource').map((e) => e.name).filter((n) => ${re}.test(n)).length`);
  check('photos come from this site, not Unsplash', (await resources('/images\\.unsplash\\.com/')) === 0 && (await b.ev(`[...document.querySelectorAll('[data-ph] img')].every((i) => !i.currentSrc || i.currentSrc.startsWith(location.origin))`)));
  check('every photo has a blurred preview built in', await b.ev(`[...document.querySelectorAll('[data-ph]')].every((p) => p.style.backgroundImage.startsWith('url("data:image/svg+xml'))`));
  check('the hero photo fades in once it has arrived', await b.ev(`document.querySelector('.hero-img img').classList.contains('is-loaded')`));
  check('the stylesheet is inside the page', await b.ev(`document.querySelectorAll('link[rel=stylesheet]').length === 0 && document.querySelectorAll('style').length > 0`));

  // Off-screen sections pause their loops.
  await b.ev(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); 1`); await sleep(700);
  check('off-screen animations pause', await b.ev(`document.querySelector('.hero').classList.contains('is-offscreen') && getComputedStyle(document.querySelector('.hero-img')).animationPlayState === 'paused'`));
  await b.ev(`window.scrollTo({ top: 0, behavior: 'instant' }); 1`); await sleep(700);
  check('and play again on the way back', await b.ev(`!document.querySelector('.hero').classList.contains('is-offscreen') && getComputedStyle(document.querySelector('.hero-img')).animationPlayState === 'running'`));

  // Data saver: switch on, reload, nothing heavy downloads.
  await b.ev(`document.querySelector('[data-data-btn]').click(); 1`); await sleep(200);
  check('save data switch turns on', await b.ev(`document.querySelector('[data-data-btn]').getAttribute('aria-pressed') === 'true' && localStorage.getItem('tdc-data') === 'save'`));
  await b.go('/');
  check('data saver: no fonts downloaded', (await resources('/\\.woff2/')) === 0, await b.ev(`getComputedStyle(document.body).fontFamily.slice(0, 30)`));
  check('data saver: no photos downloaded', (await resources('/\\.(avif|webp|jpe?g)/')) === 0);
  const showBtn = await b.ev(`(() => { const btn = document.querySelector('.club [data-ph] .ph-btn'); return btn && btn.textContent; })()`);
  check('data saver: photos offer "Show photo" with their size', /^Show photo: .+\. \d+ KB$/.test(showBtn ?? ''), showBtn);
  await b.scrollTo('.club-media', 100);
  await b.ev(`document.querySelector('.club [data-ph] .ph-btn').click(); 1`); await sleep(1500);
  check('tapping it loads that photo only', (await resources('/\\.(avif|webp|jpe?g)/')) === 1 && (await b.ev(`document.querySelector('.club [data-ph] img').classList.contains('is-loaded')`)));
  check('and focus moves to the photo', await b.ev(`document.activeElement === document.querySelector('.club [data-ph] img')`));
  await b.ev(`document.querySelector('[data-data-btn]').click(); 1`); await sleep(2000);
  check('switching it off loads the rest', (await b.ev(`document.querySelectorAll('.ph-btn').length`)) === 0 && (await resources('/\\.woff2/')) > 0);

  // A photo that fails keeps its preview, offers "Try again", and retries when the signal is back.
  await b.send('Network.setBlockedURLs', { urls: ['*.avif', '*.webp', '*.jpeg', '*.jpg'] });
  await b.go('/');
  await b.scrollTo('.club-media', 100); await sleep(500);
  check('a failed photo offers "Try again"', await b.ev(`document.querySelector('.club [data-ph]').classList.contains('is-failed') && /^Try again/.test(document.querySelector('.club [data-ph] .ph-btn')?.textContent ?? '')`));
  await b.send('Network.setBlockedURLs', { urls: [] });
  await b.ev(`window.dispatchEvent(new Event('online')); 1`); await sleep(1500);
  check('and retries when the signal comes back', await b.ev(`!document.querySelector('.club [data-ph]').classList.contains('is-failed') && document.querySelector('.club [data-ph] img').classList.contains('is-loaded')`));

  // Offline after one visit.
  await sleep(4500); // the worker registers once the page has gone quiet
  check('the site saves itself for offline', await b.ev(`navigator.serviceWorker.ready.then(() => caches.open('tdc-pages')).then((c) => c.keys()).then((k) => k.some((r) => r.url === location.origin + location.pathname))`));
  await b.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await b.go('/');
  check('with no signal the page still opens', await b.ev(`!!document.getElementById('hero-title') && performance.getEntriesByType('navigation')[0].workerStart > 0`));
  check('and says it is the saved copy', /No signal/.test(await b.ev(`document.querySelector('[data-offline]').textContent`)));
  await b.scrollTo('#join', 80);
  await b.ev(`window.open = (u) => { window.__opened = u; }; document.getElementById('f-name').value = 'Isa'; document.querySelector('[data-join-form] button[value=whatsapp]').click(); 1`); await sleep(400);
  check('the form says WhatsApp will send it later', await b.ev(`!document.querySelector('[data-done-offline]').hidden && !!window.__opened`));
  await b.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  check('no script errors', b.errors.length === 0, b.errors.join(' | '));
  b.close();
}

// Gitonga ------------------------------------------------------------
{
  console.log(`\nGitonga (being translated)`);
  const b = await browser(1280);
  await b.go('/toh/');
  check('Gitonga page exists, kept out of search for now', await b.ev(`document.querySelector('meta[name=robots]').content === 'noindex'`));
  check('its text is Portuguese until translated, and says so', (await b.ev(`document.documentElement.lang`)) === 'pt-MZ' && /\d+ de \d+/.test(await b.ev(`document.querySelector('.translation-note').textContent`)));
  check('footer lists it as the current language', await b.ev(`document.querySelector('.footer-langs [aria-current=page]')?.textContent === 'Gitonga'`));
  const csv = await b.ev(`fetch('${base}/translations/gitonga.csv').then((r) => r.text())`);
  const rows = csv.trim().split('\r\n');
  check('the translation sheet downloads', rows[0].includes('"Gitonga"') && rows.length > 300, `${rows.length - 1} texts`);
  const m = await b.ev(`fetch('${base}/manifest-toh.webmanifest').then((r) => r.json()).then((j) => j.start_url)`);
  check('it has its own app manifest', m === '/tofo-dive-club/toh/', m);
  await b.go('/');
  check('English page does not list Gitonga yet', await b.ev(`![...document.querySelectorAll('.footer-langs a')].some((a) => a.textContent === 'Gitonga') && !document.querySelector('link[hreflang=toh]')`));
  check('no script errors', b.errors.length === 0, b.errors.join(' | '));
  b.close();
}

console.log(failed ? `\n${failed} failed` : '\nAll passed');
process.exit(failed ? 1 : 0);
