'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { ApplyOutcome } from '@/drills/engine/AdaptiveController';

export interface StatItem {
  label: string;
  value: string;
}

// Har mashq oxirida premium natija ekrani (halol: faqat o'lchangan qiymat).
// Birinchi stat — katta gradient "hero" ko'rsatkich; qolganlari shisha kartalar.
export default function ResultPanel({
  outcome,
  stats,
  onContinue,
}: {
  outcome: ApplyOutcome;
  stats: StatItem[];
  onContinue: () => void;
}) {
  const tc = useTranslations('common');
  const tr = useTranslations('result');
  const tb = useTranslations('baseline');
  const router = useRouter();

  const [fromBaseline, setFromBaseline] = useState(false);
  useEffect(() => {
    setFromBaseline(new URLSearchParams(window.location.search).get('b') === '1');
  }, []);

  const hero = stats[0];
  const rest = stats.slice(1);
  const dirText = outcome.direction === 'up' ? '↑' : outcome.direction === 'down' ? '↓' : '=';
  const dirColor =
    outcome.direction === 'up'
      ? 'text-emerald-300'
      : outcome.direction === 'down'
        ? 'text-danger'
        : 'text-muted';

  return (
    <div className="animate-pop relative mx-auto flex w-full max-w-md flex-col px-4 py-6">
      {/* Yumshoq nur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 0%, rgba(125,100,255,0.22), rgba(6,8,15,0) 70%)',
        }}
      />

      <span className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
        {tr('title')}
      </span>

      {/* Hero — asosiy ko'rsatkich */}
      {hero && (
        <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl">
          <p
            className="num grad-anim font-semibold leading-none"
            style={{
              fontSize: 'clamp(3.2rem, 16vw, 4.6rem)',
              background: 'linear-gradient(135deg, #6FA8FF, #B06CFF, #6FA8FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {hero.value}
          </p>
          <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
            {hero.label}
          </p>
        </div>
      )}

      {/* Qolgan statistikalar — shisha kartalar */}
      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {rest.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-xl"
            >
              <p className="num text-2xl font-semibold text-ink">{s.value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Daraja qatori */}
      <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 backdrop-blur-xl">
        <span className="text-[13px] text-muted">{tr('nextLevel')}</span>
        <span className="num flex items-center gap-1.5 text-[15px] font-semibold text-ink">
          {outcome.state.D}
          <span className={['animate-accent', dirColor].join(' ')}>{dirText}</span>
        </span>
      </div>

      {/* Tugmalar */}
      <div className="mt-7 flex flex-col gap-3">
        {fromBaseline ? (
          <>
            <button
              onClick={() => router.push('/baseline')}
              className="w-full rounded-full py-4 text-[16px] font-semibold text-bg active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4D8DFF, #B06CFF)', boxShadow: '0 8px 28px rgba(125,100,255,0.35)' }}
            >
              {tb('returnToTest')} →
            </button>
            <button
              onClick={onContinue}
              className="w-full rounded-full border border-white/10 bg-white/[0.03] py-3 text-[14px] font-medium text-ink active:scale-[0.98]"
            >
              {tc('continue')}
            </button>
          </>
        ) : (
          <button
            onClick={onContinue}
            className="shimmer-sheen grad-anim relative w-full overflow-hidden rounded-full py-4 text-[16px] font-semibold text-bg active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #4D8DFF, #7B5BFF, #B06CFF)', boxShadow: '0 8px 28px rgba(125,100,255,0.35)' }}
          >
            {tc('continue')} →
          </button>
        )}
      </div>
    </div>
  );
}
