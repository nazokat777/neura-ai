'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loadLast } from '@/lib/storage';
import { getCategory } from '@/lib/catalog';

// "A-nuqtaga moslab" tavsiya: baseline (5 domen) natijasidan ENG PAST
// o'lchangan domenni topib, aynan o'sha kategoriyaning o'yinlarini taklif
// qiladi. HALOL: faqat real o'lchangan natijadan; o'lchanmagan bo'lsa —
// avval testni tavsiya qiladi (soxta tavsiya yo'q).

// Baseline domeni → (o'lchov mashqi, o'yin kategoriyasi).
const DOMAINS = [
  { domain: 'memory', drill: 'memory', category: 'memory' },
  { domain: 'attention', drill: 'schulte', category: 'attention' },
  { domain: 'logic', drill: 'math', category: 'logic' },
  { domain: 'speed', drill: 'speed', category: 'speed' },
  { domain: 'focus', drill: 'stroop', category: 'focus' },
] as const;

export default function RecommendedForYou() {
  const t = useTranslations('recForYou');
  const tdom = useTranslations('domains');
  const tg = useTranslations('games');
  const [weakest, setWeakest] = useState<(typeof DOMAINS)[number] | null>(null);
  const [hasData, setHasData] = useState<boolean | null>(null);

  useEffect(() => {
    let worst: (typeof DOMAINS)[number] | null = null;
    let worstScore = Infinity;
    for (const d of DOMAINS) {
      const last = loadLast(d.drill);
      if (last == null) continue;
      if (last.performance < worstScore) {
        worstScore = last.performance;
        worst = d;
      }
    }
    setWeakest(worst);
    setHasData(worst != null);
  }, []);

  // Hali render bo'lmagan (SSR/hidratsiya) — bo'sh.
  if (hasData == null) return null;

  // O'lchov yo'q — avval A-nuqtani aniqlashni taklif qilamiz.
  if (!weakest) {
    return (
      <section className="rounded-2xl border border-line bg-surface/40 p-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('kicker')}
        </span>
        <p className="mt-2 text-[14px] leading-relaxed text-ink/85">
          {t('noData')}
        </p>
        <Link
          href="/baseline"
          className="mt-4 inline-flex w-fit rounded-full bg-accent px-6 py-2.5 text-[13px] font-medium text-bg active:scale-95"
        >
          {t('startTest')} →
        </Link>
      </section>
    );
  }

  const cat = getCategory(weakest.category);
  const games = (cat?.games ?? []).filter((g) => g.ready && g.href).slice(0, 3);

  return (
    <section className="rounded-2xl border border-accent-dim/40 bg-accent-dim/10 p-5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
        {t('kicker')}
      </span>
      {/* Eng past domen — shuni mashq qilishni tavsiya qilamiz */}
      <p className="mt-2 text-[18px] font-medium text-ink">
        {tdom(weakest.domain)}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        {t('body', { domain: tdom(weakest.domain) })}
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {games.map((g) => (
          <li key={g.id}>
            <Link
              href={g.href!}
              className="group flex items-center gap-3 rounded-xl border border-line bg-bg/30 p-3 active:scale-[0.99]"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[15px] font-medium text-ink">
                  {tg(`item.${g.id}.name`)}
                </span>
                <span className="truncate text-[11px] text-muted">
                  {tg(`item.${g.id}.desc`)}
                </span>
              </div>
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-bg"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">{t('honest')}</p>
    </section>
  );
}
