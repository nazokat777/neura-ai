// Miya-mintaqa xaritasi — har kognitiv bo'lim qaysi miya tizimini ishga soladi.
//
// HALOL-DATA: bu SODDALASHTIRILGAN ta'limiy assotsiatsiya. Kognitiv vazifalar
// bitta mintaqaga emas, tarmoqlarga tayanadi; mashq samarasi ko'pincha aynan
// shu mashqда seziladi (transfer cheklangan — Simons 2016). Manbalar i18n'da.
//
// Har mintaqaga cinematic video: /cinematic/brain/<region>.mp4
// (yo'q bo'lsa — gradient zaxira).

import { CATALOG } from './catalog';

export interface CategoryRegion {
  /** i18n kaliti: brain.region.<region> */
  region: string;
  /** i18n kaliti: brain.system.<system> */
  system: 'neocortex' | 'limbic' | 'cerebellum';
  /** gradient ohangi (video yo'q paytda) */
  hue: string;
}

export const CATEGORY_REGION: Record<string, CategoryRegion> = {
  memory: { region: 'hippocampus', system: 'limbic', hue: '168' },
  attention: { region: 'frontoparietal', system: 'neocortex', hue: '188' },
  logic: { region: 'prefrontal', system: 'neocortex', hue: '152' },
  speed: { region: 'sensorimotor', system: 'neocortex', hue: '46' },
  focus: { region: 'acc', system: 'neocortex', hue: '276' },
  motor: { region: 'motorCerebellum', system: 'cerebellum', hue: '14' },
  vision: { region: 'occipital', system: 'neocortex', hue: '200' },
};

export function regionForCategory(categoryId: string): CategoryRegion | undefined {
  return CATEGORY_REGION[categoryId];
}

/** Mashq (drill) qaysi kategoriyaga tegishli. */
export function categoryOfDrill(drillId: string): string | undefined {
  for (const cat of CATALOG) {
    if (cat.games.some((g) => g.id === drillId)) return cat.id;
  }
  return undefined;
}

export function regionForDrill(drillId: string): CategoryRegion | undefined {
  const cat = categoryOfDrill(drillId);
  return cat ? CATEGORY_REGION[cat] : undefined;
}

/** Vertikal (9:16) miya videosi — telefon uchun. */
export function brainVideoSrc(region: string): string {
  return `/cinematic/brain/${region}.mp4`;
}

/** Gorizontal (16:9) miya videosi — keng ekran (desktop/web) uchun. */
export function brainVideoSrcWide(region: string): string {
  return `/cinematic/brain/${region}-wide.mp4`;
}
