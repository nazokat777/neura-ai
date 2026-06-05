import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import LanguageScreen from '@/components/LanguageScreen';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LanguagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg">
      <LanguageScreen />
    </main>
  );
}
