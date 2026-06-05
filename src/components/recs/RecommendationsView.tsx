'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadOnboarding } from '@/lib/storage';

const ALL = ['sleep', 'exercise', 'nutrition', 'oxygen', 'earlyWake', 'mental'] as const;
const HARMS = ['stress', 'sugar', 'sleepLoss', 'processed'] as const;

// Anketaga qarab tavsiyalar tartibini shaxsiylashtirish (eng dolzarbi tepada).
function orderFor(o: ReturnType<typeof loadOnboarding>): string[] {
  const priority: string[] = [];
  if (o?.sleep === 'lt5' || o?.sleep === 'h56') priority.push('sleep');
  if (o?.stress === 'high') priority.push('exercise');
  if (o?.nutrition === 'poor') priority.push('nutrition');
  if (o?.concerns?.includes('fatigue')) priority.push('exercise');
  const rest = ALL.filter((k) => !priority.includes(k));
  // takrorlarsiz birlashtirish + halol "training" eslatmasi oxirida
  return [...new Set([...priority, ...rest]), 'training'];
}

export default function RecommendationsView() {
  const t = useTranslations('recs');
  const [order, setOrder] = useState<string[]>([...ALL, 'training']);

  useEffect(() => {
    setOrder(orderFor(loadOnboarding()));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="animate-rise text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('kicker')}
        </span>
        <h1
          className="t-display animate-rise"
          style={{
            animationDelay: '60ms',
            fontSize: 'clamp(2rem, 8vw, 2.8rem)',
            lineHeight: '1.0',
            letterSpacing: '-0.03em',
          }}
        >
          {t('title')}
        </h1>
        <p className="max-w-[22rem] text-[14px] leading-relaxed text-muted">
          {t('intro')}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {order.map((key, i) => {
          const honest = key === 'training';
          return (
            <li
              key={key}
              className={[
                'animate-rise rounded-2xl border p-5',
                honest ? 'border-accent/40 bg-accent/5' : 'border-line bg-surface',
              ].join(' ')}
              style={{ animationDelay: `${120 + i * 60}ms` }}
            >
              <h2 className="text-[16px] font-semibold text-ink">
                {t(`items.${key}.title`)}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {t(`items.${key}.body`)}
              </p>
              <p className="mt-3 text-[11px] text-muted/70">
                <span className="font-semibold uppercase tracking-[0.12em] text-accent/80">
                  {t('sourceLabel')}:
                </span>{' '}
                {t(`items.${key}.source`)}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Miyaga zararli omillar */}
      <h2 className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-danger">
        {t('harmsTitle')}
      </h2>
      <ul className="flex flex-col gap-3">
        {HARMS.map((key, i) => (
          <li
            key={key}
            className="animate-rise rounded-2xl border border-danger/30 bg-danger/5 p-5"
            style={{ animationDelay: `${100 + i * 60}ms` }}
          >
            <h3 className="text-[16px] font-semibold text-ink">
              {t(`harms.${key}.title`)}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              {t(`harms.${key}.body`)}
            </p>
            <p className="mt-3 text-[11px] text-muted/70">
              <span className="font-semibold uppercase tracking-[0.12em] text-danger/80">
                {t('sourceLabel')}:
              </span>{' '}
              {t(`harms.${key}.source`)}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-[7px] inline-block h-1 w-6 shrink-0 rounded-full bg-accent"
        />
        <p className="max-w-[22rem] text-[12px] leading-relaxed text-muted">
          {t('honest')}
        </p>
      </div>
    </div>
  );
}
