'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadSynapses } from '@/lib/storage';
import { detectCapability } from '@/lib/deviceDetector';
import HeroArt from '@/components/HeroArt';

// Premium "miya" hero: brend neon-emblema + nurli halqa + nafis sinaps
// ko'rsatkichi. (Eski zarrachali WebGL + chetdan chiquvchi yozuvlar olib
// tashlandi — domenlar quyidagi premium kartalarда ko'rsatiladi.)
// Keyin /heroes/brain.png tayyor bo'lsa, emblema o'rniga qo'yiladi.
export default function BrainStage() {
  const tb = useTranslations('brain');

  const [synapses, setSynapses] = useState(0);
  const [display, setDisplay] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(detectCapability().reducedMotion);
    setSynapses(loadSynapses());
  }, []);

  // Sinaps raqami count-up (reduced-motion bo'lsa darhol).
  const rafRef = useRef(0);
  useEffect(() => {
    if (reduced || synapses === 0) {
      setDisplay(synapses);
      return;
    }
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / 900);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * synapses));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [synapses, reduced]);

  return (
    <div className="flex flex-col items-center gap-7">
      {/* Doiraviy miya orbi — aylanuvchi gradient halqa ichida (premium) */}
      <div className="relative flex items-center justify-center py-2">
        {/* orqa nur */}
        <span
          aria-hidden
          className={[
            'absolute h-64 w-64 rounded-full opacity-60 blur-3xl',
            reduced ? '' : 'animate-pulse',
          ].join(' ')}
          style={{
            background:
              'radial-gradient(circle, rgba(77,141,255,0.45), rgba(176,108,255,0.32) 45%, rgba(6,8,15,0) 72%)',
          }}
        />

        {/* aylanuvchi gradient halqa (conic) — ramka effekti */}
        <div
          aria-hidden
          className={[
            'absolute h-56 w-56 rounded-full',
            reduced ? '' : 'animate-spin-slow',
          ].join(' ')}
          style={{
            background:
              'conic-gradient(from 0deg, rgba(77,141,255,0) 0deg, #4D8DFF 90deg, #B06CFF 200deg, rgba(176,108,255,0) 340deg)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
            WebkitMask:
              'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
          }}
        />
        {/* statik nozik tashqi halqa */}
        <span aria-hidden className="absolute h-56 w-56 rounded-full border border-white/[0.06]" />

        {/* miya — neon hero rasm (brain.png), screen blend bilan fonга singadi.
            Rasm yo'q bo'lsa logo-mark zaxira. */}
        <span className="relative h-52 w-52">
          <HeroArt id="brain" className="h-full w-full" glow={false} />
        </span>
      </div>

      {/* Sinaps faolligi — nafis shisha karta */}
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
        <span
          className="num grad-anim font-semibold leading-none tabular-nums"
          style={{
            fontSize: '2.6rem',
            background: 'linear-gradient(135deg, #6FA8FF, #B06CFF, #6FA8FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {display}
        </span>
        <div className="flex flex-col">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">
            {tb('synapses')}
          </span>
          <span className="text-[11px] text-muted">{tb('synapsesSub')}</span>
        </div>
      </div>

      <p className="max-w-[22rem] text-center text-[11px] leading-relaxed text-muted/80">
        {tb('synapsesHonest')}
      </p>
    </div>
  );
}
