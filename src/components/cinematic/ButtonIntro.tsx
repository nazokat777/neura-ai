'use client';

import { useEffect, useRef, useState } from 'react';
import LocaleSwitcher from '@/components/LocaleSwitcher';

// "Miyaga sayohat" — TUGMA bilan boshqariladi (scroll emas). Har panelда
// tugma bor: bosilganda video KEYINGI panel nuqtasigача o'ynaydi va to'xtaydi.
// Video bo'limlarga teng bo'linadi (N panel = N bo'lak). Oxirgi tugma → anketa.
// Scroll talab qilinmaydi — foydalanuvchi adashmaydi.

export interface Scene {
  title: string;
  caption?: string;
}

export default function ButtonIntro({
  videoSrc,
  videoSrcWide,
  gradient,
  kicker,
  scenes,
  nextLabel,
  ctaLabel,
  onCta,
  onBack,
}: {
  videoSrc?: string;
  videoSrcWide?: string;
  gradient: string;
  kicker?: string;
  scenes: Scene[];
  nextLabel: string;
  ctaLabel: string;
  onCta?: () => void;
  onBack?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playTimerRef = useRef<number | null>(null); // 4s o'ynagandan keyin pauza
  const [idx, setIdx] = useState(0);
  const [wide, setWide] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Har tugma bosishда video shu qadar soniya silliq o'ynaydi, keyin to'xtaydi.
  const PLAY_SECONDS = 4;

  const chosen = wide ? videoSrcWide || videoSrc : videoSrc || videoSrcWide;
  const hasVideo = !!chosen && !videoError;
  const last = idx >= scenes.length - 1;
  const scene = scenes[idx] ?? scenes[0];

  // Ekran nisbati: 16:9 / 9:16.
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

  // Komponent yopilganда timerni tozalash.
  useEffect(() => {
    return () => {
      if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    };
  }, []);

  // Video UZLUKSIZ OLDINGA o'ynaydi — HECH QACHON boshiga qaytmaydi (loop yo'q).
  // 1-panel: avtomatik boshlanadi (muted → mobil ruxsat), 4s o'ynaб to'xtaydi.
  useEffect(() => {
    if (!hasVideo) return;
    const v = videoRef.current;
    if (!v) return;
    const start = () => {
      v.loop = false;
      v.currentTime = 0;
      v.play().catch(() => {
        // avtopley bloklansa — hech bo'lmasa birinchi kadr ko'rinsin
        try {
          v.currentTime = 0.05;
        } catch {
          /* ignore */
        }
      });
      if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
      playTimerRef.current = window.setTimeout(() => v.pause(), PLAY_SECONDS * 1000);
    };
    if (v.readyState >= 2) start();
    else {
      v.addEventListener('loadeddata', start, { once: true });
      return () => v.removeEventListener('loadeddata', start);
    }
    // faqat video manbai o'zgarganда (mount/format) bir marta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVideo, chosen]);

  function next() {
    if (last) {
      onCta?.();
      return;
    }
    const ni = idx + 1;
    const enteringLast = ni >= scenes.length - 1;
    setIdx(ni);
    const v = videoRef.current;
    if (v) {
      if (playTimerRef.current) {
        window.clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
      v.loop = false;
      if (enteringLast) {
        // Oxirgi panel: videoning OXIRIGA o'tib, oxirgacha o'ynab to'xtasin.
        // (Video allaqachon tugagan bo'lsa, play() boshidan boshlamasligi uchun.)
        const goEnd = () => {
          const d = v.duration;
          if (isFinite(d) && d > 0) {
            try {
              v.currentTime = Math.max(0, d - 3.2);
            } catch {
              /* ignore */
            }
          }
          v.play().catch(() => {});
        };
        if (v.readyState >= 1 && isFinite(v.duration) && v.duration > 0) goEnd();
        else v.addEventListener('loadedmetadata', goEnd, { once: true });
      } else {
        // Oraliq panellar: joriy joydan davom etib 4s o'ynaб to'xtaydi.
        v.play().catch(() => {});
        playTimerRef.current = window.setTimeout(() => v.pause(), PLAY_SECONDS * 1000);
      }
    }
  }

  return (
    <main className="relative flex min-h-dvh w-full flex-col justify-end overflow-hidden">
      {/* Qaytish — ro'yhatdan o'tgan foydalanuvchi chiqib keta oladi (tepa-chap) */}
      {onBack && (
        <button
          onClick={onBack}
          aria-label="←"
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-ink backdrop-blur-sm active:scale-95"
        >
          ←
        </button>
      )}

      {/* Til almashtirish — kirishда ham qulay (tepa-o'ng) */}
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20">
        <LocaleSwitcher />
      </div>

      {/* Fon: video yoki gradient — BUTUN EKRANNI to'ldiradi (desktopда ham) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {hasVideo ? (
          <video
            ref={videoRef}
            key={chosen}
            src={chosen}
            muted
            autoPlay
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: gradient }} />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(6,8,15,0.15) 0%, rgba(6,8,15,0) 22%, rgba(6,8,15,0.55) 52%, rgba(6,8,15,0.96) 100%)',
          }}
        />
      </div>

      {/* Matn — telefonда markazda (tor), web'да CHAPDA va kengroq
          (sarlavha kam qatorga bo'linsin, hunuk ko'rinmasin) */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-6 pb-14 pt-[max(2rem,env(safe-area-inset-top))] sm:mx-0 sm:ml-[6%] sm:max-w-2xl sm:px-0">
        {kicker && (
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
              style={{ boxShadow: '0 0 10px rgba(77,141,255,0.9)' }}
            />
            {kicker}
          </span>
        )}
        <span className="num mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          <span className="text-ink">{String(idx + 1).padStart(2, '0')}</span> / {String(scenes.length).padStart(2, '0')}
        </span>

        <h1
          key={`t-${idx}`}
          className="t-display animate-rise mt-3 [text-shadow:0_2px_18px_rgba(0,0,0,0.75)]"
          style={{ fontSize: 'clamp(2.4rem, 10vw, 3.8rem)', lineHeight: '0.95', letterSpacing: '-0.04em' }}
        >
          {scene.title}
        </h1>
        {scene.caption && (
          <p
            key={`c-${idx}`}
            className="animate-rise mt-3 max-w-[22rem] text-[15px] leading-relaxed text-ink/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.75)]"
            style={{ animationDelay: '80ms' }}
          >
            {scene.caption}
          </p>
        )}

        {/* Progress nuqtalari — faol nuqta gradient + nurli */}
        <div className="mt-6 flex gap-1.5">
          {scenes.map((_, i) => (
            <span
              key={i}
              className={[
                'h-1 rounded-full transition-all duration-500',
                i === idx ? 'w-7' : i < idx ? 'w-2' : 'w-2 bg-line',
              ].join(' ')}
              style={
                i <= idx
                  ? {
                      background: 'linear-gradient(90deg, #4D8DFF, #B06CFF)',
                      boxShadow: i === idx ? '0 0 12px rgba(125,100,255,0.7)' : undefined,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        {/* CTA — premium gradient + nur */}
        <button
          onClick={next}
          className="shimmer-sheen grad-anim group relative mt-7 w-full overflow-hidden rounded-full px-9 py-4 text-[16px] font-semibold text-bg transition-transform active:scale-[0.98] sm:w-auto sm:min-w-[18rem] sm:self-start"
          style={{
            background: 'linear-gradient(135deg, #4D8DFF, #7B5BFF, #B06CFF)',
            boxShadow: '0 8px 30px rgba(125,100,255,0.35)',
          }}
        >
          <span className="inline-flex items-center gap-2">
            {last ? ctaLabel : nextLabel}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </button>
      </div>
    </main>
  );
}
