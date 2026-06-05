// Matematika (Mantiq) — D → parametr (CLAUDE.md §4.3)
// operand kattaligi 10^(1+floor(D/5)); amal soni; manfiy sonlar; vaqt qisqaradi.

export interface MathParams {
  /** operand yuqori chegarasi */
  maxOperand: number;
  /** ifodadagi amallar soni */
  ops: number;
  /** manfiy sonlarga ruxsat */
  allowNegative: boolean;
  /** har sinov uchun vaqt limiti (ms) */
  trialMs: number;
  /** raunddagi sinovlar soni */
  trials: number;
}

export function paramsForLevel(D: number): MathParams {
  const d = Math.max(1, Math.floor(D));
  const maxOperand = Math.pow(10, 1 + Math.floor(d / 5)); // 10,100,1000,...
  const ops = Math.min(5, 1 + Math.floor(d / 4)); // 1→5 amalgacha
  const allowNegative = d >= 6;
  // 12s dan 3s gacha — zudlik bilan hisoblash.
  const trialMs = Math.max(3000, 12000 - d * 450);
  // 8 dan 12 gacha — uzunroq raund.
  const trials = Math.min(12, 8 + Math.floor(d / 5));
  return { maxOperand, ops, allowNegative, trialMs, trials };
}
