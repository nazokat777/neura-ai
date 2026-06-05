'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  paramsForLevel,
  generateSequence,
  type SequenceParams,
} from './params';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

const DRILL_ID = 'sequence';

export default function SequenceGame() {
  const t = useTranslations('sequence');
  const tg = useTranslations('game');
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [params, setParams] = useState<SequenceParams>(() => paramsForLevel(1));
  const [index, setIndex] = useState(-1);
  const [active, setActive] = useState<number | null>(null);

  const seqRef = useRef<{ positions: number[]; matchFlags: boolean[] }>({
    positions: [],
    matchFlags: [],
  });
  const respondedRef = useRef(false);
  const trialStartRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  // SURVIVAL: omon qolgan trial'lar soni. 3 jon (false alarm yoki miss) tugasa → tugadi.
  const stagesRef = useRef(0);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const endGame = useCallback(() => {
    clearTimer();
    setActive(null);
    const stages = stagesRef.current;
    const accuracy = Math.max(0, Math.min(1, 0.45 + stages * 0.04));
    finish({ accuracy, speedScore: accuracy, meta: { stages, nBack: params.n } });
  }, [finish, params.n]);

  // Jon ketdi: 3 tasi tugasa o'yin tugaydi, qaytaradi true=tugadi.
  const loseLife = useCallback((): boolean => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    if (livesRef.current <= 0) {
      endGame();
      return true;
    }
    return false;
  }, [endGame]);

  const nextTrial = useCallback(
    (i: number, p: SequenceParams) => {
      if (i >= seqRef.current.positions.length) {
        // ketma-ketlik tugadi (kamdan-kam) — omon qoldi
        endGame();
        return;
      }
      setIndex(i);
      setActive(seqRef.current.positions[i]);
      respondedRef.current = false;
      trialStartRef.current = performance.now();
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        if (!respondedRef.current) {
          if (seqRef.current.matchFlags[i]) {
            // mos kelishni o'tkazib yubordi → jon ketadi
            feel.register(false);
            if (loseLife()) return;
          } else {
            // to'g'ri rad (jim turdi) → omon qoldi
            stagesRef.current += 1;
          }
        }
        nextTrial(i + 1, p);
      }, p.stimMs);
    },
    [endGame, feel, loseLife],
  );

  const beginRun = useCallback(
    (D: number) => {
      const p = paramsForLevel(D);
      setParams(p);
      // Uzun ketma-ketlik — survival uchun chegara amalda yo'q.
      seqRef.current = generateSequence({ ...p, trials: 999 });
      stagesRef.current = 0;
      livesRef.current = 3;
      setLives(3);
      feel.reset();
      nextTrial(0, p);
    },
    [nextTrial, feel],
  );

  useEffect(() => {
    if (ready) beginRun(state.D);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onMatch = useCallback(() => {
    if (respondedRef.current || active === null || index < 0) return;
    respondedRef.current = true;
    const rt = performance.now() - trialStartRef.current;
    if (seqRef.current.matchFlags[index]) {
      // to'g'ri MOS → omon qoldi
      stagesRef.current += 1;
      feel.register(true, 1 - rt / params.stimMs);
    } else {
      // noto'g'ri tugma (false alarm) → jon ketadi (timer keyingisiga o'tkazadi)
      feel.register(false);
      loseLife();
    }
  }, [active, index, params, feel, loseLife]);

  if (summary) {
    const stages = summary.result.meta?.stages ?? 0;
    const m = summary.result.meta as { nBack?: number } | undefined;
    return (
      <ResultPanel
        outcome={summary.outcome}
        stats={[
          { label: tg('stages'), value: `${stages}` },
          { label: t('nBackShort'), value: `${m?.nBack ?? params.n}` },
          { label: tg('score'), value: `${feel.score}` },
          { label: tg('maxCombo'), value: `×${feel.maxCombo}` },
        ]}
        onContinue={() => {
          nextRound();
          beginRun(summary.outcome.state.D);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={state.D} lives={lives} progress={`#${Math.max(0, index) + 1}`} />

      {/* N-orqa ko'rsatkichi — asosiy qiyinlik o'lchovi */}
      <span className="rounded-full border border-accent/50 bg-accent/10 px-4 py-1.5 text-[13px] font-semibold text-accent">
        {t('nBack', { n: params.n })}
      </span>

      {/* 3×3 stimul katagi */}
      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {Array.from({ length: 9 }, (_, i) => {
          const on = active === i;
          return (
            <div
              key={i}
              className={[
                'aspect-square rounded-2xl transition-all duration-150',
                on ? 'bg-accent' : 'bg-surface2',
              ].join(' ')}
              style={
                on
                  ? { boxShadow: '0 0 26px rgba(77,141,255,0.6)' }
                  : undefined
              }
            >
              {on && <span key={index} className="block h-full w-full animate-stim" />}
            </div>
          );
        })}
      </div>

      <p className="max-w-[20rem] text-center text-sm text-muted">
        {t('instruction', { n: params.n })}
      </p>

      {/* MOS tugmasi */}
      <button
        onClick={onMatch}
        className="w-full max-w-xs rounded-2xl bg-accent py-6 text-xl font-semibold text-bg transition-transform active:scale-95"
      >
        {t('match')}
      </button>
    </div>
  );
}
