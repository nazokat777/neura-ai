'use client';

import { Link } from '@/i18n/navigation';

// Til tanlash sahifasiga (/language) o'tadigan yagona 🌐 tugma.
// Barcha asosiy sahifalarda bir xil ko'rinishda bo'lishi uchun (izchillik).
export default function LangLink({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/language"
      aria-label="Til / Язык / Language"
      className={[
        'flex h-9 w-9 items-center justify-center rounded-full border border-line/60 bg-bg/40 text-[15px] text-ink backdrop-blur-sm active:scale-95',
        className,
      ].join(' ')}
    >
      🌐
    </Link>
  );
}
