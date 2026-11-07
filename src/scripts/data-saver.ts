// Data saver mode and photo fallbacks, for slow or patchy mobile data.
// The head script in Base.astro switches it on before anything loads (saved choice,
// else the phone's data saver or a 2G connection). In this mode CSS hides photos that
// haven't loaded, so they're never downloaded, and each one gets a "Show photo · 42 KB"
// button. A photo that fails keeps its blurred preview and gets a "Try again" button,
// and every failed photo retries by itself when the connection comes back.
import { setTip } from './tooltips';

const KEY = 'tdc-data';
const root = document.documentElement;
const btn = document.querySelector<HTMLButtonElement>('[data-data-btn]');
const text = {
  show: btn?.dataset.show ?? 'Show photo',
  failed: btn?.dataset.failed ?? 'The photo didn’t load.',
  retry: btn?.dataset.retry ?? 'Try again',
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
    setTip(btn, (saving() ? btn.dataset.tipOn : btn.dataset.tipOff)!);
  }
}

export function setSaving(on: boolean) {
  root.classList.toggle('save-data', on);
  // Turning it off brings the site's own fonts back. Turning it on mid-visit keeps
  // fonts that are already here: changing them would save nothing.
  if (!on) root.classList.remove('save-fonts');
  try {
    localStorage.setItem(KEY, on ? 'save' : 'full');
  } catch {
    /* private mode: the choice lasts for this page view */
  }
  sync();
}

btn?.addEventListener('click', () => setSaving(!saving()));

// Failures after this script ran (the head script marks the wrapper; we add the button).
document.addEventListener('error', (e) => {
  if (e.target instanceof HTMLImageElement && e.target.closest('[data-ph]')) sync();
}, true);
window.addEventListener('online', () => {
  document.querySelectorAll<HTMLElement>('[data-ph].is-failed').forEach(retry);
});

sync();
