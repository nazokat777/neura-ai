import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import CinematicBackground from '@/components/CinematicBackground';
import PostTestRecommend from '@/components/posttest/PostTestRecommend';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RecommendedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <CinematicBackground />
      <PostTestRecommend />
    </main>
  );
}
