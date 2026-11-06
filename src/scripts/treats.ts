// Small delights. All decorative (aria-hidden), all off when animations are paused.
import { motionOn } from './motion-state';

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const finePointer = window.matchMedia('(pointer: fine)').matches;

// 1. Ambient bubbles rising through the deep sections -----------------
document.querySelectorAll<HTMLElement>('.bubbles').forEach((field) => {
  const count = window.innerWidth < 640 ? 7 : 14;
  for (let i = 0; i < count; i++) {
    const b = document.createElement('span');
    b.style.setProperty('--x', `${rand(2, 98)}%`);
    b.style.setProperty('--size', `${rand(4, 14)}px`);
    b.style.setProperty('--dur', `${rand(9, 20)}s`);
    b.style.setProperty('--delay', `${-rand(0, 20)}s`);
    b.style.setProperty('--sway', `${rand(-24, 24)}px`);
    field.appendChild(b);
  }
});

// 2. Exhale: bubbles from the cursor in deep water ---------------------
const layer = document.createElement('div');
layer.className = 'fx-layer';
layer.setAttribute('aria-hidden', 'true');
document.body.appendChild(layer);

const puff = (x: number, y: number, size = rand(5, 11), cls = 'fx-bubble') => {
  const b = document.createElement('span');
  b.className = cls;
  b.style.left = `${x}px`;
  b.style.top = `${y}px`;
  b.style.setProperty('--size', `${size}px`);
  b.style.setProperty('--sway', `${rand(-18, 18)}px`);
  layer.appendChild(b);
  b.addEventListener('animationend', () => b.remove());
  setTimeout(() => b.remove(), 3000);
};

if (finePointer) {
  let last = 0;
  document.querySelectorAll<HTMLElement>('.deep').forEach((section) => {
    section.addEventListener('pointermove', (e) => {
      if (!motionOn() || layer.childElementCount > 40) return;
      const now = performance.now();
      if (now - last < 140) return;
      last = now;
      puff(e.clientX + rand(-4, 4), e.clientY - 6);
    });
  });
}

// 3. A manta glides past the seasons table when it comes into view ----
const glider = document.querySelector<SVGElement>('.glider');
if (glider && 'IntersectionObserver' in window) {
  let lastGlide = 0;
  new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || !motionOn() || performance.now() - lastGlide < 25000) return;
      lastGlide = performance.now();
      glider.classList.remove('is-gliding');
      void glider.getBoundingClientRect();
      glider.classList.add('is-gliding');
    },
    { threshold: 0.35 },
  ).observe(glider.parentElement!);
}

// 4. Easter egg: type "manta" anywhere --------------------------------
const mantaSvg =
  '<svg viewBox="0 0 64 40" aria-hidden="true"><path fill="currentColor" d="M32 6c-5 0-10.5 4-24 9.6 11.5 1.6 18.4 5.6 21.4 10.6.9 1.6 1.7 3.6 2.6 6 .9-2.4 1.7-4.4 2.6-6 3-5 9.9-9 21.4-10.6C42.5 10 37 6 32 6Z"/><path d="M32 31v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
let typed = '';
document.addEventListener('keydown', (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (target?.closest('input, textarea, select, [contenteditable]') || e.key.length !== 1) return;
  typed = (typed + e.key.toLowerCase()).slice(-5);
  if (typed !== 'manta' || !motionOn()) return;
  typed = '';
  for (let i = 0; i < 3; i++) {
    const m = document.createElement('div');
    m.className = 'fx-manta';
    m.innerHTML = mantaSvg;
    m.style.top = `${rand(15, 70)}vh`;
    m.style.setProperty('--size', `${rand(90, 170)}px`);
    m.style.animationDelay = `${i * 0.7}s`;
    layer.appendChild(m);
    m.addEventListener('animationend', () => m.remove());
  }
});

// 5. Ascending too fast? A dive-computer style nudge ------------------
const toast = document.querySelector<HTMLElement>('[data-toast]');
if (toast) {
  const text = toast.querySelector<HTMLElement>('[data-toast-text]')!;
  const close = toast.querySelector<HTMLButtonElement>('[data-toast-close]')!;
  let shown = false;
  let hideTimer = 0;
  const hide = () => {
    toast.classList.remove('is-on');
    clearTimeout(hideTimer);
  };
  close.addEventListener('click', hide);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && hide());

  let samples: { y: number; t: number }[] = [];
  window.addEventListener(
    'scroll',
    () => {
      if (shown || !motionOn() || document.documentElement.dataset.ascending) return;
      const now = performance.now();
      samples.push({ y: window.scrollY, t: now });
      samples = samples.filter((s) => now - s.t < 700);
      const climb = samples[0].y - window.scrollY;
      if (climb > window.innerHeight * 2.5 && samples[0].y > window.innerHeight * 3) {
        shown = true;
        text.textContent = toast.dataset.message!;
        toast.classList.add('is-on');
        hideTimer = window.setTimeout(hide, 6000);
      }
    },
    { passive: true },
  );
}

// 6. Form sent: stamp the dive log and let off some bubbles -----------
document.addEventListener('tdc:logged', (e) => {
  const el = (e as CustomEvent<HTMLElement>).detail;
  if (!motionOn()) return;
  const r = el.querySelector('.stamp')!.getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    setTimeout(() => puff(r.left + r.width / 2 + rand(-30, 30), r.top + rand(0, r.height), rand(6, 14)), i * 45);
  }
});
