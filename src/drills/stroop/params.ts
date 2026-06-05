// Stroop (Diqqat) — D → parametr (CLAUDE.md §4.3)
// ranglar soni min(8, 3 + floor(D/3)); mos kelmaslik ulushi va tezlik oshadi.

export interface StroopParams {
  /** faol ranglar soni (3..8) */
  colorCount: number;
  /** so'z≠rang bo'lish ehtimoli (0..1) */
  mismatch: number;
  /** har sinov uchun vaqt limiti (ms) */
  trialMs: number;
  /** raunddagi sinovlar soni */
  trials: number;
}

export function paramsForLevel(D: number): StroopParams {
  const d = Math.max(1, Math.floor(D));
  const colorCount = Math.min(8, 3 + Math.floor(d / 3));
  // Mos kelmaslik (xalaqit) yuqori darajada deyarli doimiy — eng qiyin holat.
  const mismatch = Math.min(0.9, 0.35 + d * 0.03);
  // 2600ms dan 750ms gacha — boshlanишда yetarli vaqt (oldin juda tez edi,
  // foydalanuvchi "to'g'ri bossam ham xato" deб his qilardi).
  const trialMs = Math.max(750, 2600 - d * 70);
  // 10 dan 16 gacha — chidamlilik.
  const trials = Math.min(16, 10 + Math.floor(d / 4));
  return { colorCount, mismatch, trialMs, trials };
}
