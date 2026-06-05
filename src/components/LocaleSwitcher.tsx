'use client';

import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LABELS: Record<string, string> = { en: 'EN', ru: 'RU', uz: 'UZ' };

// Til qo'lda almashtiriladi (§3) va tanlov URL locale segmentida saqlanadi.
export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const current = (params.locale as string) ?? routing.defaultLocale;

  return (
    <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => router.replace(pathname, { locale: loc })}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            loc === current ? 'bg-accent text-bg' : 'text-muted hover:text-ink',
          ].join(' ')}
        >
          {LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
