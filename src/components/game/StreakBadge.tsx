'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadStreak } from '@/lib/storage';

// Kunlik streak nishoni — motivatsion, halol (faqat real faollik kunlari).
export default function StreakBadge({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('streak');
  const [streak, setStreak] = useState<{ current: number; longest: number } | null>(
    null,
  );

  useEffect(() => {
    const s = loadStreak();
    setStreak({ current: s.current, longest: s.longest });
  }, []);

  if (!streak) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink">
        <span aria-hidden className="text-accent">
          ◆
        </span>
        <span className="num tabular-nums">{streak.current}</span>
        <span className="text-muted">{t('short')}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-line bg-surface/40 px-5 py-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-xl text-accent"
          style={{ boxShadow: '0 0 16px rgba(77,141,255,0.25)' }}
        >
          ◆
        </span>
        <div className="flex flex-col">
          <span className="num text-[22px] font-semibold leading-none text-ink">
            {streak.current}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {t('days')}
          </span>
        </div>
      </div>
      <div className="text-right">
        <span className="num text-[15px] font-medium text-ink">
          {streak.longest}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          {t('best')}
        </p>
      </div>
    </div>
  );
}
