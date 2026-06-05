'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { generateSequence, type SeqProblem } from './generate';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

const DRILL_ID = 'iq';

function trialMsFor(D: number): number {
  return Math.max(6000, 15000 - Math.floor(D) * 500);
}

export default function IqGame() {
  const t = useTranslations('iq');
  const tg = useTranslations('game');
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [problem, setProblem] = useState<SeqProblem | null>(null);
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  // SURVIVAL: to'g'ri → keyingi bosqich (har 3 da qiyinroq); 3 jon tugasa → tugadi.
  const [runLevel, setRunLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const baseDRef = useRef(1);
  const stagesRef = useRef(0);
  const shownRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const trialMsRef = useRef(trialMsFor(1));
  const loseLifeRef = useRef<() => void>(() => {});

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const endGame = useCallback(() => {
    clearTimer();
    const stages = stagesRef.current;
    const accuracy = Math.max(0, Math.min(1, 0.45 + stages * 0.06));
    finish({ accuracy, speedScore: accuracy, meta: { stages } });
  }, [finish]);

  const showTrial = useCallback((D: number) => {
    trialMsRef.current = trialMsFor(D);
    setProblem(generateSequence(D));
    setFlash(null);
    shownRef.current = performance.now();
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      feel.register(false);
      loseLifeRef.current();
    }, trialMsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const curLevel = () => baseDRef.current + Math.floor(stagesRef.current / 3);

  const loseLife = useCallback(() => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    if (livesRef.current <= 0) {
      endGame();
      return;
    }
    showTrial(curLevel());
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
      showTrial(D);
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
      const ok = value === problem.answer;
      const rt = performance.now() - shownRef.current;
      feel.register(ok, 1 - rt / trialMsRef.current);
      setFlash(value);
      if (!ok) {
        window.setTimeout(() => loseLife(), 400);
        return;
      }
      stagesRef.current += 1;
      const lvl = curLevel();
      setRunLevel(lvl);
      setIndex((n) => n + 1);
      window.setTimeout(() => showTrial(lvl), 250);
    },
    [problem, flash, feel, loseLife, showTrial],
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
    <div className="flex flex-col items-center gap-7 px-4 py-8">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={runLevel} lives={lives} progress={`#${index + 1}`} />

      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {t('whichNext')}
      </span>

      <div className="num flex min-h-[18vh] w-full items-center justify-center rounded-3xl bg-surface/40 px-4">
        <span key={index} className="t-display animate-stim text-center text-4xl font-semibold text-ink">
          {problem?.display}<span className="text-muted">,  ?</span>
        </span>
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {problem?.choices.map((c) => {
          const isAnswer = flash !== null && c === problem.answer;
          const isWrong = flash === c && c !== problem.answer;
          return (
            <button
              key={c}
              onClick={() => choose(c)}
              className={[
                'num rounded-2xl py-5 text-2xl font-semibold transition-colors active:scale-95',
                isAnswer ? 'bg-accent text-bg' : isWrong ? 'bg-danger text-bg' : 'bg-surface2 text-ink',
              ].join(' ')}
            >
              {c}
            </button>
          );
        })}
      </div>

      <p className="max-w-[20rem] text-center text-[11px] leading-relaxed text-muted">
        {t('honest')}
      </p>
    </div>
  );
}
