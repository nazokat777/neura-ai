'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// Ilova boshida (birinchi kirишда) til tanlash ekrani. Tanlov localStorage'да
// saqlanadi — keyingi safar ko'rsatilmaydi. Headerда LocaleSwitcher orqali
// istalgan vaqtда o'zgartirsa bo'ladi.
const LANGS: { loc: string; label: string; native: string }[] = [
  { loc: 'uz', label: "O'zbekcha", native: 'Tilni tanlang' },
  { loc: 'ru', label: 'Русский', native: 'Выберите язык' },
  { loc: 'en', label: 'English', native: 'Choose language' },
];

export default function LanguageGate() {
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('lang')) setShow(true);
    } catch {
      /* localStorage yo'q bo'lsa — ko'rsatmaymiz */
    }
  }, []);

  if (!show) return null;

  function choose(loc: string) {
    try {
      localStorage.setItem('lang', loc);
    } catch {
      /* ignore */
    }
    setShow(false);
    router.replace(pathname, { locale: loc });
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-bg px-6">
      {/* Cinematic urg'u */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40dvh] opacity-60"
        style={{
          background:
            'radial-gradient(45% 50% at 28% 0%, rgba(77,141,255,0.22), rgba(6,8,15,0) 70%), radial-gradient(45% 50% at 72% 0%, rgba(176,108,255,0.20), rgba(6,8,15,0) 70%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-4 text-center">
        {/* Logo — paydo bo'ladi (rise) + doimiy nozik suzadi (float). */}
        <div className="animate-rise relative flex items-center justify-center">
          {/* Nafas oluvchi nur — WOW, lekin nozik */}
          <span
            aria-hidden
            className="animate-breathe absolute inset-[-20%] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(77,141,255,0.40), rgba(176,108,255,0.30) 45%, rgba(6,8,15,0) 70%)',
            }}
          />
          {/* logo-clean (sof qora fon) + screen blend + radial mask:
              chegara har qanday holatда fonга butunlay singib yo'qoladi. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* logo-cut: qora fon SHAFFOF + screen blend → hero rasmlari (memory/
              focus) kabi nurli, fonга uzviy singadi, chegara yo'q. */}
          <img
            src="/logo-cut.png"
            alt="Neyron AI"
            className="animate-float-soft relative w-72 max-w-[82vw]"
            style={{ mixBlendMode: 'screen' }}
          />
        </div>

        <div
          className="animate-rise flex flex-col items-center gap-1"
          style={{ animationDelay: '120ms' }}
        >
          <h1
            className="t-display"
            style={{ fontSize: 'clamp(1.4rem, 5.5vw, 1.8rem)', lineHeight: '1.1' }}
          >
            Tilni tanlang
          </h1>
          <p className="text-[13px] text-muted">Выберите язык · Choose language</p>
        </div>
      </div>

      <div className="relative flex w-full max-w-xs flex-col gap-3">
        {LANGS.filter((l) => routing.locales.includes(l.loc as never)).map((l, i) => (
          <button
            key={l.loc}
            onClick={() => choose(l.loc)}
            className="animate-rise flex items-center justify-between rounded-2xl border border-line bg-surface/60 px-6 py-4 text-left transition-colors active:scale-[0.98] hover:border-accent hover:bg-surface"
            style={{ animationDelay: `${220 + i * 90}ms` }}
          >
            <span className="text-[17px] font-medium text-ink">{l.label}</span>
            <span className="text-accent">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
