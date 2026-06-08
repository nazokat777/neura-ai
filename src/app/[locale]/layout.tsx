import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Fraunces, Hanken_Grotesk } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import PlatformInit from '@/components/PlatformInit';
import LanguageGate from '@/components/LanguageGate';
import '../globals.css';

// §8: Display — editorial serif italic (Fraunces). Body — grotesk (Hanken).
const display = Fraunces({
  subsets: ['latin'],
  style: ['italic', 'normal'],
  weight: ['300', '400', '600'],
  variable: '--font-display',
  display: 'swap',
});

const body = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Neura AI — Brain Training Games',
    template: '%s · Neura AI',
  },
  description:
    'Neura AI — brain training app: memory, attention, logic, speed & focus games. Miya mashqlari ilovasi. Improve yourself every day.',
  applicationName: 'Neura AI',
  keywords: [
    'Neura AI', 'brain training', 'miya mashqlari', 'тренировка мозга',
    'memory games', 'attention', 'logic', 'cognitive training', 'neyron ai',
  ],
  openGraph: {
    title: 'Neura AI — Brain Training Games',
    description: 'Train your brain: memory, attention, logic, speed & focus. Miya mashqlari.',
    siteName: 'Neura AI',
    type: 'website',
    images: [{ url: '/logo-mark.png', width: 512, height: 512, alt: 'Neura AI' }],
  },
  twitter: {
    card: 'summary',
    title: 'Neura AI — Brain Training Games',
    description: 'Train your brain: memory, attention, logic, speed & focus.',
    images: ['/logo-mark.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#06080F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

// output:'export' — har locale uchun statik HTML.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Telegram Mini App SDK — Telegram ichida ochilganda faollashadi */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className="min-h-dvh bg-bg font-body text-ink antialiased">
        <PlatformInit />
        <NextIntlClientProvider>
          <LanguageGate />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
