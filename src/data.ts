// Language-neutral data: icons, photos, depths and season patterns.
// The words live in src/i18n/*.ts, matched by id.
import {
  faUserGroup, faShip, faGraduationCap, faHandHoldingHeart, faWater, faFish,
  faTemperatureHalf, faLanguage, faSun, faMoon, faUmbrellaBeach, faFishFins,
  faMugHot, faPersonSwimming, faCalendarCheck, faCoins, faHandshakeAngle,
  faLifeRing, faShieldHalved, faBinoculars, faClipboardList, faDharmachakra, faHouseFloodWater,
  faWaveSquare, faUserGroup as faBuddies, faHandSparkles, faStopwatch, faLocationPin, faPersonSwimming as faSwimmer,
  faListCheck, faCertificate, faIdBadge, faMagnifyingGlass, faShirt, faShip as faBoat, faWater as faWaves,
  faGraduationCap as faLearn,
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
  // Reef mantas off Tofo fell about 99% from 2003 to 2023 (Marine Megafauna Foundation),
  // so no month gets 'best chances' any more.
  mantas: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  whales: [0, 0, 0, 0, 0, 1, 2, 2, 1, 1, 1, 0],
} as const;
// Approximate sea temperature in °C.
export const waterTemp = [27, 28, 27, 26, 25, 23, 22, 22, 22, 23, 25, 26];

// Depth (metres) shown on the gauge for each section.
export const depths = { hero: 0, club: 5, dives: 10, sites: 16, seasons: 22, offer: 26, join: 28, faq: 30 } as const;

// Icons for the offer's promises, keyed by id in the copy.
export const promiseIcons: Record<string, IconDefinition> = {
  go: faCalendarCheck,
  credit: faHandshakeAngle,
  price: faCoins,
  skills: faLifeRing,
  safety: faShieldHalved,
  respect: faBinoculars,
};

// Dive words: an icon per term and per group.
export const termIcons: Record<string, IconDefinition> = {
  briefing: faClipboardList,
  skipper: faDharmachakra,
  'surf-launch': faHouseFloodWater,
  swell: faWaveSquare,
  buddy: faBuddies,
  'cleaning-station': faHandSparkles,
  'ocean-safari': faBinoculars,
  'safety-stop': faStopwatch,
  smb: faLocationPin,
  'try-dive': faSwimmer,
  'check-out': faListCheck,
  'open-water': faCertificate,
  divemaster: faIdBadge,
  'fish-id': faMagnifyingGlass,
  wetsuit: faShirt,
};
export const groupIcons: Record<string, IconDefinition> = { boat: faBoat, water: faWaves, learn: faLearn };
