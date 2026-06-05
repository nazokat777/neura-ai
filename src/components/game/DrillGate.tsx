'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { unlockAudio } from '@/lib/feedback';

// O'yin boshlanishidan oldin QOIDA popup'i. Foydalanuvchi "Tushundim"
// bosmaguncha o'yin (children) YUKLANMAYDI — shu bois o'yin mexanikasi
// foydalanuvchi tayyor bo'lganda boshlanadi (avtomatik boshlanib ketmaydi).
export default function DrillGate({
  title,
  rule,
  note,
  survival,
  children,
}: {
  title: string;
  rule: string;
  note?: string;
  /** Survival o'yin: "♥♥♥ 3 jon" eslatmasini ko'rsatadi. */
  survival?: boolean;
  children: React.ReactNode;
}) {
  const tc = useTranslations('common');
  const [started, setStarted] = useState(false);

  if (started) return <>{children}</>;

  return (
    <div className="flex min-h-[70dvh] w-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface/50 p-7 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {tc('howToPlay')}
        </span>
        <h2
          className="t-display mt-3"
          style={{ fontSize: 'clamp(1.7rem, 7vw, 2.2rem)', lineHeight: '1.05' }}
        >
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-[20rem] text-[15px] leading-relaxed text-ink/85">
          {rule}
        </p>
        {survival && (
          <p className="mx-auto mt-4 flex items-center justify-center gap-1.5 text-[13px] font-medium text-ink/80">
            <span className="tracking-tight text-danger">♥♥♥</span>
            {tc('livesNote')}
          </p>
        )}
        {note && (
          <p className="mx-auto mt-3 max-w-[20rem] text-[12px] leading-snug text-muted">
            {note}
          </p>
        )}
        <button
          onClick={() => {
            // User gesturesi ICHIDA audio kontekstini ochamiz (ovoz chiqsin).
            unlockAudio();
            setStarted(true);
          }}
          className="mt-7 w-full rounded-full bg-accent px-8 py-3.5 font-medium text-bg active:scale-95"
        >
          {tc('understood')}
        </button>
      </div>
    </div>
  );
}
