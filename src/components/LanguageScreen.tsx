'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// Til tanlash SAHIFASI (/language) — ro'yhatdan o'tgan foydalanuvchi ham
// istalgan vaqtда qayta kirib tilni o'zgartira oladi. LanguageGate (birinchi
// kirish overlay) bilan bir xil ko'rinish; bu yerда orqaga qaytish bor.
const LANGS: { loc: string; label: string }[] = [
  { loc: 'uz', label: "O'zbekcha" },
  { loc: 'ru', label: 'Русский' },
  { loc: 'en', label: 'English' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const pathname = usePathname();

  function choose(loc: string) {
    try {
      localStorage.setItem('lang', loc);
    } catch {
      /* ignore */
    }
    // Tilni almashtirib, bosh sahifaga qaytadi.
    router.replace('/', { locale: loc });
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40dvh] opacity-60"
        style={{
          background:
            'radial-gradient(45% 50% at 28% 0%, rgba(77,141,255,0.22), rgba(6,8,15,0) 70%), radial-gradient(45% 50% at 72% 0%, rgba(176,108,255,0.20), rgba(6,8,15,0) 70%)',
        }}
      />

      {/* Orqaga — tarix bo'lsa bir qadam, aks holda profilga (qamalib qolmaydi) */}
      <button
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) router.back();
          else router.push('/profile');
        }}
        aria-label="←"
        className="absolute left-5 top-[max(1.25rem,env(safe-area-inset-top))] z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line/60 bg-bg/40 text-ink backdrop-blur-sm active:scale-95"
      >
        ←
      </button>

      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="animate-rise relative flex items-center justify-center">
          <span
            aria-hidden
            className="animate-breathe absolute inset-[-20%] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(77,141,255,0.40), rgba(176,108,255,0.30) 45%, rgba(6,8,15,0) 70%)',
            }}
          />
          {/* Yuqori sifatli shaffof WebP logo (blendsiz). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-cut.webp"
            alt="Neura AI"
            className="animate-float-soft relative w-64 max-w-[78vw]"
          />
        </div>

        <div className="animate-rise flex flex-col items-center gap-1" style={{ animationDelay: '120ms' }}>
          <h1 className="t-display" style={{ fontSize: 'clamp(1.4rem, 5.5vw, 1.8rem)', lineHeight: '1.1' }}>
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
