'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { paramsForLevel, type MathParams } from './params';
import { generateProblem, type MathProblem } from './generate';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

const DRILL_ID = 'math';

export default function MathGame() {
  const t = useTranslations('math');
  const tg = useTranslations('game');
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [params, setParams] = useState<MathParams>(() => paramsForLevel(1));
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
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

  const showTrial = useCallback((p: MathParams) => {
    setProblem(generateProblem(p));
    setFlash(null);
    shownRef.current = performance.now();
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      feel.register(false);
      loseLifeRef.current();
    }, p.trialMs);
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
    (value: number) => {
      if (!problem || flash !== null) return;
      clearTimer();
      const rt = performance.now() - shownRef.current;
      const ok = value === problem.answer;
      feel.register(ok, 1 - rt / params.trialMs);
      setFlash(value);
      if (!ok) {
        window.setTimeout(() => loseLife(), 350);
        return;
      }
      stagesRef.current += 1;
      const lvl = curLevel();
      setRunLevel(lvl);
      setIndex((n) => n + 1);
      const p = paramsForLevel(lvl);
      setParams(p);
      window.setTimeout(() => showTrial(p), 200);
    },
    [problem, flash, params, feel, loseLife, showTrial],
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

      <div className="num relative flex min-h-[24vh] w-full items-center justify-center overflow-hidden rounded-3xl bg-surface/40">
        <span
          key={index}
          className="t-display animate-stim text-5xl font-semibold text-ink"
        >
          {problem?.expr} <span className="text-muted">=</span> ?
        </span>
        <span
          key={`bar-${index}`}
          className="absolute bottom-0 left-0 h-1 bg-accent"
          style={{ animation: `shrink-bar ${params.trialMs}ms linear forwards` }}
        />
      </div>

      <p className="text-center text-sm text-muted">{t('instruction')}</p>

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {problem?.choices.map((c) => {
          const isAnswer = flash !== null && c === problem.answer;
          const isWrongPick = flash === c && c !== problem.answer;
          return (
            <button
              key={c}
              onClick={() => choose(c)}
              className={[
                'num rounded-2xl py-5 text-2xl font-semibold transition-colors active:scale-95',
                isAnswer
                  ? 'bg-accent text-bg'
                  : isWrongPick
                    ? 'bg-danger text-bg'
                    : 'bg-surface2 text-ink',
              ].join(' ')}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
