import type { AdaptiveState, RoundResult } from './types';
import { computePerformance } from './performance';

// Flow-zone kontrolleri (CLAUDE.md §4.1)
// Maqsad performance oralig'i 0.75–0.85.
export const RAISE_THRESHOLD = 0.85; // bundan yuqori → qiyinlashtir
export const LOWER_THRESHOLD = 0.7; // bundan past → osonlashtir
export const HISTORY_LEN = 10;

export interface ApplyOutcome {
  state: AdaptiveState;
  performance: number;
  direction: 'up' | 'down' | 'same';
  step: number;
}

export function initialState(D = 1): AdaptiveState {
  return { D: Math.max(1, Math.floor(D)), history: [], streak: 0 };
}

/**
 * Raund natijasini qo'llab, yangi darajani hisoblaydi.
 * D cheksiz o'sadi (yuqori chegara yo'q), pastda 1 da to'xtaydi.
 */
export function applyRound(state: AdaptiveState, result: RoundResult): ApplyOutcome {
  const performance = computePerformance(result);

  // Ketma-ket yuqori natijada step tezlashadi (1 → 2), §4.1
  const nextStreak = performance > RAISE_THRESHOLD ? state.streak + 1 : 0;
  const step = nextStreak >= 3 ? 2 : 1;

  let D = state.D;
  let direction: ApplyOutcome['direction'] = 'same';

  if (performance > RAISE_THRESHOLD) {
    D = state.D + step;
    direction = 'up';
  } else if (performance < LOWER_THRESHOLD) {
    D = Math.max(1, state.D - step);
    direction = 'down';
  }

  const history = [...state.history, performance].slice(-HISTORY_LEN);

  return {
    state: { D, history, streak: nextStreak },
    performance,
    direction,
    step,
  };
}

/** Baseline sinovdan boshlang'ich D ni taxmin qilish (§4.2). */
export function estimateStartingLevel(baselinePerformance: number): number {
  // 0.5 atrofidagi natija D≈1; yuqori baseline → kattaroq boshlang'ich D.
  const p = Math.max(0, Math.min(1, baselinePerformance));
  return Math.max(1, Math.round(1 + p * 8));
}
