import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import DrillHeader from '@/components/DrillHeader';
import CinematicBackground from '@/components/CinematicBackground';
import RecommendationsView from '@/components/recs/RecommendationsView';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RecommendationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('recs');
  const tc = await getTranslations('common');

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-16 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <CinematicBackground />
      <DrillHeader title={tr('kicker')} backLabel={tc('back')} />
      <div className="mt-6">
        <RecommendationsView />
      </div>
    </main>
  );
}
