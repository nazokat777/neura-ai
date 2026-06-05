'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { loadLast } from '@/lib/storage';
import { getCategory } from '@/lib/catalog';

// Test yakunidan keyingi BIRINCHI sahifa (scrollsiz). Eng zaif domenni
// topib, aynan o'sha kategoriyaning bitta o'yinini tavsiya qiladi.
// Boshlash → o'yin; O'tkazib yuborish → kunlik reja (/plan).
// HALOL: faqat real o'lchangan natijadan; tavsiya — majburiy emas.

const DOMAINS = [
  { domain: 'memory', drill: 'memory', category: 'memory' },
  { domain: 'attention', drill: 'schulte', category: 'attention' },
  { domain: 'logic', drill: 'math', category: 'logic' },
  { domain: 'speed', drill: 'speed', category: 'speed' },
  { domain: 'focus', drill: 'stroop', category: 'focus' },
] as const;

export default function PostTestRecommend() {
  const t = useTranslations('postTest');
  const tdom = useTranslations('domains');
  const tg = useTranslations('games');
  const router = useRouter();

  const [weak, setWeak] = useState<(typeof DOMAINS)[number] | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameHref, setGameHref] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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
    setWeak(worst);
    if (worst) {
      const cat = getCategory(worst.category);
      const g = (cat?.games ?? []).find((x) => x.ready && x.href);
      if (g) {
        setGameId(g.id);
        setGameHref(g.href!);
      }
    }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
      <span className="animate-rise text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {t('kicker')}
      </span>
      <h1
        className="t-display animate-rise mt-3"
        style={{ animationDelay: '60ms', fontSize: 'clamp(2.2rem, 9vw, 3rem)', lineHeight: '1.0', letterSpacing: '-0.03em' }}
      >
        {t('title')}
      </h1>

      <div
        className="animate-rise mt-8 flex flex-1 flex-col justify-center rounded-3xl border border-accent-dim/40 bg-accent-dim/10 p-7"
        style={{ animationDelay: '140ms' }}
      >
        {weak && gameId ? (
          <>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              {tdom(weak.domain)}
            </span>
            <span className="mt-2 text-[26px] font-semibold leading-tight text-ink">
              {tg(`item.${gameId}.name`)}
            </span>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              {tg(`item.${gameId}.desc`)}
            </p>
          </>
        ) : (
          <span className="text-[18px] font-medium text-ink">{tg('cat.memory.name')}</span>
        )}
        <p className="mt-5 text-[12px] leading-relaxed text-muted/90">{t('optional')}</p>
      </div>

      <button
        onClick={() => router.push(gameHref || '/plan')}
        className="mt-7 w-full rounded-full px-9 py-4 text-[16px] font-semibold text-bg transition-transform active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #4D8DFF, #B06CFF)', boxShadow: '0 8px 30px rgba(125,100,255,0.35)' }}
      >
        {t('start')}
      </button>
      <button
        onClick={() => router.push('/plan')}
        className="mt-3 w-full rounded-full border border-line px-9 py-3.5 text-[15px] font-medium text-muted active:scale-[0.98]"
      >
        {t('skip')}
      </button>
    </div>
  );
}
