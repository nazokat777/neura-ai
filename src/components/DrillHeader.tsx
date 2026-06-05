'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import SoundToggle from '@/components/game/SoundToggle';

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
  const [backHref, setBackHref] = useState('/');

  useEffect(() => {
    const fromBaseline =
      new URLSearchParams(window.location.search).get('b') === '1';
    setBackHref(fromBaseline ? '/baseline' : '/');
  }, []);

  return (
    <header className="flex items-center justify-between px-3 py-3">
      <Link href={backHref} className="text-sm text-muted active:scale-95">
        ← {backLabel}
      </Link>
      <h1 className="flex items-center gap-1.5 text-sm font-medium text-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="" aria-hidden className="h-5 w-5 rounded-md" />
        {title}
      </h1>
      <SoundToggle />
    </header>
  );
}
