'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applyRound,
  initialState,
  type ApplyOutcome,
} from './AdaptiveController';
import type { AdaptiveState, RoundResult } from './types';
import {
  loadDifficulty,
  saveDifficulty,
  saveBest,
  saveLast,
  incSynapses,
  pushHistory,
  recordActivity,
} from '@/lib/storage';
import { fxLevelUp, fxFinish } from '@/lib/feedback';

export interface DrillSummary {
  outcome: ApplyOutcome;
  result: RoundResult;
}

/**
 * Har mashq uchun umumiy adaptiv qatlam (CLAUDE.md §4):
 * lokaldan D ni yuklaydi, raund natijasini engine'ga beradi, saqlaydi.
 */
export function useDrill(drillId: string) {
  const [state, setState] = useState<AdaptiveState>(() => initialState(1));
  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState<DrillSummary | null>(null);

  useEffect(() => {
    setState(loadDifficulty(drillId));
    setReady(true);
  }, [drillId]);

  /** Raund natijasini qo'llab, yangi darajani saqlaydi. */
  const finish = useCallback(
    (result: RoundResult) => {
      const outcome = applyRound(state, result);
      const at = Date.now();
      saveDifficulty(drillId, outcome.state);
      saveBest(drillId, Math.round(outcome.performance * 1000));
      saveLast(drillId, {
        performance: outcome.performance,
        level: outcome.state.D,
        at,
      });
      incSynapses(drillId); // sinaps faolligi (jami raundlar) +1
      pushHistory(drillId, {
        at,
        performance: outcome.performance,
        level: outcome.state.D,
      });
      recordActivity(); // kunlik streak
      // Ovozli mukofot: daraja oshsa akkord, aks holda yumshoq tasdiq
      if (outcome.direction === 'up') fxLevelUp();
      else fxFinish();
      setState(outcome.state);
      setSummary({ outcome, result });
      return outcome;
    },
    [drillId, state],
  );

  /** Keyingi raundga o'tish (natija ekranidan). */
  const nextRound = useCallback(() => setSummary(null), []);

  return { state, ready, summary, finish, nextRound };
}
