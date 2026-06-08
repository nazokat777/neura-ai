'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loadHistory, loadStreak, clearAll, type HistoryPoint } from '@/lib/storage';
import { CATALOG } from '@/lib/catalog';

// Akkaunt natijalari — HALOL-DATA: faqat real o'ynalgan raundlardan
// hisoblanadi (haftalik/oylik faollik + o'rtacha samaradorlik + o'sish).
// Akkauntni o'chirish: lokal — server yo'q, hamma iz qurilmadan tozalanadi.

const DAY = 86400000;

interface Span {
  rounds: number;
  activeDays: number;
  avg: number | null; // 0..100
  growth: number | null; // % delta (oxirgi - birinchi) shu oraliqда
}

function summarize(points: HistoryPoint[], sinceMs: number, nowMs: number): Span {
  const inSpan = points.filter((p) => p.at >= sinceMs && p.at <= nowMs);
  if (inSpan.length === 0) return { rounds: 0, activeDays: 0, avg: null, growth: null };
  const days = new Set(inSpan.map((p) => Math.floor(p.at / DAY)));
  const avg =
    (inSpan.reduce((s, p) => s + p.performance, 0) / inSpan.length) * 100;
  const sorted = [...inSpan].sort((a, b) => a.at - b.at);
  const growth =
    sorted.length >= 2
      ? (sorted[sorted.length - 1].performance - sorted[0].performance) * 100
      : null;
  return {
    rounds: inSpan.length,
    activeDays: days.size,
    avg: Math.round(avg),
    growth: growth != null ? Math.round(growth) : null,
  };
}

export default function AccountView() {
  const t = useTranslations('account');
  const tp = useTranslations('privacy');
  const locale = useLocale();
  const [weekly, setWeekly] = useState<Span | null>(null);
  const [monthly, setMonthly] = useState<Span | null>(null);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [mounted, setMounted] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    // Barcha tayyor mashqlar tarixini birlashtiramiz.
    const ids = new Set<string>();
    for (const cat of CATALOG) for (const g of cat.games) if (g.ready) ids.add(g.id);
    const all: HistoryPoint[] = [];
    for (const id of ids) all.push(...loadHistory(id));
    const now = Date.now();
    setWeekly(summarize(all, now - 7 * DAY, now));
    setMonthly(summarize(all, now - 30 * DAY, now));
    const s = loadStreak();
    setStreak({ current: s.current, longest: s.longest });
    setMounted(true);
  }, []);

  function doDelete() {
    clearAll();
    // Qattiq yuklash — barcha holat tozalanib, BIRINCHI sahifa (til tanlash)
    // ochiladi. router.replace yetarli emas edi (eski holat qolardi).
    window.location.href = `/${locale}/language`;
  }

  const hasData = mounted && ((weekly?.rounds ?? 0) > 0 || (monthly?.rounds ?? 0) > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="animate-rise text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('kicker')}
        </span>
        <h1
          className="t-display animate-rise"
          style={{ animationDelay: '60ms', fontSize: 'clamp(2rem, 8vw, 2.8rem)', lineHeight: '1.0', letterSpacing: '-0.03em' }}
        >
          {t('title')}
        </h1>
      </div>

      {!hasData ? (
        <p className="text-[14px] leading-relaxed text-muted">{t('noData')}</p>
      ) : (
        <>
          {/* Streak */}
          <div className="flex items-center gap-4 rounded-2xl border border-accent-dim/40 bg-accent-dim/10 p-5">
            <span className="text-[30px]">🔥</span>
            <div className="flex flex-col">
              <span className="num text-[24px] font-semibold tabular-nums text-ink">
                {streak.current}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                {t('streakLabel')}
              </span>
            </div>
          </div>

          {([['weekly', weekly], ['monthly', monthly]] as const).map(([key, span]) => (
            <section key={key} className="flex flex-col gap-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                {t(key)}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Stat label={t('rounds')} value={`${span?.rounds ?? 0}`} />
                <Stat label={t('activeDays')} value={`${span?.activeDays ?? 0}`} />
                <Stat label={t('avg')} value={span?.avg != null ? `${span.avg}%` : '—'} />
                <Stat
                  label={t('growth')}
                  value={span?.growth != null ? `${span.growth > 0 ? '+' : ''}${span.growth}%` : '—'}
                  accent={span?.growth != null && span.growth > 0}
                />
              </div>
            </section>
          ))}
        </>
      )}

      {/* Xavfli hudud — akkauntni o'chirish */}
      <section className="mt-2 flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-danger">
          {t('dangerTitle')}
        </h2>
        <p className="text-[13px] leading-relaxed text-muted">{t('deleteDesc')}</p>
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="mt-1 w-fit rounded-full border border-danger/50 px-6 py-2.5 text-[14px] font-medium text-danger active:scale-95"
          >
            {t('deleteBtn')}
          </button>
        ) : (
          <div className="mt-1 flex flex-col gap-3 rounded-xl border border-danger/40 bg-bg/40 p-4">
            <p className="text-[14px] font-semibold text-ink">{t('confirmTitle')}</p>
            <p className="text-[13px] leading-relaxed text-muted">{t('confirmBody')}</p>
            <div className="flex gap-3">
              <button
                onClick={doDelete}
                className="flex-1 rounded-full bg-danger px-5 py-2.5 text-[14px] font-medium text-bg active:scale-95"
              >
                {t('confirmYes')}
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 rounded-full border border-line px-5 py-2.5 text-[14px] font-medium text-ink active:scale-95"
              >
                {t('confirmNo')}
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-[7px] inline-block h-1 w-6 shrink-0 rounded-full bg-accent" />
        <p className="text-[12px] leading-relaxed text-muted">{t('honest')}</p>
      </div>

      <Link
        href="/privacy"
        className="text-[12px] text-muted underline underline-offset-2 active:scale-95"
      >
        {tp('title')}
      </Link>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface/40 p-4">
      <span
        className={[
          'num text-[26px] font-semibold tabular-nums',
          accent ? 'text-accent' : 'text-ink',
        ].join(' ')}
      >
        {value}
      </span>
      <span className="text-[11px] font-medium text-muted">{label}</span>
    </div>
  );
}
