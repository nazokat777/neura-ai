'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { paramsForLevel, type SpeedParams } from './params';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

const DRILL_ID = 'speed';

export default function SpeedGame() {
  const t = useTranslations('speed');
  const tg = useTranslations('game');
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [params, setParams] = useState<SpeedParams>(() => paramsForLevel(1));
  const [dir, setDir] = useState<'left' | 'right' | null>(null);
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  // SURVIVAL: to'g'ri → keyingi bosqich; 3 jon tugasa → tugadi.
  const [runLevel, setRunLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const baseDRef = useRef(1);
  const stagesRef = useRef(0);
  const shownRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const loseLifeRef = useRef<() => void>(() => {});

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const endGame = useCallback(() => {
    clearTimer();
    const stages = stagesRef.current;
    const accuracy = Math.max(0, Math.min(1, 0.45 + stages * 0.05));
    finish({ accuracy, speedScore: accuracy, meta: { stages } });
  }, [finish]);

  const showTrial = useCallback((p: SpeedParams) => {
    const d = Math.random() < 0.5 ? 'left' : 'right';
    setDir(d);
    shownRef.current = performance.now();
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      // oyna o'tib ketdi → jon ketadi
      feel.register(false);
      setFlash('bad');
      window.setTimeout(() => setFlash(null), 150);
      loseLifeRef.current();
    }, p.windowMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const curLevel = () => baseDRef.current + Math.floor(stagesRef.current / 5);

  const loseLife = useCallback(() => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    if (livesRef.current <= 0) {
      endGame();
      return;
    }
    showTrial(paramsForLevel(curLevel()));
  }, [endGame, showTrial]);
  loseLifeRef.current = loseLife;

  const beginRun = useCallback(
    (D: number) => {
      baseDRef.current = D;
      stagesRef.current = 0;
      livesRef.current = 3;
      setLives(3);
      setIndex(0);
      setRunLevel(D);
      feel.reset();
      const p = paramsForLevel(D);
      setParams(p);
      showTrial(p);
    },
    [showTrial, feel],
  );

  useEffect(() => {
    if (ready) beginRun(state.D);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const choose = useCallback(
    (choice: 'left' | 'right') => {
      if (!dir) return;
      clearTimer();
      const rt = performance.now() - shownRef.current;
      const ok = choice === dir;
      feel.register(ok, 1 - rt / params.windowMs);
      setFlash(ok ? 'ok' : 'bad');
      window.setTimeout(() => setFlash(null), 120);
      if (!ok) {
        loseLife();
        return;
      }
      stagesRef.current += 1;
      setIndex((n) => n + 1);
      const lvl = curLevel();
      const p = paramsForLevel(lvl);
      setRunLevel(lvl);
      setParams(p);
      showTrial(p);
    },
    [dir, params, feel, loseLife, showTrial],
  );

  if (summary) {
    const stages = summary.result.meta?.stages ?? 0;
    return (
      <ResultPanel
        outcome={summary.outcome}
        stats={[
          { label: tg('stages'), value: `${stages}` },
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
    <div className="flex flex-col items-center gap-8 px-4 py-8">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={runLevel} lives={lives} progress={`#${index + 1}`} />

      <div
        className={[
          'relative flex min-h-[30vh] w-full items-center justify-center overflow-hidden rounded-3xl text-8xl transition-colors duration-150',
          flash === 'ok'
            ? 'bg-accent-dim'
            : flash === 'bad'
              ? 'bg-danger-dim'
              : 'bg-surface',
        ].join(' ')}
      >
        {/* qaror oynasi — qisqaruvchi vaqt chizig'i */}
        <span
          key={index}
          className="animate-stim text-ink"
          style={{ textShadow: '0 0 24px rgba(77,141,255,0.35)' }}
        >
          {dir === 'left' ? '←' : dir === 'right' ? '→' : ''}
        </span>
        <span
          key={`bar-${index}`}
          className="absolute bottom-0 left-0 h-1 bg-accent"
          style={{ animation: `shrink-bar ${params.windowMs}ms linear forwards` }}
        />
      </div>

      <p className="text-center text-sm text-muted">{t('instruction')}</p>

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        <button
          onClick={() => choose('left')}
          className="rounded-2xl bg-surface2 py-6 text-2xl font-semibold text-ink transition-transform active:scale-90"
        >
          ←
        </button>
        <button
          onClick={() => choose('right')}
          className="rounded-2xl bg-surface2 py-6 text-2xl font-semibold text-ink transition-transform active:scale-90"
        >
          →
        </button>
      </div>
    </div>
  );
}
