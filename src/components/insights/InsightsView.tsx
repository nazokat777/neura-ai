'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loadLast, loadHistory, type HistoryPoint } from '@/lib/storage';
import BottomNav from '@/components/nav/BottomNav';
import BackButton from '@/components/nav/BackButton';
import LangLink from '@/components/nav/LangLink';
import StreakBadge from '@/components/game/StreakBadge';
import Sparkline from '@/components/insights/Sparkline';

// Tahlil ekrani — "Neyron Indeks" + kognitiv profil.
// HALOL-DATA: indeks faqat REAL o'lchangan mashq natijalaridan hisoblanadi.
// Bu populyatsiya bo'yicha normalangan IQ EMAS — o'zingga nisbatan ko'rsatkich.
// O'lchanmagan domen profilga kirmaydi (soxta ball yo'q).

// Profil domenlari → mashq id. (Moslashuvchanlik = Stroop / tormozlash.)
const DOMAINS = [
  { key: 'memory', drill: 'memory' },
  { key: 'attention', drill: 'schulte' },
  { key: 'logic', drill: 'math' },
  { key: 'speed', drill: 'speed' },
  { key: 'adapt', drill: 'stroop' },
] as const;

export default function InsightsView() {
  const t = useTranslations('insights');
  const tdom = useTranslations('insights.dom');
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [history, setHistory] = useState<Record<string, HistoryPoint[]>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const next: Record<string, number | null> = {};
    const hist: Record<string, HistoryPoint[]> = {};
    for (const d of DOMAINS) {
      const last = loadLast(d.drill);
      next[d.key] = last ? Math.round(last.performance * 100) : null;
      hist[d.key] = loadHistory(d.drill);
    }
    setScores(next);
    setHistory(hist);
    setMounted(true);
  }, []);

  // O'sish delta'si — oxirgi natija birinchi o'lchovga nisbatan (halol).
  function deltaFor(key: string): number | null {
    const h = history[key];
    if (!h || h.length < 2) return null;
    return Math.round((h[h.length - 1].performance - h[0].performance) * 100);
  }

  const measured = DOMAINS.filter((d) => scores[d.key] != null);
  const avg =
    measured.length > 0
      ? measured.reduce((s, d) => s + (scores[d.key] as number), 0) /
        measured.length
      : null;
  // Indeks: o'lchangan o'rtacha samaradorlikni 70..130 oralig'iga shaffof
  // chiziqli moslash (100 = o'rtacha samaradorlik). Soxta emas — hisob ochiq.
  const index = avg != null ? Math.round(70 + (avg / 100) * 60) : null;

  // Eng kuchli domen (faqat o'lchanganlar orasidan).
  const top =
    measured.length > 0
      ? measured.reduce((a, b) =>
          (scores[a.key] as number) >= (scores[b.key] as number) ? a : b,
        )
      : null;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <span className="text-sm font-semibold tracking-tight text-ink">
            {t('appName')}
          </span>
        </div>
        <LangLink />
      </header>

      <section className="mt-7 flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('kicker')}
        </span>
        <h1
          className="t-display"
          style={{ fontSize: 'clamp(2.2rem, 8.5vw, 3rem)', lineHeight: '0.96', letterSpacing: '-0.04em' }}
        >
          {t('title')}
        </h1>
      </section>

      {/* Neyron Indeks — markaziy ko'rsatkich */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface/40 p-6 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          {t('indexLabel')}
        </span>
        {mounted && index != null ? (
          <>
            <div
              className="num mt-2 font-display tabular-nums text-ink"
              style={{ fontSize: 'clamp(3.6rem, 18vw, 5rem)', lineHeight: '1' }}
            >
              {index}
            </div>
            <p className="mx-auto mt-2 max-w-[20rem] text-[11px] leading-relaxed text-muted">
              {t('indexHonest', { n: measured.length, total: DOMAINS.length })}
            </p>
          </>
        ) : (
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            {t('noData')}
          </p>
        )}
      </section>

      {/* Kunlik streak */}
      {mounted && (
        <section className="mt-5">
          <StreakBadge />
        </section>
      )}

      {/* Kognitiv profil — domen bo'yicha barlar + o'sish sparkline */}
      <section className="mt-7 flex flex-col gap-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {t('profile')}
        </h2>
        <ul className="flex flex-col gap-3.5">
          {DOMAINS.map((d) => {
            const v = scores[d.key];
            const isTop = top?.key === d.key;
            const delta = mounted ? deltaFor(d.key) : null;
            const hist = history[d.key] ?? [];
            return (
              <li key={d.key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium text-ink">
                    {tdom(d.key)}
                    {isTop && <span className="ml-1.5 text-accent">★</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    {hist.length >= 2 && (
                      <Sparkline values={hist.map((p) => p.performance)} />
                    )}
                    {delta != null && delta !== 0 && (
                      <span
                        className={[
                          'num text-[11px] font-semibold tabular-nums',
                          delta > 0 ? 'text-accent' : 'text-danger',
                        ].join(' ')}
                      >
                        {delta > 0 ? '+' : ''}
                        {delta}
                      </span>
                    )}
                    {mounted && v != null ? (
                      <span className="num text-[12px] tabular-nums text-muted">
                        {v}%
                      </span>
                    ) : (
                      <span className="text-[11px] italic text-muted/70">
                        {t('notMeasured')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: mounted && v != null ? `${v}%` : '0%',
                      background: isTop
                        ? 'linear-gradient(90deg, #2D5BD0, #4D8DFF)'
                        : '#4D8DFF',
                      opacity: v != null ? 1 : 0.25,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Kuchli tomon */}
      {mounted && top && (
        <section className="mt-7 rounded-2xl border border-accent-dim/40 bg-accent-dim/10 p-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            {t('strength')}
          </span>
          <p className="mt-2 text-[18px] font-medium text-ink">{tdom(top.key)}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            {t('strengthBody')}
          </p>
        </section>
      )}

      {/* Tavsiya etilgan mashqlar */}
      <section className="mt-7 flex flex-col gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {t('recommended')}
        </h2>
        <div className="flex gap-3">
          <Link
            href="/games"
            className="flex-1 rounded-2xl border border-line bg-surface/40 p-4 active:scale-[0.99]"
          >
            <span className="text-[15px] font-medium text-ink">{t('ctaGames')}</span>
            <p className="mt-1 text-[11px] text-muted">{t('ctaGamesSub')}</p>
          </Link>
          <Link
            href="/recommendations"
            className="flex-1 rounded-2xl border border-line bg-surface/40 p-4 active:scale-[0.99]"
          >
            <span className="text-[15px] font-medium text-ink">{t('ctaRecs')}</span>
            <p className="mt-1 text-[11px] text-muted">{t('ctaRecsSub')}</p>
          </Link>
        </div>
      </section>

      <footer className="mt-8 flex items-start gap-3">
        <span aria-hidden className="mt-[7px] inline-block h-1 w-6 shrink-0 rounded-full bg-accent" />
        <p className="text-[12px] leading-relaxed text-muted">{t('honest')}</p>
      </footer>

      <BottomNav />
    </main>
  );
}
