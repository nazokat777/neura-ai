// Ketma-ketlik (N-back) — ishchi xotiraning eng isbotlangan mashqi.
// Manba: Jaeggi va b., 2008, PNAS (allaqachon katalogда iqtibosli).
//
// 3×3 katakда stimul ketma-ket yonadi. O'yinchi hozirgi katak N qadam
// oldingisi bilan BIR XIL bo'lsa "MOS" bosadi. N daraja bilan oshadi.

export interface SequenceParams {
  /** n-back darajasi (nechta qadam orqaga eslab turish) */
  n: number;
  /** raunddagi stimullar soni */
  trials: number;
  /** har stimul ko'rsatish + javob oynasi (ms) */
  stimMs: number;
  /** mos kelish ulushi (0..1) — taxminan shuncha trial match bo'ladi */
  matchRate: number;
}

export function paramsForLevel(D: number): SequenceParams {
  const d = Math.max(1, Math.floor(D));
  // N: D1-3 → 1, D4-6 → 2, D7-9 → 3, ... 5 bilan cheklangan (juda qiyin).
  const n = Math.min(5, 1 + Math.floor((d - 1) / 3));
  // Trial soni N bilan biroz ko'payadi (uzunroq yodlash zanjiri).
  const trials = Math.min(30, 12 + n * 3 + Math.floor(d / 4));
  // Stimul tezligi 3s dan 1.4s gacha qisqaradi.
  const stimMs = Math.max(1400, 3000 - d * 85);
  const matchRate = 0.3;
  return { n, trials, stimMs, matchRate };
}

// Pozitsiyalar ketma-ketligini matchRate'ga moslab generatsiya qiladi.
// Qaytadi: {positions, matchFlags} — matchFlags[i] = (positions[i]===positions[i-n]).
export function generateSequence(p: SequenceParams): {
  positions: number[];
  matchFlags: boolean[];
} {
  const positions: number[] = [];
  const matchFlags: boolean[] = [];
  for (let i = 0; i < p.trials; i++) {
    let pos: number;
    if (i >= p.n && Math.random() < p.matchRate) {
      pos = positions[i - p.n]; // majburiy mos
    } else if (i >= p.n) {
      // mos EMAS — N orqadagidan farqli tanlash (nazoratli ulush)
      do {
        pos = Math.floor(Math.random() * 9);
      } while (pos === positions[i - p.n]);
    } else {
      pos = Math.floor(Math.random() * 9);
    }
    positions.push(pos);
    matchFlags.push(i >= p.n && pos === positions[i - p.n]);
  }
  return { positions, matchFlags };
}
