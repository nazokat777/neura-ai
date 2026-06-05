import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import DrillHeader from '@/components/DrillHeader';
import DrillGate from '@/components/game/DrillGate';
import SpeedGame from '@/drills/speed/SpeedGame';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function SpeedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const td = await getTranslations('drills');
  const tc = await getTranslations('common');
  const tRule = await getTranslations('rules');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-2 pt-[max(1rem,env(safe-area-inset-top))]">
      <DrillHeader title={td('speed')} backLabel={tc('back')} />
      <DrillGate title={td('speed')} rule={tRule('speed')} survival>
        <SpeedGame />
      </DrillGate>
    </main>
  );
}
