// Adaptiv engine — umumiy tiplar (CLAUDE.md §4)

/** Bitta raund natijasi — har mashq shuni qaytaradi. */
export interface RoundResult {
  /** 0..1 — to'g'ri javoblar ulushi */
  accuracy: number;
  /** 0..1 — tezlik bahosi (1 = juda tez). Mashq o'zi normallashtiradi. */
  speedScore: number;
  /** Ixtiyoriy xom o'lchovlar (tahlil/halol-data uchun) */
  meta?: Record<string, number>;
}

/** Har mashq bitta darajani aniq parametrlarга aylantiradi. */
export type ParamsForLevel<P> = (D: number) => P;

/** Mashq ta'rifi — registry uchun. */
export interface DrillDefinition<P> {
  id: string;
  /** D ≥ 1 → parametrlar (cheksiz masshtablanadi, §4.3) */
  paramsForLevel: ParamsForLevel<P>;
}

export interface AdaptiveState {
  /** Joriy butun daraja, D ≥ 1 */
  D: number;
  /** Oxirgi ~10 raund performance qiymati (eng yangisi oxirida) */
  history: number[];
  /** Ketma-ket yuqori natijalar soni (step tezlashtirish uchun) */
  streak: number;
}
