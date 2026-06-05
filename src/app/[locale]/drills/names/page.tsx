import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import DrillHeader from '@/components/DrillHeader';
import DrillGate from '@/components/game/DrillGate';
import NamesGame from '@/drills/names/NamesGame';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tg = await getTranslations('games');
  const tc = await getTranslations('common');
  const tRule = await getTranslations('rules');
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-2 pt-[max(1rem,env(safe-area-inset-top))]">
      <DrillHeader title={tg('item.names.name')} backLabel={tc('back')} />
      <DrillGate title={tg('item.names.name')} rule={tRule('names')} survival>
        <NamesGame />
      </DrillGate>
    </main>
  );
}
