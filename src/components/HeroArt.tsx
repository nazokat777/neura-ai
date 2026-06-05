'use client';

import { useState } from 'react';

// Hero neon rasm — `mix-blend-screen` bilan QORA fon yo'qoladi, faqat neon
// qoladi va ilova foniga singadi (rasmligi bilinmaydi). Chetlari radial mask
// bilan eriydi, orqasidan yumshoq nur beradi. Rasm yo'q bo'lsa (mas. motor)
// — onError → ko'rinmaydi (gradient/glyph zaxira o'z holida qoladi).
//
// id: heroes/<id>.png  (memory, attention, logic, speed, focus, vision, brain)
export default function HeroArt({
  id,
  className = '',
  fade = true,
  glow = true,
  float = false,
  glowColor = 'rgba(125,100,255,0.35)',
}: {
  id: string;
  className?: string;
  /** chetlarni radial mask bilan eritish */
  fade?: boolean;
  /** orqa nur */
  glow?: boolean;
  /** sekin suzish animatsiyasi */
  float?: boolean;
  glowColor?: string;
}) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;

  const mask = fade
    ? 'radial-gradient(closest-side, #000 55%, rgba(0,0,0,0.6) 78%, transparent 100%)'
    : undefined;

  return (
    <span className={`pointer-events-none relative inline-block ${className}`}>
      {glow && (
        <span
          aria-hidden
          className="absolute inset-[8%] rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/heroes/${id}.png`}
        alt=""
        aria-hidden
        onError={() => setOk(false)}
        className={`relative h-full w-full object-contain ${float ? 'animate-float-soft' : ''}`}
        style={{
          mixBlendMode: 'screen',
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    </span>
  );
}
