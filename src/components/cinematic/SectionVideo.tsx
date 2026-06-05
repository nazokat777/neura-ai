'use client';

import { useEffect, useRef, useState } from 'react';
import { detectCapability } from '@/lib/deviceDetector';

// Har bo'lim foni uchun cinematic video qatlami (loop, muted, autoplay).
// - Video bor bo'lsa: jim, cheksiz aylanadigan to'liq qoplama fon.
// - Video yo'q / xato / zaif qurilma / reduced-motion: cinematic gradient
//   (kategoriya ohangida) — graceful, mobil-barqaror, halol (soxta yuk yo'q).
// Tepasidan qoraytirish — matn doim o'qilishi uchun.
export default function SectionVideo({
  src,
  srcWide,
  gradient,
  className = '',
  dim = 0.55,
}: {
  /** Vertikal (9:16) video — telefon uchun. */
  src?: string;
  /** Gorizontal (16:9) video — keng ekran (desktop/web/landscape) uchun.
   *  Berilmasa `src` ishlatiladi. */
  srcWide?: string;
  /** Video yo'q paytdagi cinematic placeholder (CSS background). */
  gradient: string;
  className?: string;
  /** Pastki qoraytirish kuchi 0..1. */
  dim?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [videoError, setVideoError] = useState(false);
  // Ekran nisbati: keng (landscape) bo'lsa 16:9, aks holда 9:16 tanlanadi.
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const cap = detectCapability();
    setReduced(cap.reducedMotion || cap.lowPower);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-aspect-ratio: 1/1)');
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Tanlangan manba: keng ekranда srcWide (bo'lmasa src), tor ekranда src.
  const chosen = wide ? srcWide || src : src || srcWide;
  const showVideo = !!chosen && !reduced && !videoError;

  // Manba o'zgarsa (orientatsiya almashsa) xato holatini tiklab, qayta yuklaymiz.
  useEffect(() => {
    setVideoError(false);
  }, [chosen]);

  useEffect(() => {
    if (!showVideo) return;
    const v = videoRef.current;
    if (!v) return;
    // iOS/Telegram ichida autoplay uchun: muted + playsInline majburiy.
    v.play().catch(() => {
      /* autoplay bloklansa — jim qolamiz, gradient ko'rinadi */
    });
  }, [showVideo, chosen]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          key={chosen}
          src={chosen}
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: gradient }} />
      )}

      {/* Pastdan qoraytirish — matn o'qilishi uchun */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(6,8,15,0.30) 0%, rgba(6,8,15,${0.15 + dim * 0.2}) 45%, rgba(6,8,15,${0.6 + dim * 0.4}) 100%)`,
        }}
      />
    </div>
  );
}
