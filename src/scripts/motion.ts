// Scroll reveals and line-md replays. Everything degrades to static content
// without JS, and with animations paused you get final states straight away.
import { applyToIcons, motionOn } from './motion-state';

const root = document.documentElement;
const icons = [...document.querySelectorAll<SVGSVGElement>('svg[data-line-md]')];
const reveals = [...document.querySelectorAll<HTMLElement>('.reveal')];

if (!motionOn() || !('IntersectionObserver' in window)) {
  applyToIcons();
} else {
  root.classList.add('motion-ready');

  // line-md icons draw themselves once on load; hold off until they're visible.
  const iconObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !motionOn()) continue;
        const svg = entry.target as SVGSVGElement;
        svg.setCurrentTime?.(0);
        svg.unpauseAnimations?.();
        iconObserver.unobserve(svg);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  icons.forEach((svg) => {
    if (svg.closest('.menu-btn, .motion-btn')) return;
    const r = svg.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already on screen
    svg.pauseAnimations?.();
    svg.setCurrentTime?.(0);
    iconObserver.observe(svg);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  reveals.forEach((el) => {
    const index = [...(el.parentElement?.children ?? [])].indexOf(el);
    el.style.setProperty('--delay', `${Math.min(index, 5) * 70}ms`);
    revealObserver.observe(el);
  });
}

// Turning animations back on later must not hide content that was already read.
document.addEventListener('tdc:motion', (e) => {
  if ((e as CustomEvent<boolean>).detail) {
    root.classList.add('motion-ready');
    reveals.forEach((el) => el.classList.add('is-in'));
  }
});
