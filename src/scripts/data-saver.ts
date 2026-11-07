// Data saver mode and photo fallbacks, for slow or patchy mobile data.
// It decides by itself, and the button overrides it for the rest of the visit:
// - The head script in Base.astro switches it on before anything loads when the phone
//   asks to save data (its data saver), on a 2G connection, or when the last visit in
//   the past hour measured a slow connection.
// - Once the page has arrived, this script measures how fast it came and switches the
//   mode to match: off on wifi or good mobile data, on below about 500 kbit/s. That works
//   in every browser, unlike the connection hints, which only Chrome on Android has.
// - The button's choice lasts for this visit (the browser tab). Next time the site
//   measures again, so a choice made on mobile data doesn't stick on home wifi.
// In this mode CSS hides photos that haven't loaded, so they're never downloaded, and
// each one gets a "Show photo · 42 KB" button. A photo that fails keeps its blurred
// preview and gets a "Try again" button, and every failed photo retries by itself when
// the connection comes back.
import { setTip } from './tooltips';

const CHOICE = 'tdc-data'; // sessionStorage: 'save' or 'full', set by the button
const SPEED = 'tdc-net'; // localStorage: { slow, t } from the last measurement
const SLOW_KBPS = 500;
const root = document.documentElement;
const btn = document.querySelector<HTMLButtonElement>('[data-data-btn]');
const text = {
  show: btn?.dataset.show ?? 'Show photo',
  failed: btn?.dataset.failed ?? 'The photo didn’t load.',
  retry: btn?.dataset.retry ?? 'Try again',
};
let auto = false; // switched on by the site rather than the button

const store = (area: 'local' | 'session', key: string, value: string) => {
  try {
    (area === 'local' ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    /* private mode: nothing is remembered */
  }
};
const chosen = () => {
  try {
    return sessionStorage.getItem(CHOICE);
  } catch {
    return null;
  }
};

export const saving = () => root.classList.contains('save-data');

const photos = () => [...document.querySelectorAll<HTMLElement>('[data-ph]')];
const imgOf = (ph: HTMLElement) => ph.querySelector('img')!;
/** What this phone would download for this photo, from data-kb="400:12 700:30". */
function kbFor(ph: HTMLElement) {
  const sizes = (ph.dataset.kb ?? '').split(' ').map((p) => p.split(':').map(Number));
  const need = ph.getBoundingClientRect().width * (window.devicePixelRatio || 1);
  return (sizes.find(([w]) => w >= need) ?? sizes[sizes.length - 1])?.[1] ?? 0;
}
const loaded = (img: HTMLImageElement) => img.classList.contains('is-loaded') || (img.complete && img.naturalWidth > 0);

function button(ph: HTMLElement, kind: 'show' | 'retry') {
  ph.querySelector('.ph-btn')?.remove();
  if (ph.hasAttribute('data-no-button')) return;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'ph-btn';
  b.dataset.kind = kind;
  const alt = imgOf(ph).alt;
  // Visible text first, so the accessible name starts with what's on screen (2.5.3).
  b.innerHTML =
    kind === 'show'
      ? `<span>${text.show}</span> <small>${kbFor(ph)} KB</small>`
      : `<span>${text.retry}</span> <small>${text.failed}</small>`;
  const hidden = document.createElement('span');
  hidden.className = 'visually-hidden';
  hidden.textContent = `: ${alt}.`;
  b.firstElementChild!.append(hidden);
  b.addEventListener('click', () => (kind === 'show' ? reveal(ph) : retry(ph)));
  ph.append(b);
}

/** Show one photo in data saver mode, and keep focus on it (the button goes away). */
function reveal(ph: HTMLElement) {
  ph.classList.add('is-shown');
  ph.querySelector('.ph-btn')?.remove();
  const img = imgOf(ph);
  img.tabIndex = -1;
  img.focus({ preventScroll: true });
}

/** Ask for a failed photo again. Setting src again makes the browser re-pick from <picture>. */
function retry(ph: HTMLElement) {
  const hadFocus = ph.contains(document.activeElement);
  ph.classList.remove('is-failed');
  ph.querySelector('.ph-btn')?.remove();
  const img = imgOf(ph);
  img.setAttribute('src', img.getAttribute('src')!);
  if (hadFocus) {
    img.tabIndex = -1;
    img.focus({ preventScroll: true });
  }
}

function sync() {
  for (const ph of photos()) {
    const img = imgOf(ph);
    const kind = ph.querySelector<HTMLElement>('.ph-btn')?.dataset.kind;
    if (ph.classList.contains('is-failed')) {
      if (kind !== 'retry') button(ph, 'retry');
    } else if (saving() && !ph.classList.contains('is-shown') && !loaded(img)) {
      if (kind !== 'show') button(ph, 'show');
    } else if (kind) {
      ph.querySelector('.ph-btn')!.remove();
    }
  }
  if (btn) {
    btn.setAttribute('aria-pressed', String(saving()));
    // While saving, the tooltip also says how much: the photos still waiting for a tap.
    const kb = photos().filter((ph) => ph.querySelector('.ph-btn[data-kind="show"]')).reduce((sum, ph) => sum + kbFor(ph), 0);
    const tip = saving() ? (auto ? btn.dataset.tipAuto : btn.dataset.tipOn)! : btn.dataset.tipOff!;
    setTip(btn, saving() && kb ? `${tip}. ${btn.dataset.saved!.replace('{kb}', String(kb))}` : tip);
  }
}

/** Switch the mode. `byHand` remembers it for the rest of this visit. */
export function setSaving(on: boolean, byHand = true) {
  root.classList.toggle('save-data', on);
  auto = on && !byHand;
  if (byHand) store('session', CHOICE, on ? 'save' : 'full');
  sync();
}

btn?.addEventListener('click', () => setSaving(!saving()));

/**
 * How fast did this page arrive? Its size divided by the time from first to last byte.
 * Null when there's nothing to measure: the page came from the phone (service worker
 * or browser cache) or the browser doesn't say.
 */
function measuredSlow(): boolean | null {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!nav || nav.transferSize < 4000 || !nav.responseEnd || !nav.encodedBodySize) return null;
  const kbps = (nav.encodedBodySize * 8) / Math.max(nav.responseEnd - nav.responseStart, 1);
  return kbps < SLOW_KBPS;
}

/** The phone's own signals, where the browser shares them (Chrome on Android). */
function phoneSaysSave() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (!!c.saveData || /2g$/.test(c.effectiveType ?? ''));
}

function decide() {
  if (chosen()) return; // the button's choice wins for this visit
  const slow = measuredSlow();
  if (slow !== null) store('local', SPEED, JSON.stringify({ slow, t: Date.now() }));
  // The phone's data saver is the visitor's own wish; otherwise go by the measurement.
  const on = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData || (slow ?? saving());
  setSaving(!!on, false);
}

// Failures after this script ran (the head script marks the wrapper; we add the button).
document.addEventListener('error', (e) => {
  if (e.target instanceof HTMLImageElement && e.target.closest('[data-ph]')) sync();
}, true);
window.addEventListener('online', () => {
  document.querySelectorAll<HTMLElement>('[data-ph].is-failed').forEach(retry);
});

auto = saving() && !chosen();
sync();
decide();
(navigator as Navigator & { connection?: EventTarget }).connection?.addEventListener('change', () => {
  if (!chosen() && phoneSaysSave() !== saving()) setSaving(phoneSaysSave(), false);
});
