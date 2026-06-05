// Motor kategoriyasi — barcha o'yinlar bitta "reaksiya-teginish" dvigatelidan.
// Yongan katak(lar)ni imkon qadar tez bosish: nozik motorika + ko'z-qo'l
// koordinatsiyasi (motor korteks + serebellum). Manba: Doyon & Benali, 2005.
//
// Rejimlar:
//  reaction — tasodifiy bitta nishon (grid bo'ylab) → fazoviy reaksiya
//  row      — bitta nishon qator bo'ylab → tez barmoq teginishlari
//  duo      — 2 katta panel navbatma-navbat → ritmik teginish
//  rhythm   — nishon barqaror sur'atda → vaqt sinxronizatsiyasi
//  mirror   — yongan katak + uning oynaviy juftini bosish → bimanual

export type MotorMode = 'reaction' | 'row' | 'duo' | 'rhythm' | 'mirror';

export interface MotorConfig {
  id: string;
  mode: MotorMode;
  cols: number;
  rows: number;
}

export const MOTOR_CONFIGS: Record<string, MotorConfig> = {
  eyeHand: { id: 'eyeHand', mode: 'reaction', cols: 4, rows: 4 },
  fingerDance: { id: 'fingerDance', mode: 'row', cols: 5, rows: 1 },
  palmClash: { id: 'palmClash', mode: 'duo', cols: 2, rows: 1 },
  neuroSync: { id: 'neuroSync', mode: 'rhythm', cols: 3, rows: 3 },
  mirrorDraw: { id: 'mirrorDraw', mode: 'mirror', cols: 4, rows: 2 },
};

export interface MotorParams {
  trials: number;
  windowMs: number;
}

export function motorParams(D: number): MotorParams {
  const d = Math.max(1, Math.floor(D));
  const trials = Math.min(28, 14 + Math.floor(d / 3));
  const windowMs = Math.max(620, 1700 - d * 55);
  return { trials, windowMs };
}

/** Grid ichida indeksning gorizontal oynaviy jufti. */
export function mirrorIndex(i: number, cols: number): number {
  const row = Math.floor(i / cols);
  const col = i % cols;
  return row * cols + (cols - 1 - col);
}
