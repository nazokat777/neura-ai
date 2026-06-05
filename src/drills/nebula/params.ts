// Nebula Navigator — ko'p-nishon kuzatuv (Multiple Object Tracking).
// Manba: Pylyshyn & Storm, 1988 — odam bir vaqtda ~4 ta harakatlanuvchi
// nishonni kuzata oladi. Fazoviy diqqat + ishchi xotira mashqi.
//
// Oqim: nishonlar yonadi (cue) → hammasi bir xil bo'lib harakatlanadi (move)
// → to'xtaydi, o'yinchi nishonlarni tanlaydi (select).

export interface NebulaParams {
  /** maydondagi jami nuqtalar */
  total: number;
  /** kuzatiladigan nishonlar soni */
  targets: number;
  /** harakat tezligi (px/kadr, 320px maydonga nisbatan) */
  speed: number;
  /** nishonlarni yoritish (eslab qolish) vaqti (ms) */
  cueMs: number;
  /** harakat (kuzatuv) davomiyligi (ms) */
  moveMs: number;
}

export function paramsForLevel(D: number): NebulaParams {
  const d = Math.max(1, Math.floor(D));
  const total = Math.min(16, 6 + Math.floor(d / 2));
  // nishonlar 2 dan ~6 gacha; jami nuqtadan kamida 3 ta kam.
  const targets = Math.min(Math.max(2, total - 3), 2 + Math.floor(d / 3));
  const speed = Math.min(2.8, 0.7 + d * 0.09);
  const cueMs = Math.max(1200, 2400 - d * 70);
  const moveMs = Math.min(11000, 4000 + d * 280);
  return { total, targets, speed, cueMs, moveMs };
}
