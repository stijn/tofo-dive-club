// Tofo Dive Club service worker: the site keeps working on patchy mobile data.
// - Pages: shown from the copy on the phone straight away, then refreshed in the
//   background (stale-while-revalidate). With no signal at all, the saved copy is it.
// - Files in _astro/ (scripts, fonts, photos) have the content hash in their name,
//   so a saved copy is always right: phone first, network only when missing.
// - Nothing is downloaded just to fill the cache. After the first visit the page sends
//   the list of files it already loaded, and they're copied from the browser's cache.
// - When a page changes (a new deploy), files no saved page uses any more are removed.
// Bump this when the logic below changes, so browsers pick up the new worker.
const VERSION = 1;
const PAGES = 'tdc-pages';
const ASSETS = 'tdc-assets';
const BASE = new URL('./', self.location).pathname; // e.g. /tofo-dive-club/
const FILE = /[\w.-]+\.(?:js|css|woff2|avif|webp|jpe?g|png|svg)\b/g;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== PAGES && key !== ASSETS) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

/** One cache entry per page: no query string or #hash, and index.html is the folder. */
const pageKey = (href) => {
  const url = new URL(href);
  return url.origin + url.pathname.replace(/index\.html$/, '');
};
const isAsset = (url) => url.pathname.startsWith(BASE + '_astro/');

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (req.mode === 'navigate') event.respondWith(page(event));
  else if (isAsset(url)) event.respondWith(asset(req));
});

async function page(event) {
  const req = event.request;
  const key = pageKey(req.url);
  const cache = await caches.open(PAGES);
  const cached = await cache.match(key);
  const before = cached ? cached.clone().text() : Promise.resolve(null);

  const fresh = fetch(req).then(async (res) => {
    if (res.ok && (res.headers.get('content-type') || '').includes('text/html')) {
      const [old, now] = await Promise.all([before, res.clone().text()]);
      await cache.put(key, res.clone());
      if (old !== null && old !== now) await prune();
    }
    return res;
  });

  if (cached) {
    event.waitUntil(fresh.catch(() => {}));
    return cached;
  }
  try {
    return await fresh;
  } catch {
    return (await fallback(cache, key)) || offlinePage();
  }
}

/** No copy of this page: the same language's home page, else any saved page. */
async function fallback(cache, key) {
  const path = new URL(key).pathname.slice(BASE.length);
  const lang = path.split('/')[0];
  const origin = self.location.origin;
  const tries = [lang && origin + BASE + lang + '/', origin + BASE].filter(Boolean);
  for (const t of tries) {
    const hit = await cache.match(t);
    if (hit) return hit;
  }
  const any = (await cache.keys())[0];
  return any ? cache.match(any) : null;
}

function offlinePage() {
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>No signal · Tofo Dive Club</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#04192a;color:#fff;font:1.1rem/1.5 system-ui,sans-serif;text-align:center;padding:2rem">
<main><h1 style="font-family:Georgia,serif">No signal</h1><p>This page isn’t saved on this phone yet. Try again when you have signal.</p>
<h1 lang="pt-MZ" style="font-family:Georgia,serif;margin-top:2rem">Sem rede</h1><p lang="pt-MZ">Esta página ainda não está guardada neste telemóvel. Tente de novo quando tiver rede.</p></main></body></html>`;
  return new Response(html, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

async function asset(req) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok && res.type === 'basic') {
    const copy = res.clone();
    cache.put(req.url, copy).catch(() => {});
  }
  return res;
}

/** Keep only files that a saved page uses, directly or through its scripts. */
async function prune() {
  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  const byName = new Map();
  for (const req of await assets.keys()) byName.set(req.url.split('/').pop(), req);
  const keep = new Set();
  const queue = [];
  const scan = (text) => {
    for (const [name] of text.matchAll(FILE)) if (!keep.has(name)) { keep.add(name); queue.push(name); }
  };
  for (const req of await pages.keys()) scan(await (await pages.match(req)).text());
  while (queue.length) {
    const name = queue.pop();
    if (name.endsWith('.js') && byName.has(name)) scan(await (await assets.match(byName.get(name))).text());
  }
  for (const [name, req] of byName) if (!keep.has(name)) await assets.delete(req);
}

// The page lists what it loaded before this worker was in charge; copy those from
// the browser's own cache (force-cache: no new download, even if a little stale).
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'cache' || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      const assets = await caches.open(ASSETS);
      for (const href of data.urls) {
        try {
          const url = new URL(href, self.location.href);
          if (url.origin !== self.location.origin) continue;
          if (isAsset(url)) {
            if (await assets.match(url.href)) continue;
            const res = await fetch(url.href, { cache: 'force-cache' });
            if (res.ok) await assets.put(url.href, res);
          } else if (href === data.page) {
            const key = pageKey(href);
            if (await pages.match(key)) continue;
            const res = await fetch(key, { cache: 'force-cache' });
            if (res.ok) await pages.put(key, res);
          }
        } catch {
          /* patchy signal: the next visit tries again */
        }
      }
    })(),
  );
});
