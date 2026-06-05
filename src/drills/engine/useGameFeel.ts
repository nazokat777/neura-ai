'use client';

import { useCallback, useRef, useState } from 'react';
import {
  comboMultiplier,
  pointsFor,
  tierFor,
  type HitTier,
} from './scoring';
import { fxHit, fxMiss, fxComboUp } from '@/lib/feedback';

export interface GainEvent {
  /** Har hodisa uchun noyob — animatsiyani qayta ishga tushiradi. */
  id: number;
  value: number; // qo'shilgan ball (miss = 0)
  tier: HitTier;
  multiplier: number;
}

export interface GameFeel {
  score: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  last: GainEvent | null;
  /** Javobni qayd etadi; qo'shilgan ballni qaytaradi. */
  register: (ok: boolean, speedFrac?: number) => number;
  reset: () => void;
}

// Ball/kombo holatini boshqaradigan yengil hook. Har mashqда bir xil his.
export function useGameFeel(): GameFeel {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [last, setLast] = useState<GainEvent | null>(null);
  const idRef = useRef(0);
  const comboRef = useRef(0);

  const register = useCallback((ok: boolean, speedFrac = 0): number => {
    idRef.current += 1;
    if (!ok) {
      comboRef.current = 0;
      setCombo(0);
      setLast({ id: idRef.current, value: 0, tier: 'miss', multiplier: 1 });
      fxMiss();
      return 0;
    }
    const curCombo = comboRef.current;
    const gain = pointsFor(curCombo, speedFrac);
    const mult = comboMultiplier(curCombo);
    const nextMult = comboMultiplier(curCombo + 1);
    comboRef.current = curCombo + 1;
    // ko'paytirgich oshganда — arpeggio; aks holda oddiy hit
    if (nextMult > mult) fxComboUp(Math.round((nextMult - 1) * 2));
    else fxHit(curCombo, speedFrac >= 0.6);
    setScore((s) => s + gain);
    setCombo(comboRef.current);
    setMaxCombo((m) => Math.max(m, comboRef.current));
    setLast({
      id: idRef.current,
      value: gain,
      tier: tierFor(true, speedFrac),
      multiplier: mult,
    });
    return gain;
  }, []);

  const reset = useCallback(() => {
    comboRef.current = 0;
    idRef.current = 0;
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLast(null);
  }, []);

  return {
    score,
    combo,
    maxCombo,
    multiplier: comboMultiplier(combo),
    last,
    register,
    reset,
  };
}
