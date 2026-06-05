// O'yin "feel" qatlami — ball / kombo / feedback.
//
// MUHIM (halol-data): bu MOTIVATSION ko'rsatkich, adaptiv qiyinlik (D) va
// performance hisobiga TA'SIR QILMAYDI. D hamon faqat accuracy+speedScore'dan
// hisoblanadi (AdaptiveController). Ball — o'yinni qiziqroq qiladi, xolos.

export const BASE_POINTS = 100;
/** Kombo har 3 to'g'rida bir pog'ona oshadi; ko'paytirgich 4x bilan cheklangan. */
export const MAX_MULTIPLIER = 4;

export function comboMultiplier(combo: number): number {
  // 0–2 → 1x, 3–5 → 1.5x, 6–8 → 2x, ... 4x bilan cheklangan
  const m = 1 + Math.floor(combo / 3) * 0.5;
  return Math.min(MAX_MULTIPLIER, m);
}

/** speedFrac: 0..1 (1 = darrov javob). Tez javobga bonus. */
export function pointsFor(combo: number, speedFrac = 0): number {
  const speedBonus = Math.round(BASE_POINTS * 0.6 * clamp01(speedFrac));
  return Math.round((BASE_POINTS + speedBonus) * comboMultiplier(combo));
}

/** Javob sifati — feedback ohangini tanlash uchun. */
export type HitTier = 'great' | 'good' | 'miss';

export function tierFor(ok: boolean, speedFrac = 0): HitTier {
  if (!ok) return 'miss';
  return speedFrac >= 0.6 ? 'great' : 'good';
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
