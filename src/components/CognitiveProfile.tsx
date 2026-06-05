'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadLast, loadHistory } from '@/lib/storage';

// Domen ↔ mashq bog'lanishi. Har domen ballı shu mashqning OXIRGI natijasidan.
// HALOL: faqat real o'lchangan; o'lchanmagan domen "—" bilan ko'rsatiladi.
const DOMAINS = [
  { domain: 'attention', drillId: 'schulte' },
  { domain: 'memory', drillId: 'memory' },
  { domain: 'speed', drillId: 'speed' },
  { domain: 'focus', drillId: 'stroop' },
  { domain: 'logic', drillId: 'math' },
] as const;

interface DomainCard {
  domain: string;
  pct: number | null; // 0..100
  level: number | null;
  delta: number | null; // o'tgan o'lchovdan farq (foiz punkti)
}

export default function CognitiveProfile() {
  const tdom = useTranslations('domains');
  const tp = useTranslations('profile');

  const [data, setData] = useState<DomainCard[] | null>(null);

  useEffect(() => {
    setData(
      DOMAINS.map(({ domain, drillId }) => {
        const last = loadLast(drillId);
        const hist = loadHistory(drillId);
        let delta: number | null = null;
        if (hist.length >= 2) {
          const cur = hist[hist.length - 1].performance;
          const prev = hist[hist.length - 2].performance;
          delta = Math.round((cur - prev) * 100);
        }
        return {
          domain,
          pct: last ? Math.round(last.performance * 100) : null,
          level: last ? last.level : null,
          delta,
        };
      }),
    );
  }, []);

  const cards = data ?? DOMAINS.map((d) => ({ domain: d.domain, pct: null, level: null, delta: null }));
  const measuredCount = cards.filter((c) => c.pct != null).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Sarlavha + halol holat */}
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {tp('measured')}
        </span>
        <span className="num text-[11px] font-medium tabular-nums text-muted/70">
          {String(measuredCount).padStart(2, '0')} / {String(DOMAINS.length).padStart(2, '0')}
        </span>
      </div>

      {/* Premium domen kartalari */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => {
          const measured = c.pct != null;
          return (
            <div
              key={c.domain}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
            >
              {/* yuqori nozik gradient chiziq */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background: measured
                    ? 'linear-gradient(90deg, transparent, rgba(125,140,255,0.6), transparent)'
                    : 'transparent',
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink">
                  {tdom(c.domain)}
                </span>
                {measured && c.delta != null && c.delta !== 0 && (
                  <span
                    className={[
                      'num text-[11px] font-semibold',
                      c.delta > 0 ? 'text-emerald-300' : 'text-danger',
                    ].join(' ')}
                  >
                    {c.delta > 0 ? '↑' : '↓'} {Math.abs(c.delta)}
                  </span>
                )}
              </div>

              {/* Katta gradient raqam yoki "—" */}
              {measured ? (
                <p
                  className="num mt-1 font-semibold leading-none"
                  style={{
                    fontSize: '2.4rem',
                    background: 'linear-gradient(135deg, #6FA8FF, #B06CFF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {c.pct}
                </p>
              ) : (
                <p className="num mt-1 text-[2.4rem] font-semibold leading-none text-muted/30">
                  —
                </p>
              )}

              {/* Progress bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${measured ? c.pct : 0}%`,
                    background: 'linear-gradient(90deg, #4D8DFF, #B06CFF)',
                  }}
                />
              </div>

              <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                {measured ? tp('level', { n: c.level! }) : tp('notMeasured')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Halol-data izohi */}
      <div className="mt-1 flex items-start gap-3">
        <span
          aria-hidden
          className="mt-[7px] inline-block h-1 w-6 shrink-0 rounded-full bg-accent"
        />
        <p className="max-w-[20rem] text-[12px] leading-relaxed text-muted">
          {tp('honest')}
        </p>
      </div>
    </div>
  );
}
