'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  motorParams,
  mirrorIndex,
  type MotorConfig,
  type MotorParams,
} from './config';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import { speedScoreFromTime } from '@/drills/engine/performance';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

export default function MotorGame({ config }: { config: MotorConfig }) {
  const t = useTranslations('motor');
  const tc = useTranslations('common');
  const tg = useTranslations('game');
  const { state, ready, summary, finish, nextRound } = useDrill(config.id);
  const feel = useGameFeel();

  const pads = config.cols * config.rows;

  const [params, setParams] = useState<MotorParams>(() => motorParams(1));
  const [index, setIndex] = useState(0);
  const [lit, setLit] = useState<Set<number>>(new Set());
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);

  const idxRef = useRef(0);
  const litRef = useRef<Set<number>>(new Set());
  const tappedRef = useRef<Set<number>>(new Set());
  const startRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const hitsRef = useRef(0);
  const errRef = useRef(0);
  const rtSumRef = useRef(0);
  const hitCountRef = useRef(0);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const finishGame = useCallback(
    (p: MotorParams) => {
      const accuracy = hitsRef.current / p.trials;
      const avgRt =
        hitCountRef.current > 0 ? rtSumRef.current / hitCountRef.current : p.windowMs;
      const speedScore = speedScoreFromTime(avgRt, p.windowMs * 0.5);
      finish({
        accuracy,
        speedScore,
        meta: { hits: hitsRef.current, errors: errRef.current },
      });
    },
    [finish],
  );

  const nextTrial = useCallback(
    (i: number, p: MotorParams) => {
      if (i >= p.trials) {
        setLit(new Set());
        finishGame(p);
        return;
      }
      idxRef.current = i;
      setIndex(i);
      const idx = Math.floor(Math.random() * pads);
      const req =
        config.mode === 'mirror'
          ? new Set([idx, mirrorIndex(idx, config.cols)])
          : new Set([idx]);
      litRef.current = req;
      tappedRef.current = new Set();
      setLit(req);
      setTapped(new Set());
      startRef.current = performance.now();
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        // vaqt tugadi — bermagan teginish(lar) o'tkazib yuborildi
        errRef.current += 1;
        feel.register(false);
        nextTrial(i + 1, p);
      }, p.windowMs);
    },
    [pads, config, feel, finishGame],
  );

  const startRound = useCallback(
    (D: number) => {
      const p = motorParams(D);
      setParams(p);
      hitsRef.current = 0;
      errRef.current = 0;
      rtSumRef.current = 0;
      hitCountRef.current = 0;
      setWrong(null);
      feel.reset();
      nextTrial(0, p);
    },
    [nextTrial, feel],
  );

  useEffect(() => {
    if (ready) startRound(state.D);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onPad = useCallback(
    (idx: number) => {
      if (summary) return;
      if (!litRef.current.has(idx) || tappedRef.current.has(idx)) {
        // noto'g'ri yoki takror teginish
        errRef.current += 1;
        feel.register(false);
        setWrong(idx);
        window.setTimeout(() => setWrong(null), 180);
        return;
      }
      const nextTapped = new Set(tappedRef.current).add(idx);
      tappedRef.current = nextTapped;
      setTapped(nextTapped);
      if (nextTapped.size === litRef.current.size) {
        // barcha kerakli teginishlar bajarildi — hit
        clearTimer();
        const rt = performance.now() - startRef.current;
        hitsRef.current += 1;
        hitCountRef.current += 1;
        rtSumRef.current += rt;
        feel.register(true, 1 - rt / paramsRef.current.windowMs);
        nextTrial(idxRef.current + 1, paramsRef.current);
      }
    },
    [summary, feel, nextTrial],
  );

  if (summary) {
    const m = summary.result.meta as { hits?: number } | undefined;
    return (
      <ResultPanel
        outcome={summary.outcome}
        stats={[
          { label: tc('accuracy'), value: `${Math.round(summary.result.accuracy * 100)}%` },
          { label: t('hits'), value: `${m?.hits ?? 0}/${params.trials}` },
          { label: tg('score'), value: `${feel.score}` },
          { label: tg('maxCombo'), value: `×${feel.maxCombo}` },
        ]}
        onContinue={() => {
          nextRound();
          startRound(summary.outcome.state.D);
        }}
      />
    );
  }

  const isDuo = config.mode === 'duo';

  function padClass(i: number): string {
    if (wrong === i) return 'bg-danger';
    if (tapped.has(i)) return 'bg-accent-dim';
    if (lit.has(i)) return 'bg-accent';
    return 'bg-surface2 hover:bg-line';
  }

  return (
    <div className="flex flex-col items-center gap-5 px-4 py-5">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={state.D} progress={`${index + 1} / ${params.trials}`} />

      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {t(`instr.${config.id}`)}
      </span>

      {/* har sinov vaqt chizig'i */}
      <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-surface2">
        <span
          key={index}
          className="block h-full bg-accent"
          style={{ animation: `shrink-bar ${params.windowMs}ms linear forwards` }}
        />
      </div>

      <div
        className="grid w-full max-w-md select-none gap-3"
        style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: pads }, (_, i) => (
          <button
            key={i}
            onClick={() => onPad(i)}
            aria-label={`pad ${i + 1}`}
            className={[
              'rounded-2xl transition-all duration-100 active:scale-90',
              isDuo ? 'h-[38vh]' : 'aspect-square',
              padClass(i),
            ].join(' ')}
            style={
              lit.has(i)
                ? { boxShadow: '0 0 22px rgba(77,141,255,0.6)' }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
