'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

// Pastki navigatsiya — 4 bo'lim (Bugun / O'yinlar / Tahlil / Profil).
// Telegram/PWA "standalone" rejimida ham xavfsiz: safe-area-inset hisobga olinadi.
const TABS = [
  { id: 'today', href: '/', glyph: '◐' },
  { id: 'games', href: '/games', glyph: '◍' },
  { id: 'insights', href: '/insights', glyph: '◇' },
  { id: 'profile', href: '/profile', glyph: '◉' },
] as const;

export default function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line/80 bg-bg/85 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <li key={tab.id} className="flex-1">
              <Link
                href={tab.href}
                className="flex flex-col items-center gap-1 py-2.5 transition-colors active:scale-95"
              >
                <span
                  aria-hidden
                  className={[
                    'text-[18px] leading-none transition-all',
                    active
                      ? 'text-accent drop-shadow-[0_0_8px_rgba(77,141,255,0.6)]'
                      : 'text-muted',
                  ].join(' ')}
                >
                  {tab.glyph}
                </span>
                <span
                  className={[
                    'text-[10px] font-semibold tracking-tight transition-colors',
                    active ? 'text-ink' : 'text-muted',
                  ].join(' ')}
                >
                  {t(tab.id)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
