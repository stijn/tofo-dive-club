// One switch for every animation on the site. Defaults to the visitor's
// "reduce motion" setting; the header button overrides it and is remembered.
const KEY = 'tdc-motion';
const root = document.documentElement;

export const motionOn = () => !root.classList.contains('motion-off');

export function setMotion(on: boolean) {
  root.classList.toggle('motion-off', !on);
  root.classList.toggle('js-motion', on);
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* private mode: the choice lasts for this page view */
  }
  applyToIcons();
  document.dispatchEvent(new CustomEvent('tdc:motion', { detail: on }));
}

/** line-md icons animate with SVG <animate>, which CSS can't pause. */
export function applyToIcons() {
  const on = motionOn();
  document.querySelectorAll<SVGSVGElement>('svg[data-line-md]').forEach((svg) => {
    if (on) {
      svg.unpauseAnimations?.();
    } else {
      svg.setCurrentTime?.(10); // final frame of the draw-in
      svg.pauseAnimations?.();
    }
  });
}
