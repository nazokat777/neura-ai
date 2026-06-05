import type { RoundResult } from './types';

// Performance hisoblash (CLAUDE.md §4.1)
// performance = w1*accuracy + w2*speedScore ; w1≈0.6, w2≈0.4
export const W_ACCURACY = 0.6;
export const W_SPEED = 0.4;

/** 0..1 oralig'iga qisish — yaroqsiz kirishdan himoya. */
export function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

/** Raund natijasidan performance (0..1). */
export function computePerformance(r: RoundResult): number {
  return clamp01(W_ACCURACY * clamp01(r.accuracy) + W_SPEED * clamp01(r.speedScore));
}

/**
 * Tezlik bahosi: o'lchangan vaqtni "maqsad" vaqtga nisbatan normallashtirish.
 * actual <= target → 1.0 ; actual >> target → 0 ga intiladi.
 * Halol: hech qachon soxta bonus yo'q, faqat o'lchangan vaqtdan.
 */
export function speedScoreFromTime(actualMs: number, targetMs: number): number {
  if (actualMs <= 0 || targetMs <= 0) return 0;
  // target da ~0.85, ikki barobar sekinda ~0.4 beradigan silliq egri.
  return clamp01(targetMs / (targetMs + Math.max(0, actualMs - targetMs)));
}
