'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { paramsForLevel, type MemoryParams } from './params';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import { speedScoreFromTime } from '@/drills/engine/performance';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

const DRILL_ID = 'memory';

function pickCells(total: number, k: number): Set<number> {
  const idx = Array.from({ length: total }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return new Set(idx.slice(0, k));
}

type Phase = 'memorize' | 'recall';

export default function MemoryGame() {
  const t = useTranslations('memory');
  const tc = useTranslations('common');
  const tg = useTranslations('game');
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [params, setParams] = useState<MemoryParams>(() => paramsForLevel(1));
  const [target, setTarget] = useState<Set<number>>(new Set());
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<Phase>('memorize');
  // SURVIVAL: to'g'ri topsa keyingi bosqich; 3 xato (jon) tugasa o'yin tugaydi.
  const [runLevel, setRunLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const stagesRef = useRef(0);
  // Bitta jadval davomida ko'p xato qilinsa ham faqat 1 jon ketadi.
  const mistakeThisStageRef = useRef(false);
  // Bosqichlar orasidagi pauzada bosishlarни bloklaydi (nohaq jon ketmasin).
  const lockRef = useRef(false);
  const startRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  // Bitta bosqich (feel'ni tozalamaydi — ball to'planib boradi).
  const startStage = useCallback((D: number) => {
    const p = paramsForLevel(D);
    setParams(p);
    setTarget(pickCells(p.n * p.n, p.cells));
    setPicked(new Set());
    mistakeThisStageRef.current = false;
    lockRef.current = false;
    setPhase('memorize');
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setPhase('recall');
      startRef.current = performance.now();
    }, p.showMs);
  }, []);

  // Yangi o'yin: ball/bosqich noldan.
  const beginRun = useCallback(
    (D: number) => {
      feel.reset();
      stagesRef.current = 0;
      livesRef.current = 3;
      setLives(3);
      setRunLevel(D);
      startStage(D);
    },
    [feel, startStage],
  );

  useEffect(() => {
    if (ready) beginRun(state.D);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // faqat tayyor bo'lганda bir marta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onCell = useCallback(
    (i: number) => {
      if (phase !== 'recall' || picked.has(i) || lockRef.current) return;
      const correct = target.has(i);
      feel.register(correct);

      // ❌ Xato katak → 1 jon ketadi va DARHOL keyingi jadvalga o'tadi
      // (qotib qolmaydi). 3 jon tugasa — o'yin tugaydi.
      if (!correct) {
        setPicked((prev) => new Set(prev).add(i)); // qizil ko'rsatamiz
        lockRef.current = true;
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        if (livesRef.current <= 0) {
          const stages = stagesRef.current;
          const accuracy = Math.max(0, Math.min(1, 0.45 + stages * 0.08));
          finish({ accuracy, speedScore: accuracy, meta: { stages } });
          return;
        }
        // jon qoldi → o'sha darajada yangi jadval (qiyinlashmaydi).
        timerRef.current = window.setTimeout(() => startStage(runLevel), 650);
        return;
      }

      // ✅ To'g'ri katak.
      const nextPicked = new Set(picked).add(i);
      setPicked(nextPicked);
      const found = [...nextPicked].filter((x) => target.has(x)).length;

      // Bosqichdagi hamma to'g'ri katak topildi → keyingi bosqich (qiyinroq).
      if (found === target.size) {
        lockRef.current = true; // pauzada qo'shimcha bosishlar bloklanadi
        stagesRef.current += 1;
        const nextLevel = runLevel + 1;
        setRunLevel(nextLevel);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => startStage(nextLevel), 450);
      }
    },
    [phase, picked, target, runLevel, finish, feel, startStage],
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

  const cellCount = params.n * params.n;
  return (
    <div className="flex flex-col items-center gap-5 px-4 py-6">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={runLevel} lives={lives} progress={`${params.n}×${params.n}`} />

      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {phase === 'memorize' ? t('memorize') : t('recall')}
      </span>

      <div
        className="grid w-full max-w-md gap-2"
        style={{ gridTemplateColumns: `repeat(${params.n}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cellCount }, (_, i) => {
          const lit = phase === 'memorize' && target.has(i);
          const chosen = picked.has(i);
          const isHit = chosen && target.has(i);
          const isMiss = chosen && !target.has(i);
          const active = lit || isHit;
          return (
            <button
              key={i}
              onClick={() => onCell(i)}
              className={[
                'aspect-square rounded-xl transition-all duration-200 active:scale-90',
                active
                  ? 'bg-accent'
                  : isMiss
                    ? 'bg-danger'
                    : 'bg-surface2 hover:bg-line',
              ].join(' ')}
              style={
                active
                  ? { boxShadow: '0 0 18px rgba(77,141,255,0.55)' }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
