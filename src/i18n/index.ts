import en from './en';
import pt from './pt';
import toh from './toh';
import type { Lang } from '../config';

export const dict = { en, pt, toh };
export const t = (lang: Lang) => dict[lang];
