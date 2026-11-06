// One accessible tooltip for everything with data-tip (WCAG 1.4.13):
// shows on hover and on keyboard focus, stays while you point at it,
// and Escape dismisses it without moving focus.
const tip = document.createElement('div');
tip.id = 'tip';
tip.className = 'tip';
tip.setAttribute('role', 'tooltip');
tip.hidden = true;
document.body.appendChild(tip);

let current: HTMLElement | null = null;
let showTimer = 0;
let hideTimer = 0;
let dismissed: HTMLElement | null = null;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function place(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  const gap = 10;
  let x: number;
  let y: number;
  if (el.dataset.tipSide === 'left') {
    x = r.left - t.width - gap;
    y = r.top + r.height / 2 - t.height / 2;
  } else {
    x = r.left + r.width / 2 - t.width / 2;
    const below = r.bottom + gap;
    const above = r.top - t.height - gap;
    y = el.closest('.site-header') || above < 80 ? below : above;
  }
  x = Math.max(12, Math.min(x, window.innerWidth - t.width - 12));
  y = Math.max(12, Math.min(y, window.innerHeight - t.height - 12));
  tip.style.transform = '';
  tip.style.left = `${Math.round(x)}px`;
  tip.style.top = `${Math.round(y)}px`;
}

function show(el: HTMLElement) {
  clearTimeout(hideTimer);
  if (dismissed === el) return;
  current = el;
  const title = el.dataset.tipTitle;
  tip.innerHTML = (title ? `<strong>${esc(title)}</strong>` : '') + `<span class="${title ? 'tip-def' : ''}">${esc(el.dataset.tip ?? '')}</span>`;
  tip.hidden = false;
  place(el);
  // Name-only tips (icon buttons) repeat the accessible name, so don't announce them twice.
  if (el.dataset.tipDescribe !== 'false') el.setAttribute('aria-describedby', 'tip');
  requestAnimationFrame(() => tip.classList.add('is-on'));
}

function hide() {
  clearTimeout(showTimer);
  tip.classList.remove('is-on');
  tip.hidden = true;
  if (current?.getAttribute('aria-describedby') === 'tip') current.removeAttribute('aria-describedby');
  current = null;
}

const target = (e: Event) => (e.target instanceof Element ? e.target.closest<HTMLElement>('[data-tip]') : null);

document.addEventListener('pointerover', (e) => {
  const el = target(e);
  if (!el || el === current) return;
  clearTimeout(showTimer);
  showTimer = window.setTimeout(() => show(el), el.classList.contains('term') ? 450 : 250);
});
document.addEventListener('pointerout', (e) => {
  const el = target(e);
  if (!el) return;
  if (el === dismissed && !el.contains(e.relatedTarget as Node)) dismissed = null;
  clearTimeout(showTimer);
  if (current === el && !tip.contains(e.relatedTarget as Node)) hideTimer = window.setTimeout(hide, 180);
});
tip.addEventListener('pointerenter', () => clearTimeout(hideTimer));
tip.addEventListener('pointerleave', () => (hideTimer = window.setTimeout(hide, 180)));

document.addEventListener('focusin', (e) => {
  const el = target(e);
  if (el && el.matches(':focus-visible')) show(el);
});
document.addEventListener('focusout', (e) => {
  if (target(e) === current) hide();
  dismissed = null;
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && current) {
    dismissed = current;
    hide();
  }
});
window.addEventListener('scroll', () => current && !current.matches(':focus') && hide(), { passive: true });

/** Update a tip in place (e.g. a toggle that changes meaning). */
export function setTip(el: HTMLElement, text: string) {
  el.dataset.tip = text;
  if (current === el) show(el);
}
