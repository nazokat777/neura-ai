// Audio-Xotira (Simon) — eshitilgan ketma-ketlikni qayta ber.
// Ishchi xotira + eshitish-motor zanjiri.

export interface AudioParams {
  /** ketma-ketlik uzunligi */
  seqLen: number;
  /** notalar orasidagi tinim (ms) */
  gapMs: number;
}

export function paramsForLevel(D: number): AudioParams {
  const d = Math.max(1, Math.floor(D));
  const seqLen = Math.min(9, 3 + Math.floor(d / 2));
  const gapMs = Math.max(180, 520 - d * 20);
  return { seqLen, gapMs };
}
