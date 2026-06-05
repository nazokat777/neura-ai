'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { paramsForLevel, type NebulaParams } from './params';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

const DRILL_ID = 'nebula';

type Phase = 'cue' | 'move' | 'select' | 'reveal';
interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function NebulaGame() {
  const t = useTranslations('nebula');
  const tg = useTranslations('game');
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [params, setParams] = useState<NebulaParams>(() => paramsForLevel(1));
  const [phase, setPhase] = useState<Phase>('cue');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [size, setSize] = useState(320);
  // SURVIVAL: barcha nishonni to'g'ri tutsa → keyingi bosqich; 3 jon tugasa → tugadi.
  const [runLevel, setRunLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const stagesRef = useRef(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dotsRef = useRef<Dot[]>([]);
  const targetRef = useRef<Set<number>>(new Set());
  const movingRef = useRef(false);
  const rafRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const phaseRef = useRef<Phase>('cue');
  phaseRef.current = phase;

  const radius = Math.max(15, Math.round(size * 0.052));

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    cancelAnimationFrame(rafRef.current);
  };

  const draw = useCallback(() => {
    const dots = dotsRef.current;
    const r = Math.max(15, Math.round(size * 0.052));
    const max = size - r;
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (movingRef.current) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < r) {
          dot.x = r;
          dot.vx = Math.abs(dot.vx);
        } else if (dot.x > max) {
          dot.x = max;
          dot.vx = -Math.abs(dot.vx);
        }
        if (dot.y < r) {
          dot.y = r;
          dot.vy = Math.abs(dot.vy);
        } else if (dot.y > max) {
          dot.y = max;
          dot.vy = -Math.abs(dot.vy);
        }
      }
      const el = nodeRefs.current[i];
      if (el) el.style.transform = `translate(${dot.x - r}px, ${dot.y - r}px)`;
    }
    rafRef.current = requestAnimationFrame(draw);
  }, [size]);

  const startRound = useCallback(
    (D: number, boxSize: number, fresh = false) => {
      const p = paramsForLevel(D);
      setParams(p);
      setRunLevel(D);
      if (fresh) {
        stagesRef.current = 0;
        livesRef.current = 3;
        setLives(3);
      }
      const r = Math.max(15, Math.round(boxSize * 0.052));
      const max = boxSize - r;
      const scale = boxSize / 320;
      // nuqtalarni tasodifiy joylashtir, tasodifiy yo'nalish ber
      const dots: Dot[] = Array.from({ length: p.total }, () => {
        const angle = Math.random() * Math.PI * 2;
        const sp = p.speed * scale;
        return {
          x: r + Math.random() * (max - r),
          y: r + Math.random() * (max - r),
          vx: Math.cos(angle) * sp,
          vy: Math.sin(angle) * sp,
        };
      });
      dotsRef.current = dots;
      // nishonlarni tanla
      const idx = Array.from({ length: p.total }, (_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      targetRef.current = new Set(idx.slice(0, p.targets));
      setSelected(new Set());
      if (fresh) feel.reset();
      movingRef.current = false;
      setPhase('cue');

      clearTimers();
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
      timersRef.current.push(
        window.setTimeout(() => {
          movingRef.current = true;
          setPhase('move');
        }, p.cueMs),
      );
      timersRef.current.push(
        window.setTimeout(() => {
          movingRef.current = false;
          setPhase('select');
        }, p.cueMs + p.moveMs),
      );
    },
    [draw, feel],
  );

  // O'lchovni o'lchab birinchi raundni boshlash
  useEffect(() => {
    if (!ready) return;
    const w = wrapRef.current?.offsetWidth ?? 320;
    const box = Math.min(w, 360);
    setSize(box);
    startRound(state.D, box, true);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onDot = useCallback(
    (i: number) => {
      if (phaseRef.current !== 'select') return;
      setSelected((prev) => {
        const nx = new Set(prev);
        if (nx.has(i)) nx.delete(i);
        else if (nx.size < params.targets) nx.add(i);
        return nx;
      });
    },
    [params.targets],
  );

  const confirm = useCallback(() => {
    if (phase !== 'select' || selected.size !== params.targets) return;
    setPhase('reveal');
    let correct = 0;
    selected.forEach((i) => {
      const ok = targetRef.current.has(i);
      if (ok) correct += 1;
      feel.register(ok);
    });
    const allCorrect = correct === params.targets;
    timersRef.current.push(
      window.setTimeout(() => {
        const w = wrapRef.current?.offsetWidth ?? 320;
        const box = Math.min(w, 360);
        setSize(box);
        if (allCorrect) {
          // ✅ Hammasi to'g'ri → keyingi bosqich (qiyinroq), ball saqlanadi.
          stagesRef.current += 1;
          startRound(runLevel + 1, box, false);
          return;
        }
        // ❌ Xato → jon ketadi. 3 jon tugasa o'yin tugaydi.
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          const stages = stagesRef.current;
          const accuracy = Math.max(0, Math.min(1, 0.45 + stages * 0.05));
          finish({ accuracy, speedScore: accuracy, meta: { stages } });
        } else {
          // jon qoldi — o'sha darajada yangi raund.
          startRound(runLevel, box, false);
        }
      }, 1400),
    );
  }, [phase, selected, params.targets, feel, finish, runLevel, startRound]);

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
          const w = wrapRef.current?.offsetWidth ?? 320;
          const box = Math.min(w, 360);
          setSize(box);
          startRound(summary.outcome.state.D, box, true);
        }}
      />
    );
  }

  const phaseLabel =
    phase === 'cue'
      ? t('memorize')
      : phase === 'move'
        ? t('track')
        : phase === 'reveal'
          ? t('reveal')
          : t('pick', { n: params.targets });

  function dotClass(i: number): string {
    const isTarget = targetRef.current.has(i);
    const isSel = selected.has(i);
    if (phase === 'cue') {
      return isTarget ? 'bg-accent' : 'bg-surface2';
    }
    if (phase === 'reveal') {
      if (isTarget) return 'bg-accent';
      if (isSel) return 'bg-danger';
      return 'bg-surface2 opacity-50';
    }
    // move / select — hammasi bir xil; tanlangani halqali
    return isSel ? 'bg-accent-dim ring-2 ring-accent' : 'bg-surface2';
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-4">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={runLevel} lives={lives} progress={`${params.targets} / ${params.total}`} />

      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {phaseLabel}
      </span>

      {/* Maydon */}
      <div
        ref={wrapRef}
        className="relative w-full max-w-[360px] overflow-hidden rounded-3xl border border-line bg-surface/30"
        style={{ height: size }}
      >
        {/* harakat vaqt chizig'i */}
        {phase === 'move' && (
          <span
            key="movebar"
            className="absolute left-0 top-0 z-10 h-1 bg-accent"
            style={{ animation: `shrink-bar ${params.moveMs}ms linear forwards` }}
          />
        )}
        {Array.from({ length: params.total }, (_, i) => (
          <button
            key={i}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            onClick={() => onDot(i)}
            aria-label={`dot ${i + 1}`}
            className={[
              'absolute left-0 top-0 rounded-full transition-colors duration-200 will-change-transform',
              dotClass(i),
            ].join(' ')}
            style={{
              width: radius * 2,
              height: radius * 2,
              boxShadow:
                (phase === 'cue' && targetRef.current.has(i)) ||
                (phase === 'reveal' && targetRef.current.has(i))
                  ? '0 0 18px rgba(77,141,255,0.7)'
                  : undefined,
            }}
          />
        ))}
      </div>

      <p className="max-w-[20rem] text-center text-sm text-muted">{t('instruction')}</p>

      {/* Tasdiqlash — faqat tanlash bosqichida, kerakli son tanlansa */}
      <button
        onClick={confirm}
        disabled={phase !== 'select' || selected.size !== params.targets}
        className="w-full max-w-[360px] rounded-2xl bg-accent py-4 text-lg font-semibold text-bg transition-all active:scale-95 disabled:opacity-30"
      >
        {t('confirm')} ({selected.size}/{params.targets})
      </button>
    </div>
  );
}
