// Language-neutral data: icons, photos, depths and season patterns.
// The words live in src/i18n/*.ts, matched by id.
import {
  faUserGroup, faShip, faGraduationCap, faHandHoldingHeart, faWater, faFish,
  faTemperatureHalf, faLanguage, faSun, faMoon, faUmbrellaBeach, faFishFins,
  faMugHot, faPersonSwimming,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { PhotoKey } from './config';

export const statIcons: Record<string, IconDefinition> = {
  sharks: faFish,
  temp: faTemperatureHalf,
  whales: faWater,
  lang: faLanguage,
};

export const pillarIcons: Record<string, IconDefinition> = {
  buddies: faUserGroup,
  boats: faShip,
  learn: faGraduationCap,
  reef: faHandHoldingHeart,
};

export const diveCards: Record<string, { icon: IconDefinition; photo: PhotoKey }> = {
  reef: { icon: faWater, photo: 'mantas' },
  safari: { icon: faFish, photo: 'whaleSharkAbove' },
  learn: { icon: faGraduationCap, photo: 'diversSchool' },
  nights: { icon: faMugHot, photo: 'tofoSurf' },
};

export const weekIcons: Record<string, IconDefinition> = {
  sunrise: faSun,
  safari: faPersonSwimming,
  night: faMoon,
  double: faFishFins,
  clean: faUmbrellaBeach,
};

type Level = 'all' | 'beginner' | 'advanced';
// Approximate depth ranges in metres, from dive-operator listings.
export const sites: Record<string, { depth: [number, number]; level: Level }> = {
  safari: { depth: [0, 2], level: 'all' },
  salon: { depth: [12, 18], level: 'beginner' },
  manta: { depth: [19, 26], level: 'advanced' },
  office: { depth: [19, 24], level: 'advanced' },
  giants: { depth: [22, 30], level: 'advanced' },
};
export const maxDepth = 30;

// 2 = best chances, 1 = possible, 0 = unlikely. January first.
export const seasons = {
  sharks: [2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2],
  mantas: [2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2],
  whales: [0, 0, 0, 0, 0, 1, 2, 2, 1, 1, 1, 0],
} as const;
// Approximate sea temperature in °C.
export const waterTemp = [27, 28, 27, 26, 25, 23, 22, 22, 22, 23, 25, 26];

// Depth (metres) shown on the gauge for each section.
export const depths = { hero: 0, club: 5, dives: 10, sites: 18, seasons: 24, join: 28, faq: 30 } as const;
