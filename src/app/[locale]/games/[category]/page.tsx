import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { CATALOG, getCategory } from '@/lib/catalog';
import CategoryView from '@/components/games/CategoryView';

// Statik eksport: har locale × kategoriya uchun sahifa.
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CATALOG.map((c) => ({ locale, category: c.id })),
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const cat = getCategory(category);
  if (!cat) notFound();
  const t = await getTranslations('games');

  const games = cat.games.map((g) => ({
    id: g.id,
    href: g.href ?? null,
    ready: g.ready,
    tier: g.tier ?? null,
    name: t(`item.${g.id}.name`),
    desc: t(`item.${g.id}.desc`),
  }));

  return (
    <CategoryView
      categoryId={cat.id}
      glyph={cat.glyph}
      hue={cat.hue}
      name={t(`cat.${cat.id}.name`)}
      tagline={t(`cat.${cat.id}.tagline`)}
      fact={t(`cat.${cat.id}.fact`)}
      source={t(`cat.${cat.id}.source`)}
      games={games}
      labels={{
        back: t('back'),
        play: t('play'),
        comingSoon: t('comingSoon'),
        scientificFact: t('scientificFact'),
        games: t('allGames'),
        tier: { easy: t('tier.easy'), medium: t('tier.medium'), hard: t('tier.hard') },
      }}
    />
  );
}
