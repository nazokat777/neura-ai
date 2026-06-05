'use client';

import { useEffect, useRef, useState } from 'react';
import { detectCapability } from '@/lib/deviceDetector';

// "Miyaga sayohat" — videodagi lahzaга SONIYAGA bog'langan matn.
// Video avtomatik o'ynaydi (loop, muted, playsInline) — telefon va desktopда
// bir xil. Matn video.currentTime'ga qarab almashadi (timeupdate). Video yo'q
// yoki autoplay bloklansa — matn taymer bilan aylanadi (gradient fonда).
// Scroll TALAB QILINMAYDI — shu bois mobil scroll muammosi ham yo'q.

export interface Cue {
  /** Shu soniyadan boshlab ko'rinadi (video vaqti). */
  at: number;
  title: string;
  caption?: string;
}

export default function TimedIntro({
  videoSrc,
  videoSrcWide,
  gradient,
  kicker,
  cues,
  ctaLabel,
  onCta,
}: {
  videoSrc?: string;
  videoSrcWide?: string;
  gradient: string;
  kicker?: string;
  cues: Cue[];
  ctaLabel?: string;
  onCta?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [wide, setWide] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(0);

  const chosen = wide ? videoSrcWide || videoSrc : videoSrc || videoSrcWide;
  const hasVideo = !!chosen && !videoError;

  useEffect(() => {
    const cap = detectCapability();
    setReduced(cap.reducedMotion);
  }, []);

  // Ekran nisbati: 16:9 / 9:16 tanlash.
  useEffect(() => {
    const mq = window.matchMedia('(min-aspect-ratio: 1/1)');
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    setVideoError(false);
  }, [chosen]);

  // Berilgan vaqtga (soniya) mos faol matnni tanlash.
  function indexForTime(t: number): number {
    let idx = 0;
    for (let i = 0; i < cues.length; i++) {
      if (t >= cues[i].at) idx = i;
      else break;
    }
    return idx;
  }

  // Video o'ynaganда: currentTime → faol matn.
  useEffect(() => {
    if (!hasVideo || reduced) return;
    const v = videoRef.current;
    if (!v) return;
    v.loop = true;
    v.play().catch(() => {
      /* autoplay bloklansa — taymer fallback ishlaydi */
    });
    const onTime = () => setActive(indexForTime(v.currentTime));
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVideo, reduced, chosen]);

  // Video yo'q / reduced: matnni taymer bilan aylantiramiz (cue.at oralig'ida).
  useEffect(() => {
    if (hasVideo && !reduced) return;
    let i = 0;
    setActive(0);
    const total = cues.length;
    const id = window.setInterval(() => {
      i = (i + 1) % total;
      setActive(i);
    }, 3500);
    return () => window.clearInterval(id);
  }, [hasVideo, reduced, cues.length]);

  const cue = cues[active] ?? cues[0];

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-end overflow-hidden px-6 pb-16 pt-[max(2rem,env(safe-area-inset-top))]">
      {/* Fon: video yoki gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {hasVideo && !reduced ? (
          <video
            ref={videoRef}
            key={chosen}
            src={chosen}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            onError={() => setVideoError(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: gradient }} />
        )}
        {/* Matn o'qilishi uchun qoraytirish */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(6,8,15,0.35) 0%, rgba(6,8,15,0.1) 35%, rgba(6,8,15,0.92) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col">
      {kicker && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {kicker}
        </span>
      )}

      {/* Faol matn — har almashganda yumshoq paydo bo'ladi */}
      <h1
        key={`t-${active}`}
        className="t-display animate-rise mt-3"
        style={{ fontSize: 'clamp(2.4rem, 10vw, 3.8rem)', lineHeight: '0.95', letterSpacing: '-0.04em' }}
      >
        {cue.title}
      </h1>
      {cue.caption && (
        <p
          key={`c-${active}`}
          className="animate-rise mt-3 max-w-[22rem] text-[15px] leading-relaxed text-ink/80"
          style={{ animationDelay: '80ms' }}
        >
          {cue.caption}
        </p>
      )}

      {/* Progress nuqtalari */}
      <div className="mt-5 flex gap-1.5">
        {cues.map((_, i) => (
          <span
            key={i}
            className={[
              'h-1 rounded-full transition-all duration-300',
              i === active ? 'w-6 bg-accent' : 'w-2 bg-line',
            ].join(' ')}
          />
        ))}
      </div>

      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="mt-7 w-fit rounded-full bg-accent px-9 py-3 font-medium text-bg active:scale-95"
        >
          {ctaLabel}
        </button>
      )}
      </div>
    </main>
  );
}
