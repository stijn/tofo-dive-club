// Scroll reveals and line-md replays. Everything degrades to static content
// without JS, and reduced-motion visitors get final states straight away.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const icons = [...document.querySelectorAll<SVGSVGElement>('svg[data-line-md]')];
const reveals = [...document.querySelectorAll<HTMLElement>('.reveal')];

if (reduce || !('IntersectionObserver' in window)) {
  icons.forEach((svg) => {
    // Jump past the draw-in animation and hold the final frame.
    svg.setCurrentTime?.(10);
    svg.pauseAnimations?.();
  });
} else {
  document.documentElement.classList.add('js-motion', 'motion-ready');

  // line-md icons draw themselves once on load; hold off until they're visible.
  const iconObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const svg = entry.target as SVGSVGElement;
        svg.setCurrentTime?.(0);
        svg.unpauseAnimations?.();
        iconObserver.unobserve(svg);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  icons.forEach((svg) => {
    if (svg.closest('.menu-btn')) return;
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
    // Stagger siblings a little.
    const index = [...(el.parentElement?.children ?? [])].indexOf(el);
    el.style.setProperty('--delay', `${Math.min(index, 5) * 70}ms`);
    revealObserver.observe(el);
  });
}
