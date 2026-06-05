// Tezlik (ikki qaror) — D → parametr (CLAUDE.md §4.3)
// qaror oynasi qisqaradi (refleks chegarasigacha), sinovlar soni oshadi.

export interface SpeedParams {
  /** qaror oynasi (ms) — shu vaqt ichida bosish kerak */
  windowMs: number;
  /** raunddagi sinovlar soni */
  trials: number;
}

export function paramsForLevel(D: number): SpeedParams {
  const d = Math.max(1, Math.floor(D));
  // 1160ms dan ~250ms gacha (inson refleksi chegarasiga yaqin) qisqaradi.
  const windowMs = Math.max(250, 1160 - 46 * d);
  // 12 dan 24 gacha — yuqori darajada uzunroq, chidamlilik talab qiladi.
  const trials = Math.min(24, 12 + Math.floor(d / 3));
  return { windowMs, trials };
}
