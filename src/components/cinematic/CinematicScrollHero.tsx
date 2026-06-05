'use client';

import { useEffect, useRef, useState } from 'react';
import { detectCapability } from '@/lib/deviceDetector';

// Scroll-scrub cinematic hero (CLAUDE.md §7, usmanov uslubi).
// To'liq ekranli video scroll bo'yicha "scrub" qilinadi (Flow/Veo asseti).
// Video hali yo'q bo'lsa — placeholder bilan ham sahnalar scroll bo'ylab almashadi.
// Zaif qurilma / reduced-motion: bitta statik ekran (graceful, mobil barqarorlik).

export interface Scene {
  title: string;
  caption?: string;
}

export default function CinematicScrollHero({
  videoSrc,
  videoSrcWide,
  poster,
  scenes,
  kicker,
  ctaLabel,
  onCta,
}: {
  videoSrc?: string;
  /** Gorizontal (16:9) variant — keng ekran uchun. Bo'lmasa videoSrc. */
  videoSrcWide?: string;
  poster?: string;
  scenes: Scene[];
  /** Tepada ko'rinadigan kichik yorliq (masalan "Miyaga sayohat"). */
  kicker?: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0); // 0..1 scroll
  const [reduced, setReduced] = useState(false); // zaif/qisqartirilgan
  const [videoError, setVideoError] = useState(false);
  const [wide, setWide] = useState(false);
  const durationRef = useRef(0);
  const rafRef = useRef(0);

  const chosenSrc = wide ? videoSrcWide || videoSrc : videoSrc || videoSrcWide;
  const hasVideo = !!chosenSrc && !videoError;

  useEffect(() => {
    const cap = detectCapability();
    setReduced(cap.reducedMotion || cap.lowPower);
  }, []);

  // Ekran nisbatiga qarab 16:9 / 9:16 tanlash.
  useEffect(() => {
    const mq = window.matchMedia('(min-aspect-ratio: 1/1)');
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    setVideoError(false);
  }, [chosenSrc]);

  // SCRUB: video.currentTime scroll POZITSIYASIGA aniq bog'lanadi.
  // To'liq video = to'liq scroll. Pastga → oldinga, orqaga → orqaga.
  // Video o'zicha o'ynamaydi (scrollsiz qotadi).
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = wrap.getBoundingClientRect();
        const total = wrap.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        setProgress(p);
        const video = videoRef.current;
        const dur = video?.duration || durationRef.current;
        if (video && dur > 0 && Number.isFinite(dur)) {
          video.currentTime = Math.min(p * dur, dur - 0.05);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const sceneIndex = Math.min(
    scenes.length - 1,
    Math.floor(progress * scenes.length),
  );
  const active = scenes[sceneIndex] ?? scenes[0];

  return (
    <div
      ref={wrapRef}
      style={{ height: `${scenes.length * 100}vh` }}
      className="relative w-full"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-end overflow-hidden">
        {/* Video (bo'lsa) */}
        {hasVideo && (
          <video
            ref={videoRef}
            key={chosenSrc}
            src={chosenSrc}
            poster={poster}
            muted
            loop
            playsInline
            preload="auto"
            onLoadedMetadata={() => {
              durationRef.current = videoRef.current?.duration ?? 0;
            }}
            onError={() => setVideoError(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Poster yoki cinematic placeholder (video yo'q paytda) */}
        {!hasVideo && poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {!hasVideo && !poster && (
          <div
            aria-hidden
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: `radial-gradient(75% 55% at 50% ${28 + sceneIndex * 8}%, rgba(77,141,255,${0.1 + sceneIndex * 0.03}), rgba(6,8,15,0) 70%), linear-gradient(180deg, #0a0e16, #06080f)`,
            }}
          />
        )}

        {/* Pastdan qoraytirish — matn o'qilishi uchun (kuchaytirilgan) */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(6,8,15,0.15) 0%, rgba(6,8,15,0) 22%, rgba(6,8,15,0.55) 52%, rgba(6,8,15,0.96) 100%)',
          }}
        />

        {/* Matn qatlami */}
        <div className="relative z-10 flex w-full max-w-md flex-col gap-3 px-6 pb-16">
          {kicker && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              {kicker}
            </span>
          )}
          <span className="num text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            {String(sceneIndex + 1).padStart(2, '0')} /{' '}
            {String(scenes.length).padStart(2, '0')}
          </span>
          <h2
            key={active.title}
            className="t-display animate-rise [text-shadow:0_2px_18px_rgba(0,0,0,0.7)]"
            style={{
              fontSize: 'clamp(2.4rem, 10vw, 3.8rem)',
              lineHeight: '0.95',
              letterSpacing: '-0.04em',
            }}
          >
            {active.title}
          </h2>
          {active.caption && (
            <p className="max-w-[22rem] text-[14px] leading-relaxed text-ink/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
              {active.caption}
            </p>
          )}

          {ctaLabel && onCta && sceneIndex === scenes.length - 1 && (
            <button
              onClick={onCta}
              className="mt-4 w-fit rounded-full bg-accent px-9 py-3 font-medium text-bg active:scale-95"
            >
              {ctaLabel}
            </button>
          )}
        </div>

        {sceneIndex < scenes.length - 1 && (
          <span className="absolute left-6 top-[max(1.5rem,env(safe-area-inset-top))] z-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            ↓ Scroll
          </span>
        )}
      </div>
    </div>
  );
}
