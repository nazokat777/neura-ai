'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { type VisionConfig } from './config';
import { fxFinish } from '@/lib/feedback';

type Phase = 'intro' | 'running' | 'done';

export default function VisionSession({ config }: { config: VisionConfig }) {
  const t = useTranslations('vision');
  const [phase, setPhase] = useState<Phase>('intro');
  const [cue, setCue] = useState<'near' | 'far'>('far');
  const [left, setLeft] = useState(config.durationMs);

  const tickRef = useRef<number | null>(null);
  const cueRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const endAtRef = useRef(0);
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  const clearAll = () => {
    [tickRef, cueRef, endRef].forEach((r) => {
      if (r.current) window.clearInterval(r.current);
      if (r.current) window.clearTimeout(r.current);
      r.current = null;
    });
  };

  const start = useCallback(() => {
    setPhase('running');
    setLeft(config.durationMs);
    setCue('far');
    endAtRef.current = performance.now() + config.durationMs;
    tickRef.current = window.setInterval(() => {
      const l = endAtRef.current - performance.now();
      setLeft(l > 0 ? l : 0);
    }, 100);
    if (config.mode === 'shift' && config.halfMs) {
      cueRef.current = window.setInterval(() => {
        setCue((c) => (c === 'near' ? 'far' : 'near'));
      }, config.halfMs);
    }
    endRef.current = window.setTimeout(() => {
      clearAll();
      fxFinish();
      setPhase('done');
    }, config.durationMs);
  }, [config]);

  useEffect(() => clearAll, []);

  // Animatsiyalar — rAF bilan to'g'ridan-to'g'ri transform (keyframe/WAAPI'ga
  // bog'liq emas, har joyda barqaror).
  useEffect(() => {
    if (phase !== 'running') return;
    const startT = performance.now();
    const lap = config.lapMs ?? 6000;
    let raf = 0;
    const tick = () => {
      const el = performance.now() - startT;
      if (config.mode === 'trace' && dotRef.current) {
        // Gerono lemniskatasi (sakkiz shakli) — 300×170 maydon ichida
        const th = (2 * Math.PI * (el % lap)) / lap;
        const x = 150 + 130 * Math.sin(th);
        const y = 85 + 60 * Math.sin(th) * Math.cos(th);
        dotRef.current.style.transform = `translate(${x - 10}px, ${y - 10}px)`;
      } else if (config.mode === 'rest' && ringRef.current) {
        const p = Math.min(1, el / config.durationMs);
        ringRef.current.style.transform = `scale(${1 - p})`;
        ringRef.current.style.opacity = String(1 - 0.8 * p);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, config]);

  const seconds = Math.ceil(left / 1000);

  // ---- Intro ----
  if (phase === 'intro') {
    return (
      <Frame>
        <p className="t-display t-h2 text-ink">{t(`instr.${config.id}`)}</p>
        <p className="max-w-[20rem] text-center text-sm text-muted">
          {t(`desc.${config.id}`)}
        </p>
        <button
          onClick={start}
          className="mt-2 rounded-full bg-accent px-10 py-3 font-medium text-bg active:scale-95"
        >
          {t('start')}
        </button>
        <Honest t={t} />
      </Frame>
    );
  }

  // ---- Done ----
  if (phase === 'done') {
    return (
      <Frame>
        <p className="t-display t-h1 text-accent">{t('done')}</p>
        <p className="max-w-[20rem] text-center text-sm text-muted">{t('relax')}</p>
        <button
          onClick={start}
          className="mt-2 rounded-full bg-accent px-10 py-3 font-medium text-bg active:scale-95"
        >
          {t('again')}
        </button>
        <Honest t={t} />
      </Frame>
    );
  }

  // ---- Running ----
  return (
    <Frame>
      <span className="num text-2xl font-semibold tabular-nums text-accent">
        {seconds}s
      </span>

      {config.mode === 'rest' && (
        <>
          <div className="relative my-6 flex h-44 w-44 items-center justify-center">
            <span
              className="absolute inset-0 rounded-full border-2 border-accent/30"
            />
            <span
              ref={ringRef}
              className="absolute inset-0 rounded-full border-2 border-accent"
            />
            <span className="text-5xl">🌿</span>
          </div>
          <p className="max-w-[18rem] text-center text-[15px] text-ink">
            {t('restLook')}
          </p>
        </>
      )}

      {config.mode === 'shift' && (
        <>
          <div className="my-8 flex h-48 w-48 items-center justify-center">
            <span
              className="rounded-full bg-accent transition-all duration-700 ease-out"
              style={{
                width: cue === 'near' ? 150 : 44,
                height: cue === 'near' ? 150 : 44,
                boxShadow: '0 0 40px rgba(77,141,255,0.5)',
              }}
            />
          </div>
          <p className="text-[22px] font-medium text-ink">
            {cue === 'near' ? t('near') : t('far')}
          </p>
        </>
      )}

      {config.mode === 'trace' && (
        <>
          <div
            className="relative my-6"
            style={{ width: 300, height: 170 }}
          >
            <span
              ref={dotRef}
              className="absolute left-0 top-0 h-5 w-5 rounded-full bg-accent will-change-transform"
              style={{ boxShadow: '0 0 22px rgba(77,141,255,0.7)' }}
            />
          </div>
          <p className="max-w-[18rem] text-center text-[15px] text-ink">
            {t('traceFollow')}
          </p>
        </>
      )}

      <Honest t={t} />
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      {children}
    </div>
  );
}

function Honest({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <p className="mt-8 max-w-[20rem] text-center text-[11px] leading-relaxed text-muted">
      {t('honest')}
    </p>
  );
}
