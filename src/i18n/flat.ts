// Copy as a flat list of "path → text", for the translation sheet and toh.json.
// Paths look like "hero.titleStart" or "faq.items.3.a".

/** Identifiers and times: the same in every language, so not in the sheet. */
export const FIXED = /(^|\.)(id|time|group)$/;

export type Flat = [path: string, text: string][];

export function flatten(obj: unknown, prefix = ''): Flat {
  if (typeof obj === 'string') return [[prefix, obj]];
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
}

/** Every string a translator should translate, in page order. */
export const translatable = (dict: unknown): Flat => flatten(dict).filter(([p]) => !FIXED.test(p));

export function setPath(obj: Record<string, unknown>, path: string, value: string) {
  const keys = path.split('.');
  let node: Record<string, unknown> = obj;
  for (const k of keys.slice(0, -1)) {
    if (!node[k] || typeof node[k] !== 'object') return false;
    node = node[k] as Record<string, unknown>;
  }
  const last = keys[keys.length - 1];
  if (typeof node[last] !== 'string') return false;
  node[last] = value;
  return true;
}
