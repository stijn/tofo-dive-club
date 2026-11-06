// Small sea-life silhouettes, all facing RIGHT (the way they swim on the page).
// Shared by the build (Astro components) and the browser (treats.ts).

// Manta seen from above. Drawn head-up in a 64×40 box, then turned 90° so the
// head (with its two cephalic fins) leads to the right and the wings span up/down.
const mantaBody =
  '<path fill="currentColor" d="M32 6c-5 0-10.5 4-24 9.6 11.5 1.6 18.4 5.6 21.4 10.6.9 1.6 1.7 3.6 2.6 6 .9-2.4 1.7-4.4 2.6-6 3-5 9.9-9 21.4-10.6C42.5 10 37 6 32 6Z"/>' +
  '<path d="M28.6 7.2c-1.8-1.3-2.1-3.2-.9-4.6M35.4 7.2c1.8-1.3 2.1-3.2.9-4.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
  '<path d="M32 31v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>';
// The turn lives on an outer group; the wing flap animates an inner one. (A CSS
// animation on the same element would replace its transform attribute and undo the turn.)
export const manta = `<svg class="creature creature-manta" viewBox="0 0 40 64" aria-hidden="true" focusable="false"><g transform="translate(40 0) rotate(90)"><g class="wings">${mantaBody}</g></g></svg>`;

// Whale shark, side view: tail on the left, wide flat head on the right, pale spots.
export const whaleShark =
  '<svg class="creature creature-shark" viewBox="0 0 64 22" aria-hidden="true" focusable="false">' +
  '<path fill="currentColor" d="M62 12c-1.5-3-6-5-14-5.5-7-.4-14 .4-21 1.8L22 3l-1 6.4C15 10.6 9 11.2 4 10.4L1 3.5l1.2 8L1 19.6l4-6.6c5 .4 11 .6 17-.3l2 4.8 2.4-4.6c7 1 14 1.6 21 1.2 8-.5 12.6-1.8 14.6-2.1Z"/>' +
  '<g fill="#d8f0f4" opacity=".75"><circle cx="50" cy="10" r=".9"/><circle cx="45" cy="9.5" r=".9"/><circle cx="40" cy="10.5" r=".8"/><circle cx="35" cy="10" r=".8"/><circle cx="47.5" cy="12.5" r=".8"/><circle cx="42" cy="13" r=".7"/><circle cx="37" cy="12.6" r=".7"/><circle cx="31" cy="11.5" r=".7"/><circle cx="58" cy="11.4" r=".6"/></g></svg>';

// Humpback tail fluke lifting out of the water.
export const fluke =
  '<svg class="creature creature-fluke" viewBox="0 0 40 32" aria-hidden="true" focusable="false">' +
  '<path fill="currentColor" d="M20 30c-.6-6-.5-10 .2-13.4C17 12.8 11 11.6 5 12.4 3 12.7 1.5 12 1 10.6 6 8.8 12 8.4 16.5 10.4c1.6.8 2.8 2 3.5 3.6.7-1.6 1.9-2.8 3.5-3.6C28 8.4 34 8.8 39 10.6c-.5 1.4-2 2.1-4 1.8-6-.8-12 .4-15.2 4.2.7 3.4.8 7.4.2 13.4Z"/>' +
  '<path d="M6 30c4-2 8-2 14-1s10 1 14-1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".6"/></svg>';

// A small reef fish.
export const fish =
  '<svg class="creature creature-fish" viewBox="0 0 24 12" aria-hidden="true" focusable="false"><path fill="currentColor" d="M22 6c-4-5-11-5-15 0 4 5 11 5 15 0Zm-15 0-5-4v8Z"/><circle cx="18.6" cy="5.2" r=".9" fill="#d8f0f4"/></svg>';
