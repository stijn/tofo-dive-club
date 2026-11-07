// Build-time photo pipeline. Each master JPEG in src/assets/photos/ becomes:
// - AVIF and WebP in several widths (browsers pick the smallest that's sharp enough),
// - one JPEG for very old browsers,
// - a tiny blurred preview (under 1 KB) that's built into the page, so a photo
//   never shows as an empty box on a slow or dropped connection,
// - the download size of each width, so data saver mode's "Show photo · 42 KB" button
//   can say what this phone would actually download.
// AVIF quality 60 matched Unsplash's own q=70 side by side at full size, at about 30% less weight.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import sharp from 'sharp';
import { join } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import type { PhotoKey } from '../config';

const masters = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });
const Q = { avif: 60, webp: 78, jpeg: 80 };
/** The hero's widths, shared by Hero.astro and its preload in Base.astro. */
export const heroWidths = [640, 800, 960, 1280, 1600, 2000, 2560];

// Measuring each AVIF takes a few seconds, so the sizes are kept between builds.
const KB_CACHE = join(process.cwd(), 'node_modules/.cache/tdc-photo-kb.json');
let kbCache: Record<string, number> | null = null;
function readKbCache() {
  if (!kbCache) {
    try { kbCache = JSON.parse(readFileSync(KB_CACHE, 'utf8')); } catch { kbCache = {}; }
  }
  return kbCache!;
}
function saveKbCache() {
  mkdirSync(join(process.cwd(), 'node_modules/.cache'), { recursive: true });
  writeFileSync(KB_CACHE, JSON.stringify(kbCache));
}

export interface PhotoSet {
  avif: string;
  webp: string;
  fallback: string;
  width: number;
  height: number;
  lqip: string;
  /** "400:12 700:30": width and AVIF size in KB, for the data saver button. */
  kb: string;
  /** Same strings as the <source>, for a <link rel="preload">. */
  preload: { srcset: string; type: string };
}

const cache = new Map<string, Promise<PhotoSet>>();

export function photoSet(key: PhotoKey, widths: number[], ratio?: number): Promise<PhotoSet> {
  const id = `${key}|${widths.join(',')}|${ratio ?? ''}`;
  if (!cache.has(id)) cache.set(id, build(key, widths, ratio));
  return cache.get(id)!;
}

async function build(key: PhotoKey, widths: number[], ratio?: number): Promise<PhotoSet> {
  const src = masters[`../assets/photos/${key}.jpg`]?.default;
  if (!src) throw new Error(`No master photo for "${key}" in src/assets/photos/`);
  const r = ratio ?? src.height / src.width;
  const ws = widths.filter((w) => w <= src.width);
  const size = (w: number) => ({ width: w, height: Math.round(w * r) });

  const variants = (format: 'avif' | 'webp') =>
    Promise.all(ws.map(async (w) => {
      const img = await getImage({ src, ...size(w), fit: 'cover', format, quality: Q[format] });
      return `${img.src} ${w}w`;
    }));
  const [avif, webp] = await Promise.all([variants('avif'), variants('webp')]);
  const mid = ws[Math.min(1, ws.length - 1)];
  const fallback = (await getImage({ src, ...size(mid), fit: 'cover', format: 'jpeg', quality: Q.jpeg })).src;

  // The blurred preview and the phone-size estimate come straight from sharp.
  const file = join(process.cwd(), 'src/assets/photos', `${key}.jpg`);
  const tw = 24;
  const th = Math.max(1, Math.round(tw * r));
  const tiny = await sharp(file).resize(tw, th, { fit: 'cover' }).webp({ quality: 50 }).toBuffer();
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${tw} ${th}' preserveAspectRatio='none'>` +
    `<filter id='b' color-interpolation-filters='sRGB'><feGaussianBlur stdDeviation='1.1'/>` +
    `<feComponentTransfer><feFuncA type='discrete' tableValues='1 1'/></feComponentTransfer></filter>` +
    `<image width='100%' height='100%' preserveAspectRatio='none' filter='url(#b)' href='data:image/webp;base64,${tiny.toString('base64')}'/></svg>`;
  const lqip = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const cacheKb = readKbCache();
  const stamp = `${key}|${statSync(file).mtimeMs}|${r.toFixed(4)}|q${Q.avif}`;
  const kb: string[] = [];
  for (const w of ws) {
    const k = `${stamp}|${w}`;
    if (cacheKb[k] === undefined) {
      const buf = await sharp(file).resize(size(w).width, size(w).height, { fit: 'cover' }).avif({ quality: Q.avif }).toBuffer();
      cacheKb[k] = Math.max(1, Math.round(buf.length / 1024));
      saveKbCache();
    }
    kb.push(`${w}:${cacheKb[k]}`);
  }

  const s = size(mid);
  return {
    avif: avif.join(', '),
    webp: webp.join(', '),
    fallback,
    width: s.width,
    height: s.height,
    lqip,
    kb: kb.join(' '),
    preload: { srcset: avif.join(', '), type: 'image/avif' },
  };
}
