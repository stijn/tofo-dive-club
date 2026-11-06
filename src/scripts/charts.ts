// The charts answer the cursor a little. Decorative only: the data is in the
// text and table already, so none of this is needed to read the page.
import { motionOn } from './motion-state';
import { manta, whaleShark, fluke, fish } from '../lib/creatures';

const finePointer = window.matchMedia('(pointer: fine)');

// 1. Depth chart: a probe line follows the cursor and lights up the sites at that depth.
const profile = document.querySelector<HTMLElement>('.profile');
if (profile) {
  const list = profile.querySelector<HTMLElement>('.site-list')!;
  const probe = profile.querySelector<HTMLElement>('[data-probe]')!;
  const label = profile.querySelector<HTMLElement>('[data-probe-label]')!;
  const sites = [...list.querySelectorAll<HTMLElement>('.site')];
  const maxDepth = Number(list.dataset.maxDepth) || 30;
  const wide = window.matchMedia('(min-width: 961px)');

  const clear = () => {
    profile.classList.remove('is-probing');
    sites.forEach((s) => s.classList.remove('is-hit', 'is-focus'));
  };
  profile.addEventListener('pointermove', (e) => {
    if (!wide.matches || !finePointer.matches) return;
    const track = list.querySelector('.site-track')!.getBoundingClientRect();
    const box = profile.getBoundingClientRect();
    const y = e.clientY - track.top;
    if (y < -16 || y > track.height + 16) return clear();
    const clamped = Math.max(0, Math.min(track.height, y));
    const depth = (clamped / track.height) * maxDepth;
    probe.style.setProperty('--y', `${track.top - box.top + clamped}px`);
    label.textContent = `${Math.round(depth)} m`;
    profile.classList.add('is-probing');
    sites.forEach((s) => {
      const lo = Number(s.dataset.min);
      const hi = Number(s.dataset.max);
      s.classList.toggle('is-hit', depth >= lo - 1 && depth <= hi + 1);
      s.classList.toggle('is-focus', s.contains(e.target as Node));
    });
  });
  profile.addEventListener('pointerleave', clear);
}

// 2. Seasons table: a soft crosshair, and after a moment on a cell, its animal swims by.
const wrap = document.querySelector<HTMLElement>('[data-season-wrap]');
if (wrap) {
  const table = wrap.querySelector('table')!;
  const creatures: Record<string, string> = { sharks: whaleShark, mantas: manta, whales: fluke, temp: fish };
  let col = -1;
  let timer = 0;

  const setCol = (m: number) => {
    if (m === col) return;
    table.querySelectorAll('.is-col').forEach((c) => c.classList.remove('is-col'));
    col = m;
    if (m >= 0) table.querySelectorAll(`[data-month="${m}"]`).forEach((c) => c.classList.add('is-col'));
  };

  const spawn = (cell: HTMLElement) => {
    // Skip when the table scrolls sideways (narrow windows): the animal would be clipped.
    if (!motionOn() || table.offsetWidth > wrap.clientWidth + 1) return;
    const row = cell.closest('tr')!.dataset.row!;
    const level = cell.classList.contains('lvl-0') ? 0 : cell.classList.contains('lvl-1') ? 1 : 2;
    const box = wrap.getBoundingClientRect();
    const r = cell.getBoundingClientRect();
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.left = `${r.left - box.left + wrap.scrollLeft + r.width / 2}px`;
    el.style.top = `${r.top - box.top + r.height / 2}px`;
    if (row !== 'temp' && level === 0) {
      // Nothing out there this month: just a few bubbles.
      el.className = 'cell-bubbles';
      el.innerHTML = '<span></span><span></span><span></span>';
    } else {
      el.className = `cell-creature cell-${row}`;
      el.innerHTML = row === 'temp' ? fish + fish + fish : creatures[row];
    }
    wrap.appendChild(el);
    el.addEventListener('animationend', (ev) => ev.target === el && el.remove());
    setTimeout(() => el.remove(), 4000);
  };

  table.addEventListener('pointerover', (e) => {
    if (!finePointer.matches) return;
    const cell = (e.target as Element).closest<HTMLElement>('[data-month]');
    setCol(cell ? Number(cell.dataset.month) : -1);
    clearTimeout(timer);
    if (cell && cell.tagName === 'TD') timer = window.setTimeout(() => spawn(cell), 1500);
  });
  table.addEventListener('pointerleave', () => {
    setCol(-1);
    clearTimeout(timer);
  });
}
