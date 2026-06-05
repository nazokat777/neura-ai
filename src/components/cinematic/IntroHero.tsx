'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { isOnboarded } from '@/lib/storage';
import ButtonIntro, { type Scene } from './ButtonIntro';

// "Miyaga sayohat" — TUGMA bilan: har panelда tugma, bosilganда video
// keyingi panelгача o'ynaydi va to'xtaydi. Scroll yo'q (user adashmaydi).
// Oxirgi tugma "Boshlash" → anketa.
//
// Fon videosi: 9:16 (telefon) + 16:9 (keng ekran) — avtomatik tanlanadi.
const VIDEO_SRC = '/cinematic/brain/discover.mp4';
const VIDEO_SRC_WIDE = '/cinematic/brain/discover-wide.mp4';
const GRAD =
  'radial-gradient(70% 55% at 50% 35%, rgba(77,141,255,0.20), rgba(6,8,15,0) 70%), linear-gradient(180deg, #0a0e16, #06080f)';

export default function IntroHero() {
  const t = useTranslations('intro');
  const tb = useTranslations('brain.discover');
  const tc = useTranslations('common');
  const router = useRouter();

  // Ro'yhatdan o'tgan bo'lsa — kirish MAJBURIY emas: qaytish tugmasi ko'rinadi
  // va oxirgi tugma bosh sahifaga qaytaradi (anketani qaytarmaydi).
  const [onboarded, setOnboarded] = useState(false);
  useEffect(() => {
    setOnboarded(isOnboarded());
  }, []);

  // 5 panel (foydalanuvchi belgilagan matn):
  const scenes: Scene[] = [
    { title: t('p1') },
    { title: t('p2') },
    { title: t('p3.title'), caption: t('p3.caption') },
    { title: t('p4.title'), caption: t('p4.caption') },
    { title: t('p5.title'), caption: t('p5.caption') },
  ];

  return (
    <ButtonIntro
      videoSrc={VIDEO_SRC}
      videoSrcWide={VIDEO_SRC_WIDE}
      gradient={GRAD}
      kicker={tb('kicker')}
      scenes={scenes}
      nextLabel={tc('next')}
      ctaLabel={t('cta')}
      onCta={() => router.push(onboarded ? '/' : '/onboarding')}
      onBack={onboarded ? () => router.push('/language') : undefined}
    />
  );
}
