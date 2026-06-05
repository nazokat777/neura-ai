'use client';

import { useState } from 'react';

// Realistik yuz — randomuser.me bepul portretlari (kalit kerak emas).
// seed → (jins, indeks) deterministik: bir seed doim bir xil yuz beradi
// (raund davomida barqaror). Rasm yuklanmasa (internet yo'q) → SVG zaxira.
export default function Avatar({
  seed,
  gender = 'men',
  size = 76,
}: {
  seed: number;
  gender?: 'men' | 'women';
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const idx = ((seed - 1) % 100 + 100) % 100;
  const url = `https://randomuser.me/api/portraits/${gender}/${idx}.jpg`;

  if (failed) return <FallbackFace seed={seed} size={size} />;

  return (
    <span
      className="relative inline-block overflow-hidden rounded-full ring-1 ring-white/15 shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        aria-hidden
        loading="eager"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
        style={{ width: size, height: size }}
      />
    </span>
  );
}

// ---- SVG zaxira (internet yo'q bo'lsa) — sodda generativ yuz ----
const SKIN = ['#F2C8A0', '#E6B58C', '#D49A6A', '#B97A4E', '#8D5524', '#FBD7B5'];
const HAIR = ['#2B2118', '#4A352A', '#6B4423', '#9A6A3A', '#1C1C22', '#8A8F99'];

function FallbackFace({ seed, size }: { seed: number; size: number }) {
  const skin = SKIN[seed % SKIN.length];
  const hair = HAIR[(seed >> 1) % HAIR.length];
  const bgHue = (seed * 47) % 360;
  const mouth = (seed >> 2) % 3;
  const eyeGap = 13 + (seed % 3) * 2;
  const cx = 40;
  const id = `av${seed}`;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden style={{ borderRadius: '9999px' }}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`hsl(${bgHue}, 70%, 60%)`} />
          <stop offset="100%" stopColor={`hsl(${(bgHue + 40) % 360}, 65%, 42%)`} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="40" cy="40" r="40" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y="0" width="80" height="80" fill={`url(#${id}-bg)`} />
        <rect x="32" y="58" width="16" height="16" rx="6" fill={skin} />
        <ellipse cx={cx} cy="40" rx="20" ry="22" fill={skin} />
        <path d="M19,38 Q19,16 40,16 Q61,16 61,38 Q61,30 52,27 Q40,22 28,27 Q19,30 19,38 Z" fill={hair} />
        <ellipse cx={cx - eyeGap} cy="41" rx="4" ry="4.4" fill="#fff" />
        <ellipse cx={cx + eyeGap} cy="41" rx="4" ry="4.4" fill="#fff" />
        <circle cx={cx - eyeGap} cy="42" r="2" fill="#23303f" />
        <circle cx={cx + eyeGap} cy="42" r="2" fill="#23303f" />
        {mouth === 0 && <path d="M32,54 Q40,62 48,54" stroke="#7a3b3b" strokeWidth="2.6" fill="none" strokeLinecap="round" />}
        {mouth === 1 && <line x1="33" y1="56" x2="47" y2="56" stroke="#7a3b3b" strokeWidth="2.6" strokeLinecap="round" />}
        {mouth === 2 && <path d="M32,57 Q40,51 48,57" stroke="#7a3b3b" strokeWidth="2.6" fill="none" strokeLinecap="round" />}
      </g>
    </svg>
  );
}
