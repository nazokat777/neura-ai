import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import IntroHero from '@/components/cinematic/IntroHero';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function IntroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <IntroHero />;
}
