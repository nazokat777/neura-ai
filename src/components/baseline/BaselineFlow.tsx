'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { loadLast, setBaselineDone } from '@/lib/storage';

// A nuqtasi = 5 domenni real o'lchash. Har mashqdan bittadan o'ynaladi,
// natija profilni (miya) to'ldiradi. Halol: soxta IQ emas, real o'lchov.
const DOMAINS = [
  { domain: 'attention', drillId: 'schulte', href: '/drills/schulte' },
  { domain: 'memory', drillId: 'memory', href: '/drills/memory' },
  { domain: 'speed', drillId: 'speed', href: '/drills/speed' },
  { domain: 'focus', drillId: 'stroop', href: '/drills/stroop' },
  { domain: 'logic', drillId: 'math', href: '/drills/math' },
] as const;

export default function BaselineFlow() {
  const t = useTranslations('baseline');
  const td = useTranslations('drills');
  const tdom = useTranslations('domains');
  const tc = useTranslations('common');
  const router = useRouter();

  const [done, setDone] = useState<Record<string, boolean>>({});

  // Klientda: qaysi domen o'lchanganini aniqlash (loadLast).
  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const d of DOMAINS) map[d.drillId] = loadLast(d.drillId) != null;
    setDone(map);
  }, []);

  const doneCount = DOMAINS.filter((d) => done[d.drillId]).length;
  const allDone = doneCount === DOMAINS.length;

  function reveal() {
    setBaselineDone();
    // "A nuqtamni ko'rsat" → NATIJALAR (Tahlil: Neyron Indeks + 5 domen ball).
    // Tavsiya/reja/akkaunt oqimi Tahlil va Profilдан havola orqali ochiladi.
    router.push('/insights');
  }

  return (
    <div className="flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
      {/* Yuqori panel: orqaga (bosh sahifa) + keyinroq o'tkazib yuborish */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line/60 bg-bg/40 text-ink backdrop-blur-sm active:scale-95"
          aria-label={tc('back')}
        >
          ←
        </Link>
        <Link
          href="/"
          className="text-[12px] font-medium text-muted active:scale-95"
        >
          {tc('skip')}
        </Link>
      </div>

      <span className="animate-rise text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {t('kicker')}
      </span>
      <h1
        className="t-display animate-rise mt-3"
        style={{
          animationDelay: '60ms',
          fontSize: 'clamp(2rem, 8vw, 2.8rem)',
          lineHeight: '1.0',
          letterSpacing: '-0.03em',
        }}
      >
        {t('title')}
      </h1>
      <p className="mt-3 max-w-[22rem] text-[14px] leading-relaxed text-muted">
        {t('intro')}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface2">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(doneCount / DOMAINS.length) * 100}%` }}
          />
        </div>
        <span className="num text-[11px] font-medium tabular-nums text-muted">
          {t('progress', { done: doneCount, total: DOMAINS.length })}
        </span>
      </div>

      <ul className="mt-6 flex flex-1 flex-col">
        {DOMAINS.map((d, i) => {
          const isDone = done[d.drillId];
          return (
            <li
              key={d.domain}
              className={[
                'flex items-center gap-4 border-t border-line py-4',
                i === DOMAINS.length - 1 ? 'border-b' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full border text-[12px]',
                  isDone ? 'border-accent bg-accent text-bg' : 'border-line text-muted',
                ].join(' ')}
              >
                {isDone ? '✓' : i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-medium text-ink">
                  {td(d.drillId)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                  {tdom(d.domain)}
                </span>
              </div>
              <Link
                href={`${d.href}?b=1`}
                className={[
                  'rounded-full px-4 py-1.5 text-[13px] font-medium active:scale-95',
                  isDone ? 'text-muted' : 'bg-accent text-bg',
                ].join(' ')}
              >
                {isDone ? t('done') : t('play')}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        onClick={reveal}
        disabled={!allDone}
        className="mt-8 rounded-full bg-accent px-9 py-3 font-medium text-bg transition-opacity active:scale-95 disabled:opacity-30"
      >
        {t('reveal')}
      </button>
      <p className="mt-5 text-center text-[11px] leading-relaxed text-muted">
        {t('honest')}
      </p>
    </div>
  );
}
