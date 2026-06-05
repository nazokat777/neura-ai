import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import DrillHeader from '@/components/DrillHeader';
import DrillGate from '@/components/game/DrillGate';
import MemoryGame from '@/drills/memory/MemoryGame';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function MemoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const td = await getTranslations('drills');
  const tc = await getTranslations('common');
  const tm = await getTranslations('memory');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-2 pt-[max(1rem,env(safe-area-inset-top))]">
      <DrillHeader title={td('memory')} backLabel={tc('back')} />
      <DrillGate title={td('memory')} rule={tm('rule')} survival>
        <MemoryGame />
      </DrillGate>
    </main>
  );
}
