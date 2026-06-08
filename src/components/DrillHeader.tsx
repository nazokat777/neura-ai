'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import SoundToggle from '@/components/game/SoundToggle';
import { useDrillActive } from '@/lib/drillSession';

// Barcha mashq ekranlari uchun yagona header (DRY + semantik h1).
// Baseline (A-nuqta) rejimida (`?b=1`) ochilgan bo'lsa — orqaga tugmasi
// bosh sahifaga emas, TESTGA (/baseline) qaytaradi, toki foydalanuvchi
// qolgan domenlarni o'lchashda davom etsin.
export default function DrillHeader({
  title,
  backLabel,
}: {
  title: string;
  backLabel: string;
}) {
  const tc = useTranslations('common');
  const router = useRouter();
  const active = useDrillActive();
  const [backHref, setBackHref] = useState('/');
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const fromBaseline =
      new URLSearchParams(window.location.search).get('b') === '1';
    setBackHref(fromBaseline ? '/baseline' : '/');
  }, []);

  // Mashq faol bo'lsa — chiqishdan oldin tasdiq so'raymiz (joriy raund
  // yo'qolmasin). Aks holda to'g'ridan-to'g'ri qaytamiz.
  function handleBack() {
    if (active) setConfirm(true);
    else router.push(backHref);
  }

  return (
    <>
      <header className="flex items-center justify-between px-3 py-3">
        <button
          onClick={handleBack}
          className="text-sm text-muted active:scale-95"
        >
          ← {backLabel}
        </button>
        <h1 className="flex items-center gap-1.5 text-sm font-medium text-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" aria-hidden className="h-5 w-5 rounded-md" />
          {title}
        </h1>
        <SoundToggle />
      </header>

      {confirm && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-bg/70 px-6 backdrop-blur-sm"
          onClick={() => setConfirm(false)}
        >
          <div
            className="animate-rise w-full max-w-sm rounded-3xl border border-line bg-surface p-7 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="t-display"
              style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', lineHeight: '1.1' }}
            >
              {tc('quitTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-[20rem] text-[14px] leading-relaxed text-muted">
              {tc('quitBody')}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="w-full rounded-full bg-accent px-8 py-3.5 font-medium text-bg active:scale-95"
              >
                {tc('quitStay')}
              </button>
              <button
                onClick={() => router.push(backHref)}
                className="w-full rounded-full border border-line px-8 py-3 text-[15px] text-muted active:scale-95"
              >
                {tc('quitConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
