// Little moments that need a script; the rest are CSS ("Little moments" in global.css).
// Off when animations are paused.
import { motionOn } from './motion-state';

// Each section's depth label ticks up from the depth of the section above as you reach
// it ("10 m" → "16 m"), like a dive computer on the way down. Only the first time.
// The ticking number is decoration (aria-hidden); screen readers get the real depth.
const counters = [...document.querySelectorAll<HTMLElement>('[data-count]')];
const pad = (n: number) => String(n).padStart(2, '0');
const fromOf = (el: HTMLElement) => Number(counters[counters.indexOf(el) - 1]?.dataset.count ?? 0);
if ('IntersectionObserver' in window && counters.length && motionOn()) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        io.unobserve(target);
        const el = target as HTMLElement;
        const to = Number(el.dataset.count);
        const from = Number(el.textContent);
        if (!motionOn() || from >= to) {
          el.textContent = pad(to);
          continue;
        }
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 700);
          const eased = 1 - (1 - t) ** 3;
          el.textContent = pad(Math.round(from + (to - from) * eased));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    },
    { threshold: 1 },
  );
  // In the next frame (reading positions during start-up would force a layout): labels
  // still below the screen start at the depth above, so they never flash the end value.
  requestAnimationFrame(() => {
    for (const el of counters) if (el.getBoundingClientRect().top > window.innerHeight) el.textContent = pad(fromOf(el));
    counters.forEach((c) => io.observe(c));
  });
}
