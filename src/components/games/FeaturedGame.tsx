'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loadLast } from '@/lib/storage';
import { getCategory } from '@/lib/catalog';
import { sectionGradient, sectionVideoSrc, sectionVideoSrcWide } from '@/lib/catalog';
import SectionVideo from '@/components/cinematic/SectionVideo';

// "Bugungi o'yin" — SHAXSIY tavsiya. Test natijangizda eng ZAIF domenni
// topib, aynan o'sha kategoriyaning o'yinini ko'rsatadi (foydali, takror emas).
// HALOL: faqat real o'lchangan natijadan; o'lchov yo'q → birinchi tayyor o'yin.

const DOMAINS = [
  { domain: 'memory', drill: 'memory', category: 'memory' },
  { domain: 'attention', drill: 'schulte', category: 'attention' },
  { domain: 'logic', drill: 'math', category: 'logic' },
  { domain: 'speed', drill: 'speed', category: 'speed' },
  { domain: 'focus', drill: 'stroop', category: 'focus' },
] as const;

export default function FeaturedGame({
  fallbackCategoryId,
  fallbackGameId,
  fallbackHref,
  fallbackHue,
}: {
  fallbackCategoryId: string;
  fallbackGameId: string;
  fallbackHref: string;
  fallbackHue: string;
}) {
  const t = useTranslations('games');
  const tdom = useTranslations('domains');
  const [pick, setPick] = useState<{
    catId: string;
    gameId: string;
    href: string;
    hue: string;
    domain: string | null;
  } | null>(null);

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
    if (worst) {
      const cat = getCategory(worst.category);
      const g = (cat?.games ?? []).find((x) => x.ready && x.href);
      if (g && cat) {
        setPick({ catId: cat.id, gameId: g.id, href: g.href!, hue: cat.hue, domain: worst.domain });
        return;
      }
    }
    setPick({
      catId: fallbackCategoryId,
      gameId: fallbackGameId,
      href: fallbackHref,
      hue: fallbackHue,
      domain: null,
    });
  }, [fallbackCategoryId, fallbackGameId, fallbackHref, fallbackHue]);

  if (!pick) return null;

  return (
    <Link
      href={pick.href}
      className="group relative mt-7 block overflow-hidden rounded-3xl border border-line p-5 active:scale-[0.99]"
      style={{ minHeight: 152 }}
    >
      <SectionVideo
        src={sectionVideoSrc(pick.catId)}
        srcWide={sectionVideoSrcWide(pick.catId)}
        gradient={sectionGradient(pick.hue)}
        dim={0.4}
      />
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
        {pick.domain ? t('forYou') : t('gameOfDay')}
      </span>
      <h2 className="mt-2 text-[24px] font-medium leading-tight text-ink">
        {t(`item.${pick.gameId}.name`)}
      </h2>
      <p className="mt-1 max-w-[18rem] text-[13px] leading-snug text-ink/70">
        {pick.domain
          ? t('forYouReason', { domain: tdom(pick.domain) })
          : t(`item.${pick.gameId}.desc`)}
      </p>
      <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2 text-[13px] font-semibold text-bg">
        {t('play')} →
      </span>
    </Link>
  );
}
