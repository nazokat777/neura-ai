'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { sectionGradient, sectionVideoSrc, sectionVideoSrcWide } from '@/lib/catalog';
import { KEY_AREAS, CATEGORY_PRIMARY_DRILL, type Loc } from '@/lib/keyAreas';
import { loadLast, loadHistory } from '@/lib/storage';
import SectionVideo from '@/components/cinematic/SectionVideo';
import HeroArt from '@/components/HeroArt';
import BottomNav from '@/components/nav/BottomNav';

interface GameItem {
  id: string;
  href: string | null;
  ready: boolean;
  tier: 'easy' | 'medium' | 'hard' | null;
  name: string;
  desc: string;
}

export default function CategoryView({
  categoryId,
  glyph,
  hue,
  name,
  tagline,
  fact,
  source,
  games,
  labels,
}: {
  categoryId: string;
  glyph: string;
  hue: string;
  name: string;
  tagline: string;
  fact: string;
  source: string;
  games: GameItem[];
  labels: {
    back: string;
    play: string;
    comingSoon: string;
    scientificFact: string;
    games: string;
    tier: { easy: string; medium: string; hard: string };
  };
}) {
  const tg = useTranslations('games');
  const locale = useLocale() as Loc;
  const areas = KEY_AREAS[categoryId] ?? [];
  const primaryDrill = CATEGORY_PRIMARY_DRILL[categoryId] ?? null;

  // Halol metrika: faqat REAL o'lchangan natija (loadLast). Yo'q bo'lsa — "—".
  const [score, setScore] = useState<number | null>(null);
  const [delta, setDelta] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (primaryDrill) {
      const last = loadLast(primaryDrill);
      setScore(last ? Math.round(last.performance * 100) : null);
      const h = loadHistory(primaryDrill);
      if (h.length >= 2) {
        setDelta(Math.round((h[h.length - 1].performance - h[0].performance) * 100));
      }
    }
    setMounted(true);
  }, [primaryDrill]);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col pb-28">
      {/* Cinematic hero — bo'lim foni video */}
      <section className="relative flex min-h-[44dvh] flex-col justify-end overflow-hidden px-5 pb-7 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <SectionVideo
          src={sectionVideoSrc(categoryId)}
          srcWide={sectionVideoSrcWide(categoryId)}
          gradient={sectionGradient(hue)}
          dim={0.35}
        />

        {/* Neon hero rasm — fonga singadi (screen blend), sekin suzadi.
            Matn o'qilishi uchun tepada, pastдан gradient bilan qoraytiriladi. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <HeroArt
            id={categoryId}
            float
            className="h-[34dvh] w-[88%] max-w-md"
            glowColor={`hsl(${hue}, 85%, 60%, 0.35)`}
          />
        </div>
        {/* pastki qoraytirish — sarlavha o'qilsin */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
          style={{ background: 'linear-gradient(180deg, rgba(6,8,15,0) 0%, rgba(6,8,15,0.85) 70%, #06080f 100%)' }}
        />

        <Link
          href="/games"
          className="absolute left-5 top-[max(1.5rem,env(safe-area-inset-top))] z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line/60 bg-bg/40 text-ink backdrop-blur-sm active:scale-95"
          aria-label={labels.back}
        >
          ←
        </Link>

        <h1
          className="grad-anim relative z-10 font-semibold"
          style={{
            fontSize: 'clamp(2.6rem, 11vw, 3.8rem)',
            lineHeight: '0.92',
            letterSpacing: '-0.045em',
            background: `linear-gradient(120deg, hsl(${hue}, 90%, 72%), #B06CFF, hsl(${hue}, 90%, 72%))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {name}
        </h1>
        <p className="relative z-10 mt-2 max-w-[22rem] text-[14px] leading-relaxed text-ink/75">
          {tagline}
        </p>
      </section>

      {/* Halol metrika — faqat real o'lchovdan keyin (anti-Lumosity) */}
      {primaryDrill && (
        <section className="mx-5 mt-5 flex items-center justify-between rounded-2xl border border-line bg-surface/40 p-5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              {tg('scoreTitle')}
            </span>
            <span className="max-w-[12rem] text-[11px] leading-snug text-muted">
              {tg('scoreNote')}
            </span>
          </div>
          <div className="flex flex-col items-end">
            {mounted && score != null ? (
              <>
                <span
                  className="num text-4xl font-semibold tabular-nums"
                  style={{ color: `hsl(${hue}, 80%, 64%)` }}
                >
                  {score}%
                </span>
                {delta != null && delta !== 0 && (
                  <span
                    className={[
                      'num text-[12px] font-semibold',
                      delta > 0 ? 'text-emerald-300' : 'text-danger',
                    ].join(' ')}
                  >
                    {delta > 0 ? '↑' : '↓'} {Math.abs(delta)} {tg('sinceFirst')}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="num text-4xl font-semibold text-muted/50">—</span>
                <span className="text-[10px] text-muted">{tg('scoreEmpty')}</span>
              </>
            )}
          </div>
        </section>
      )}

      {/* Key Areas — bu bo'lim ishga soladigan miya mintaqalari */}
      {areas.length > 0 && (
        <section className="mx-5 mt-4 rounded-2xl border border-line bg-surface/30 p-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            {tg('areasTitle')}
          </span>
          <ul className="mt-3 flex flex-col gap-3">
            {areas.map((a, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                  style={{
                    color: `hsl(${hue}, 80%, 64%)`,
                    background: `hsl(${hue}, 60%, 50%, 0.12)`,
                  }}
                >
                  ⊛
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-[14px] font-medium leading-tight text-ink">
                    {a.region[locale]}
                  </span>
                  <span className="text-[11px] leading-snug text-muted">
                    {a.fn[locale]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* O'yinlar ro'yxati */}
      <section className="flex flex-col gap-3 px-5 pt-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {labels.games}
        </h2>

        {games.map((g, i) => {
          const card = (
            <div
              className={[
                'group relative flex items-center gap-4 rounded-2xl border p-4 transition-all',
                g.ready
                  ? 'border-line bg-surface/50 active:scale-[0.99]'
                  : 'border-line/50 bg-surface/20 opacity-65',
              ].join(' ')}
            >
              <span className="num w-6 shrink-0 text-[11px] font-medium tabular-nums text-muted/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[17px] font-medium leading-tight text-ink">
                    {g.name}
                  </span>
                  {g.tier && (
                    <span
                      className="shrink-0 rounded-full border border-line/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted"
                    >
                      {labels.tier[g.tier]}
                    </span>
                  )}
                </div>
                <span className="line-clamp-2 text-[12px] leading-snug text-muted">
                  {g.desc}
                </span>
                {!g.ready && (
                  <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/80">
                    {labels.comingSoon}
                  </span>
                )}
              </div>
              <span
                aria-hidden
                className={[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base',
                  g.ready
                    ? 'border-line text-ink group-active:scale-95 group-hover:border-accent group-hover:bg-accent group-hover:text-bg'
                    : 'border-line/60 text-muted',
                ].join(' ')}
              >
                {g.ready ? '→' : '·'}
              </span>
            </div>
          );
          return g.ready && g.href ? (
            <Link key={g.id} href={g.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={g.id}>{card}</div>
          );
        })}
      </section>

      {/* Ilmiy fakt — har bo'lim ilmiy asosga ega (halol-data) */}
      <section className="mx-5 mt-7 rounded-2xl border border-line/70 bg-surface/30 p-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
          {labels.scientificFact}
        </span>
        <p className="mt-2 text-[13px] leading-relaxed text-ink/85">{fact}</p>
        <p className="mt-3 text-[11px] italic leading-snug text-muted">{source}</p>
      </section>

      <BottomNav />
    </main>
  );
}
