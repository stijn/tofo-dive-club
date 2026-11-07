// Lighter on cheap phones: looping animations (bubbles, fish, the hero's slow drift,
// the humpback) pause while their section is off-screen, and start again on the way back.
import { motionOn } from './motion-state';

const regions = document.querySelectorAll<HTMLElement>('main > section, .stats, .site-footer, .lost');
if ('IntersectionObserver' in window && regions.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        target.classList.toggle('is-offscreen', !isIntersecting);
        // line-md icons animate with SVG <animate>, which CSS can't pause.
        target.querySelectorAll<SVGSVGElement>('svg[data-line-md*="loop"]').forEach((svg) => {
          if (!isIntersecting) svg.pauseAnimations?.();
          else if (motionOn()) svg.unpauseAnimations?.();
        });
      }
    },
    { rootMargin: '150px 0px' },
  );
  regions.forEach((el) => io.observe(el));
}
