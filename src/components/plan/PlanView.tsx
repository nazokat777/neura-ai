'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loadLast } from '@/lib/storage';
import { getCategory } from '@/lib/catalog';

// Kunlik reja — mashqlar ketma-ketligi. Natijaga moslab tartiblanadi:
// eng ZAIF domen birinchi (ko'proq foyda). Har domendan bitta tayyor o'yin.
// HALOL: tartib faqat real o'lchangan natijadan; majburiy emas.

const DOMAINS = [
  { domain: 'memory', drill: 'memory', category: 'memory' },
  { domain: 'attention', drill: 'schulte', category: 'attention' },
  { domain: 'logic', drill: 'math', category: 'logic' },
  { domain: 'speed', drill: 'speed', category: 'speed' },
  { domain: 'focus', drill: 'stroop', category: 'focus' },
] as const;

interface Item {
  domain: string;
  gameId: string;
  href: string;
  score: number | null;
}

export default function PlanView() {
  const t = useTranslations('plan');
  const tdom = useTranslations('domains');
  const tg = useTranslations('games');
  const [items, setItems] = useState<Item[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const list: Item[] = [];
    for (const d of DOMAINS) {
      const cat = getCategory(d.category);
      const g = (cat?.games ?? []).find((x) => x.ready && x.href);
      if (!g) continue;
      const last = loadLast(d.drill);
      list.push({
        domain: d.domain,
        gameId: g.id,
        href: g.href!,
        score: last ? Math.round(last.performance * 100) : null,
      });
    }
    // Zaifdan kuchliga (o'lchanmagan — oxirida).
    list.sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
    setItems(list);
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
        <p className="max-w-[22rem] text-[14px] leading-relaxed text-muted">{t('intro')}</p>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((it, i) => (
          <li
            key={it.gameId}
            className="animate-rise flex items-center gap-4 rounded-2xl border border-line bg-surface/40 p-4"
            style={{ animationDelay: `${100 + i * 60}ms` }}
          >
            <span className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/50 text-[13px] font-semibold text-accent">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[15px] font-medium text-ink">
                {tg(`item.${it.gameId}.name`)}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                {tdom(it.domain)}
                {it.score != null && (
                  <span className="num ml-2 font-medium text-muted">{it.score}%</span>
                )}
              </span>
            </div>
            <Link
              href={it.href}
              className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-[13px] font-medium text-bg active:scale-95"
            >
              {t('play')}
            </Link>
          </li>
        ))}
      </ul>

      {/* Foydalanuvchi xohlasa mashqlarni o'ynaydi, xohlasa bosh sahifaga o'tadi */}
      <Link
        href="/"
        className="mt-2 w-full rounded-full px-9 py-4 text-center text-[16px] font-semibold text-bg transition-transform active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #4D8DFF, #B06CFF)', boxShadow: '0 8px 30px rgba(125,100,255,0.35)' }}
      >
        {t('home')}
      </Link>
      <Link
        href="/account"
        className="-mt-1 w-full rounded-full border border-line px-9 py-3 text-center text-[14px] font-medium text-muted active:scale-[0.98]"
      >
        {t('resultsCta')}
      </Link>

      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-[7px] inline-block h-1 w-6 shrink-0 rounded-full bg-accent" />
        <p className="text-[12px] leading-relaxed text-muted">{t('honest')}</p>
      </div>
    </div>
  );
}
