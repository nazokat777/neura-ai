// Piktogrammalar — vizual tanib olish xotirasi.
// Belgilar to'plami ko'rsatiladi, keyin kattaroq to'rdan o'shalarini tanlaysiz.

export interface PictogramParams {
  /** yodlanadigan belgilar soni */
  count: number;
  /** yodlash vaqti (ms) */
  memMs: number;
}

export function paramsForLevel(D: number): PictogramParams {
  const d = Math.max(1, Math.floor(D));
  const count = Math.min(8, 3 + Math.floor(d / 2));
  const memMs = count * 900;
  return { count, memMs };
}

// Til-neytral belgilar (emoji) havzasi.
export const GLYPHS = [
  '🍎', '🌟', '🎈', '🔔', '🍀', '⚓', '✈️', '🎲', '🔥', '🌙',
  '🎵', '🍩', '🦋', '🌵', '⚙️', '🧩', '🎯', '🪁', '🍕', '🚀',
  '🎸', '🏀', '🌈', '🐬',
];
