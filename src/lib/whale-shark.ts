// The whale shark that cruises along the surface of the dive sites section.
// Side view, swimming right: a wide flat head with the mouth right at the front,
// five gill slits, two dorsal fins, a tall tail that sweeps side to side, pale
// stripes and spots (no two whale sharks have the same pattern), a pale belly,
// and three pilot fish riding the bow wave in front of its mouth.
// Built once at build time; it lives in its own module so the browser never loads it.

/** The body's top and bottom edge, sampled from the outline below (x, y). */
const top = [[46, 37], [60, 33.6], [80, 28.6], [100, 24.6], [120, 21.6], [140, 20], [160, 19.3], [180, 19.7], [200, 21.5], [215, 24.4], [224, 27.5], [232, 31.5]];
const bottom = [[46, 43], [60, 45.5], [80, 49.5], [100, 55], [120, 58], [140, 59], [160, 58.8], [180, 57.4], [192, 55.9], [205, 53.6], [215, 50.6], [225, 46.8], [232, 43.5]];

const at = (pts: number[][], x: number) => {
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
};
const n = (v: number) => +v.toFixed(1);
/** One spot as path commands: two half circles. All spots share one <path>. */
const dot = (cx: number, cy: number, r: number) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`;
/** A fixed "random" number from 0 to 1, so every build draws the same shark. */
const hash = (i: number) => {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};

let spots = '';
let stripes = '';
let k = 0;
// Back and flanks: thin pale stripes, with a staggered column of spots between each pair.
for (let x = 60, col = 0; x < 190; x += 8.5, col++) {
  const t = at(top, x), h = at(bottom, x) - t;
  stripes += `M${n(x + (hash(k) - 0.5))} ${n(t + 1)}V${n(t + h * 0.7)}`;
  const cx = x + 4.25;
  if (cx > 188) break;
  const ct = at(top, cx), ch = at(bottom, cx) - ct, step = 3.3 + ch * 0.022;
  for (let y = ct + 2 + (col % 2) * step * 0.5; y < ct + ch * 0.72; y += step) {
    const r = 0.45 + 0.55 * (ch / 38) + (hash(k) - 0.4) * 0.45;
    spots += dot(cx + (hash(k + 1) - 0.5) * 2.4, y + (hash(k + 2) - 0.5) * 1.4, r);
    k += 3;
  }
}
// Head: smaller spots, scattered more loosely, none on the eye.
for (let x = 191; x < 229; x += 3.1) {
  const t = at(top, x), h = at(bottom, x) - t;
  for (let y = t + 1.8; y < t + h * 0.55; y += 3) {
    const px = x + (hash(k) - 0.5) * 2.4, py = y + (hash(k + 1) - 0.5) * 2;
    k += 3;
    if (Math.hypot(px - 219, py - 37) < 3.2 || hash(k) < 0.15) continue;
    spots += dot(px, py, 0.4 + hash(k + 5) * 0.35);
  }
}

const fish = 'M22 6c-4-5-11-5-15 0 4 5 11 5 15 0Zm-15 0-5-4v8Z';
const pilot = (x: number, y: number, s: number, delay: number) =>
  `<g class="pilot" style="animation-delay:${delay}s"><path transform="translate(${x} ${y}) scale(${s})" fill="currentColor" d="${fish}"/></g>`;

export const whaleShark =
  '<svg class="creature creature-whaleshark" viewBox="0 0 270 80" aria-hidden="true" focusable="false">' +
  // The tail is its own group, so its sweep moves nothing else.
  '<g class="tail"><path fill="currentColor" d="M50 37.4C40 30 24 16 4 3c8 13 16 26 23 37-5 9-10 17-15 26 14-9 27-17 38-23Z"/></g>' +
  '<path fill="currentColor" d="M152 20C140 13 126 4.5 110 1.5c6 7.5 10 14.5 11 20.5Z"/>' + // first dorsal fin
  '<path fill="currentColor" d="M76 30c-4-4-9-6.4-15-7.4 2 3 3 6 2.5 10Z"/>' + // second dorsal fin
  '<path fill="currentColor" d="M114 58c-6 4-12 6.5-20 7.5 5-3.5 7-6.5 7-8.9Z"/>' + // pelvic fin
  '<path fill="currentColor" d="M82 50.2c-4 3.2-9 5.2-16 6.2 4-2.6 5-5.2 5-7.8Z"/>' + // anal fin
  '<path fill="currentColor" d="M46 37c24-6 58-15 94-17 32-1.4 65 1.5 84 7.5 8 2.5 12 6.5 12 10.5 0 1.5-1 3-3 4-5 5-20 11-42 14-32 4-72 3-100-2-18-3.5-33-8-45-11Z"/>' +
  '<path class="belly" d="M233 42c-5 5-20 11-42 14-32 4-72 3-100-2-18-3.5-33-8-45-11 24 1 54 5.5 84 7.5 35 1.5 70 0 103-8.5Z"/>' +
  '<path class="ridges" d="M198 24.5c-38-3.5-88 .5-148 14M192 32c-42-2-92 2-142 8M150 47c-30 1-70-1.5-102-5"/>' +
  '<path class="gills" d="M196 31c-1.4 5-1.4 10.5 0 16M200.5 30.4c-1.4 5.2-1.4 11 0 16.5M205 30c-1.3 5.2-1.3 11 0 16.4M209.4 29.8c-1.2 5-1.2 10.6 0 15.8M213.6 29.8c-1.1 4.8-1.1 10 0 15"/>' +
  `<path class="stripes" d="${stripes}"/>` +
  `<path class="spots" d="${spots}"/>` +
  '<path class="mouth" d="M235.6 40.4c-4 1.2-9 1.8-14.4 1.8"/>' +
  '<circle class="eye" cx="219" cy="37" r="1.25"/>' +
  '<g class="pec"><path d="M192 55.4c-9 7.6-22 15.1-40 20.6 9-7 16-14 22-18.2Z"/></g>' + // pectoral fin, in front
  pilot(244, 31, 0.42, 0) +
  pilot(252, 37.5, 0.38, -0.7) +
  pilot(243, 43, 0.4, -1.3) +
  '</svg>';
