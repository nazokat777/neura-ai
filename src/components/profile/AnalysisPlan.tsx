'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loadOnboarding } from '@/lib/storage';
import { getCategory } from '@/lib/catalog';
import { KEY_AREAS, type Loc } from '@/lib/keyAreas';
import { buildAnalysis, type Analysis } from '@/lib/analysis';

// "Miya olimi tahlili": baseline o'lchovi + anketa javoblariга moslab shaxsiy
// reja. HALOL: o'lchov + o'z-baho, tibbiy tashxis emas. Eng kuchli neyrofan
// yondashuvi — zaif o'lchangan va siz belgilagan sohalarga e'tibor.

const TOP_N = 3;

export default function AnalysisPlan() {
  const t = useTranslations('analysis');
  const tg = useTranslations('games');
  const locale = useLocale() as Loc;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    setAnalysis(buildAnalysis(loadOnboarding()));
  }, []);

  if (analysis == null) return null;

  // Signal yo'q — avval anketa + testni taklif qilamiz (soxta tavsiya yo'q).
  if (analysis.empty) {
    return (
      <section className="rounded-3xl border border-line bg-surface/40 p-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('kicker')}
        </span>
        <p className="mt-3 text-[14px] leading-relaxed text-ink/85">{t('noData')}</p>
        <Link
          href="/baseline"
          className="mt-4 inline-flex w-fit rounded-full bg-accent px-6 py-2.5 text-[13px] font-medium text-bg active:scale-95"
        >
          {t('startTest')} →
        </Link>
      </section>
    );
  }

  const items = analysis.items.slice(0, TOP_N);

  return (
    <section className="rounded-3xl border border-accent-dim/40 bg-gradient-to-b from-accent-dim/10 to-transparent p-6">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
        {t('kicker')}
      </span>
      <h3
        className="t-display mt-2"
        style={{ fontSize: 'clamp(1.5rem, 6vw, 1.9rem)', lineHeight: '1.05' }}
      >
        {t('title')}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{t('intro')}</p>

      <ol className="mt-5 flex flex-col gap-4">
        {items.map((it, i) => {
          const cat = getCategory(it.category);
          const games = (cat?.games ?? [])
            .filter((g) => g.ready && g.href)
            .slice(0, 2);
          const area = KEY_AREAS[it.category]?.[0];
          return (
            <li
              key={it.category}
              className="rounded-2xl border border-line bg-bg/30 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[13px] font-semibold text-accent">
                  {i + 1}
                </span>
                <span className="flex-1 text-[17px] font-semibold text-ink">
                  {tg(`cat.${it.category}.name`)}
                </span>
                {it.measured != null && (
                  <span className="num rounded-full border border-line px-2.5 py-1 text-[12px] font-semibold text-ink">
                    {it.measured}
                    <span className="text-muted">/100</span>
                  </span>
                )}
              </div>

              {/* Miya mintaqasi · funksiyasi */}
              {area && (
                <p className="mt-2 text-[12px] text-muted">
                  <span className="text-accent">●</span> {area.region[locale]} ·{' '}
                  {area.fn[locale]}
                </p>
              )}

              {/* Nega tavsiya qilindi — sabab teglari */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {it.reasons.weak && (
                  <Tag tone="warn">{t('reason.weak')}</Tag>
                )}
                {it.reasons.concern && <Tag>{t('reason.concern')}</Tag>}
                {it.reasons.goal && <Tag>{t('reason.goal')}</Tag>}
              </div>

              {/* Tavsiya etilgan mashqlar */}
              <ul className="mt-3 flex flex-col gap-2">
                {games.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={g.href!}
                      className="group flex items-center gap-3 rounded-xl border border-line bg-surface/40 p-3 active:scale-[0.99]"
                    >
                      <span className="flex-1 truncate text-[14px] font-medium text-ink">
                        {tg(`item.${g.id}.name`)}
                      </span>
                      <span
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-[13px] text-ink transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-bg"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-[11px] leading-relaxed text-muted">{t('honest')}</p>
    </section>
  );
}

function Tag({
  children,
  tone = 'accent',
}: {
  children: React.ReactNode;
  tone?: 'accent' | 'warn';
}) {
  return (
    <span
      className={[
        'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
        tone === 'warn'
          ? 'bg-danger/15 text-danger'
          : 'bg-accent/15 text-accent',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
