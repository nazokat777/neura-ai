// Xotira matritsasi — D → parametr (CLAUDE.md §4.3)
// yodlanadigan kataklar 2 + D; grid n×n o'sadi;
// ko'rsatish vaqti max(0.6s, 3s − 0.1·D).

export interface MemoryParams {
  n: number;
  /** yodlanadigan (yongan) kataklar soni */
  cells: number;
  /** ko'rsatish vaqti (ms) */
  showMs: number;
  /** eslab tugatish uchun maqsadli vaqt (ms) */
  targetMs: number;
}

export function paramsForLevel(D: number): MemoryParams {
  const d = Math.max(1, Math.floor(D));
  const cells = 2 + d;
  // Zichlik yuqori darajada oshadi (38%→30%): kataklar siyrak → qiyinroq.
  const density = Math.max(0.3, 0.45 - d * 0.012);
  const n = Math.max(3, Math.ceil(Math.sqrt(cells / density)));
  // Ko'rsatish vaqti 3s dan 500ms gacha — tez yodlash.
  const showMs = Math.max(500, 3000 - 110 * d);
  const targetMs = cells * 650;
  return { n, cells, showMs, targetMs };
}
