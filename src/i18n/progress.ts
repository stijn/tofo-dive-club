// How much of the Gitonga version is translated. At 100% it goes live.
import en from './en';
import done from './toh.json';
import { translatable } from './flat';

const texts = done as Record<string, string>;
const keys = translatable(en).map(([path]) => path);
export const tohProgress = {
  done: keys.filter((k) => texts[k]?.trim()).length,
  total: keys.length,
};
export const tohReady = tohProgress.done === tohProgress.total;
