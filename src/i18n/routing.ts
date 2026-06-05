import { defineRouting } from 'next-intl/routing';

// Uchala til LTR (CLAUDE.md §3). Default — ingliz.
export const routing = defineRouting({
  locales: ['en', 'ru', 'uz'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
