// Neyron AI — o'yinlar katalogi (kognitiv domenlar bo'yicha, ilmiy asosda).
//
// Har kategoriya — neyrobiologiyada tan olingan kognitiv domen. Har o'yin
// shu domenni mashq qiladi. `ready: true` — kod bor va o'ynaladi; `false` —
// rejada (UIda "Tez orada", halol: yo'q narsani bor deб ko'rsatmaymiz).
//
// Matn (nom/tavsif/ilmiy fakt) i18n'da: games.cat.<id>, games.item.<id>.
// Har kategoriya foniga cinematic video: /cinematic/sections/<id>.mp4
// (hozircha placeholder gradient; Veo asseti tushgach avtomatik ishlaydi).

export interface Game {
  id: string;
  /** Mavjud mashq sahifasi yo'li (ready bo'lsa). */
  href?: string;
  ready: boolean;
  /** XP/qiyinlik tavsifi (UIда yorliq). */
  tier?: 'easy' | 'medium' | 'hard';
}

export interface Category {
  id: string;
  /** Lucide-ga o'xshash emoji/belgi (yengil, ortiqcha asset yo'q). */
  glyph: string;
  /** Bo'lim urg'u rangi (cinematic gradient ohangi uchun). */
  hue: string; // hsl hue burchagi
  games: Game[];
}

// Ilmiy asos har kategoriya tagida (i18n: games.cat.<id>.fact + .source):
//  memory   — Baddeley & Hitch working memory (1974); gippokamp konsolidatsiyasi
//  attention— Posner & Petersen attention networks (1990)
//  logic    — Cattell fluid intelligence Gf (1963); Raven matritsalari
//  speed    — Salthouse processing-speed theory (1996)
//  focus    — Miyake va b. executive functions / inhibition (2000); Stroop (1935)
//  motor    — bimanual koordinatsiya → serebellum + motor korteks (motor learning)
//  vision   — okulomotor qulaylik / 20-20-20 (AAO tavsiyasi) — HALOL: ko'z
//             charchog'ini kamaytirish, "ko'rishni davolash" emas
export const CATALOG: Category[] = [
  {
    id: 'memory',
    glyph: '◍',
    hue: '168',
    games: [
      { id: 'memory', href: '/drills/memory', ready: true, tier: 'medium' },
      { id: 'sequence', href: '/drills/sequence', ready: true, tier: 'hard' },
      { id: 'names', href: '/drills/names', ready: true, tier: 'hard' },
      { id: 'audioMemory', href: '/drills/audioMemory', ready: true, tier: 'medium' },
      { id: 'pictogram', href: '/drills/pictogram', ready: true, tier: 'hard' },
    ],
  },
  {
    id: 'attention',
    glyph: '⊹',
    hue: '188',
    games: [
      { id: 'schulte', href: '/drills/schulte', ready: true, tier: 'medium' },
      { id: 'nebula', href: '/drills/nebula', ready: true, tier: 'hard' },
    ],
  },
  {
    id: 'logic',
    glyph: '◇',
    hue: '152',
    games: [
      { id: 'math', href: '/drills/math', ready: true, tier: 'easy' },
      { id: 'crossword', href: '/drills/crossword', ready: true, tier: 'medium' },
      { id: 'iq', href: '/drills/iq', ready: true, tier: 'hard' },
    ],
  },
  {
    id: 'speed',
    glyph: '⚡',
    hue: '46',
    games: [
      { id: 'speed', href: '/drills/speed', ready: true, tier: 'easy' },
    ],
  },
  {
    id: 'focus',
    glyph: '⊙',
    hue: '276',
    games: [
      { id: 'stroop', href: '/drills/stroop', ready: true, tier: 'medium' },
    ],
  },
  {
    id: 'motor',
    glyph: '✋',
    hue: '14',
    games: [
      { id: 'neuroSync', href: '/drills/neuroSync', ready: true, tier: 'hard' },
      { id: 'fingerDance', href: '/drills/fingerDance', ready: true, tier: 'medium' },
      { id: 'mirrorDraw', href: '/drills/mirrorDraw', ready: true, tier: 'hard' },
      { id: 'palmClash', href: '/drills/palmClash', ready: true, tier: 'easy' },
      { id: 'eyeHand', href: '/drills/eyeHand', ready: true, tier: 'medium' },
    ],
  },
  {
    id: 'vision',
    glyph: '◉',
    hue: '200',
    games: [
      { id: 'focusShift', href: '/drills/focusShift', ready: true, tier: 'easy' },
      { id: 'rule202020', href: '/drills/rule202020', ready: true, tier: 'easy' },
      { id: 'figureEight', href: '/drills/figureEight', ready: true, tier: 'easy' },
    ],
  },
];

export function getCategory(id: string): Category | undefined {
  return CATALOG.find((c) => c.id === id);
}

/** Vertikal (9:16) bo'lim foni — telefon uchun. */
export function sectionVideoSrc(categoryId: string): string {
  return `/cinematic/sections/${categoryId}.mp4`;
}

/** Gorizontal (16:9) bo'lim foni — keng ekran (desktop/web) uchun. */
export function sectionVideoSrcWide(categoryId: string): string {
  return `/cinematic/sections/${categoryId}-wide.mp4`;
}

/** Bo'lim foni gradienti (video yo'q paytda cinematic placeholder). */
export function sectionGradient(hue: string): string {
  return (
    `radial-gradient(80% 60% at 50% 22%, hsla(${hue}, 80%, 55%, 0.20), rgba(6,8,15,0) 68%),` +
    ` linear-gradient(180deg, #0a0e16 0%, #06080f 100%)`
  );
}
