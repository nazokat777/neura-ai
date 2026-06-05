'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

// Universal "orqaga" tugmasi — har ekranda ishlaydi (bosh sahifadan tashqari).
// Mantiq: brauzer/Telegram tarixi bo'lsa — bir qadam orqaga; aks holda
// (to'g'ridan-to'g'ri shu sahifaga kirilgan bo'lsa) — `fallback` (default '/').
// Shu bilan foydalanuvchi hech qachon "qamalib" qolmaydi.
export default function BackButton({
  fallback = '/',
  className = '',
}: {
  fallback?: string;
  className?: string;
}) {
  const tc = useTranslations('common');
  const router = useRouter();

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={tc('back')}
      className={[
        'flex h-9 w-9 items-center justify-center rounded-full border border-line/60 bg-bg/40 text-ink backdrop-blur-sm active:scale-95',
        className,
      ].join(' ')}
    >
      ←
    </button>
  );
}
