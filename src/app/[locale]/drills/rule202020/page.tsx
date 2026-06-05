import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import DrillHeader from '@/components/DrillHeader';
import VisionSession from '@/drills/vision/VisionSession';
import { VISION_CONFIGS } from '@/drills/vision/config';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tg = await getTranslations('games');
  const tc = await getTranslations('common');
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-2 pt-[max(1rem,env(safe-area-inset-top))]">
      <DrillHeader title={tg('item.rule202020.name')} backLabel={tc('back')} />
      <VisionSession config={VISION_CONFIGS.rule202020} />
    </main>
  );
}
