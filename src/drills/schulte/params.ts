// Shulte (E'tibor) — DINAMIK VAQTLI rejim.
// Vaqt teskari hisoblanadi. To'g'ri raqam bosilsa — yo'qoladi, o'rniga yangi
// (kattaroq) raqam chiqadi. Maqsad raqami 1, 2, 3... cheksiz o'sadi.
// Ball = vaqt ichida topilgan raqamlar soni. Raqamlar doimiy o'zgargani uchun
// joyini yodlab bo'lmaydi — sof vizual qidiruv + periferik ko'rish.

export interface SchulteParams {
  /** grid tomoni (n×n) */
  n: number;
  /** katakcha soni */
  count: number;
  /** rang-shovqin (chalg'ituvchi ranglar) yoqilgan? */
  colorNoise: boolean;
  /** raund davomiyligi (ms) — teskari hisoblagich */
  durationMs: number;
  /** bir raqam topish uchun maqsadli vaqt (ms) — speedScore bazasi */
  targetPerFindMs: number;
}

export function paramsForLevel(D: number): SchulteParams {
  const d = Math.max(1, Math.floor(D));
  // 4×4 dan yumshoq boshlanadi (dinamik rejim allaqachon qiyin):
  // 6-darajada 5×5, 11-darajada 6×6 ... cheksiz.
  const n = 4 + Math.floor((d - 1) / 5);
  const count = n * n;
  const colorNoise = d >= 6; // chalg'ituvchi ranglar (5×5 dan keyin)
  const durationMs = 40000; // 40s sprint
  // Yuqori darajada har raqamga kamroq vaqt kutiladi (ko'proq topish kerak).
  const targetPerFindMs = Math.max(650, 1500 - d * 45);
  return { n, count, colorNoise, durationMs, targetPerFindMs };
}
