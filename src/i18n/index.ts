import en from './en';
import pt from './pt';
import type { Lang } from '../config';

export const dict = { en, pt };
export const t = (lang: Lang) => dict[lang];
