'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { paramsForLevel, GLYPHS, type PictogramParams } from './params';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

const DRILL_ID = 'pictogram';

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function PictogramGame() {
  const t = useTranslations('pictogram');
  const tg = useTranslations('game');
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [params, setParams] = useState<PictogramParams>(() => paramsForLevel(1));
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [targets, setTargets] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  // SURVIVAL: barcha piktogrammani topsa → keyingi bosqich; 3 jon tugasa → tugadi.
  const [runLevel, setRunLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const stagesRef = useRef(0);

  const startRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  // Bosqichlar orasidagi pauzada bosishlarни bloklaydi (nohaq jon ketmasin).
  const lockRef = useRef(false);

  const startRound = useCallback(
    (D: number, fresh = false) => {
      const p = paramsForLevel(D);
      setParams(p);
      setRunLevel(D);
      if (fresh) {
        feel.reset();
        stagesRef.current = 0;
        livesRef.current = 3;
        setLives(3);
      }
      const pool = shuffle(GLYPHS);
      const tg2 = pool.slice(0, p.count);
      const distractors = pool.slice(p.count, p.count * 2);
      setTargets(tg2);
      setGrid(shuffle([...tg2, ...distractors]));
      setPicked(new Set());
      lockRef.current = false;
      setPhase('memorize');
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setPhase('recall');
        startRef.current = performance.now();
      }, p.memMs);
    },
    [feel],
  );

  useEffect(() => {
    if (ready) startRound(state.D, true);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const endGame = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const stages = stagesRef.current;
    const accuracy = Math.max(0, Math.min(1, 0.45 + stages * 0.05));
    finish({ accuracy, speedScore: accuracy, meta: { stages } });
  }, [finish]);

  const toggle = useCallback(
    (g: string) => {
      if (phase !== 'recall' || picked.has(g) || lockRef.current) return;
      const ok = targets.includes(g);
      const next = new Set(picked).add(g);
      setPicked(next);
      feel.register(ok);
      if (!ok) {
        // ❌ Xato piktogramma → jon ketadi. 3 jon tugasa o'yin tugaydi.
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) endGame();
        // jon qolsa — qolgan to'g'ri belgilarni tanlashda davom etadi.
        return;
      }
      const correct = [...next].filter((x) => targets.includes(x)).length;
      if (correct >= params.count) {
        // ✅ Hammasi topildi → keyingi bosqich (ko'proq), ball saqlanadi.
        lockRef.current = true; // pauzada qo'shimcha bosishlar bloklanadi
        stagesRef.current += 1;
        if (timerRef.current) window.clearTimeout(timerRef.current);
        window.setTimeout(() => startRound(runLevel + 1, false), 450);
      }
    },
    [phase, picked, targets, params, feel, endGame, runLevel, startRound],
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
          startRound(summary.outcome.state.D, true);
        }}
      />
    );
  }

  if (phase === 'memorize') {
    return (
      <div className="flex flex-col items-center gap-5 px-4 py-6">
        <FeelHud feel={feel} level={runLevel} lives={lives} progress={`${params.count}`} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('memorize')}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-3xl border border-line bg-surface/40 p-6">
          {targets.map((g, i) => (
            <span key={i} className="text-5xl">{g}</span>
          ))}
        </div>
        <p className="text-center text-sm text-muted">{t('instruction')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 px-4 py-6">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={runLevel} lives={lives} progress={`${picked.size} / ${params.count}`} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {t('recall')}
      </span>
      <div className="grid w-full max-w-md grid-cols-4 gap-3">
        {grid.map((g, i) => {
          const sel = picked.has(g);
          return (
            <button
              key={i}
              onClick={() => toggle(g)}
              className={[
                'flex aspect-square items-center justify-center rounded-2xl text-3xl transition-all active:scale-90',
                sel ? 'bg-accent-dim ring-2 ring-accent' : 'bg-surface2 hover:bg-line',
              ].join(' ')}
            >
              {g}
            </button>
          );
        })}
      </div>
    </div>
  );
}
