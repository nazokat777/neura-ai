import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { CATALOG, sectionGradient, sectionVideoSrc, sectionVideoSrcWide } from '@/lib/catalog';
import SectionVideo from '@/components/cinematic/SectionVideo';
import FeaturedGame from '@/components/games/FeaturedGame';
import BottomNav from '@/components/nav/BottomNav';
import BackButton from '@/components/nav/BackButton';
import LangLink from '@/components/nav/LangLink';
import OnboardingGate from '@/components/OnboardingGate';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function GamesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('games');
  const tApp = await getTranslations('app');

  // Bugungi o'yin — birinchi tayyor o'yin (halol: aslida ishlaydigan mashq).
  const featured = CATALOG.flatMap((c) =>
    c.games.filter((g) => g.ready).map((g) => ({ cat: c, game: g })),
  )[0];

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <OnboardingGate />

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <span className="text-sm font-semibold tracking-tight text-ink">
            {tApp('name')}
          </span>
        </div>
        <LangLink />
      </header>

      <section className="mt-8 flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('kicker')}
        </span>
        <h1
          className="t-display"
          style={{ fontSize: 'clamp(2.4rem, 9vw, 3.4rem)', lineHeight: '0.95', letterSpacing: '-0.04em' }}
        >
          {t('title')}
        </h1>
        <p className="max-w-[22rem] text-[14px] leading-relaxed text-muted">
          {t('subtitle')}
        </p>
      </section>

      {/* Bugungi o'yin — SHAXSIY tavsiya (eng zaif domen), takror emas */}
      {featured && (
        <FeaturedGame
          fallbackCategoryId={featured.cat.id}
          fallbackGameId={featured.game.id}
          fallbackHref={featured.game.href!}
          fallbackHue={featured.cat.hue}
        />
      )}

      {/* Kategoriyalar — har biri cinematic fonli karta */}
      <section className="mt-9 flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {t('categories')}
        </h2>

        {CATALOG.map((cat) => {
          const readyCount = cat.games.filter((g) => g.ready).length;
          return (
            <Link
              key={cat.id}
              href={`/games/${cat.id}`}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line p-4 active:scale-[0.99]"
              style={{ minHeight: 96 }}
            >
              <SectionVideo
                src={sectionVideoSrc(cat.id)}
                srcWide={sectionVideoSrcWide(cat.id)}
                gradient={sectionGradient(cat.hue)}
                dim={0.5}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[18px] font-medium leading-tight text-ink">
                  {t(`cat.${cat.id}.name`)}
                </span>
                <span className="truncate text-[12px] text-ink/65">
                  {t(`cat.${cat.id}.tagline`)}
                </span>
                <span className="num text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/90">
                  {readyCount}/{cat.games.length} · {t('open')}
                </span>
              </div>
              <span
                aria-hidden
                className="text-ink/60 transition-transform group-active:translate-x-0.5"
              >
                →
              </span>
            </Link>
          );
        })}
      </section>

      <footer className="mt-8 flex items-start gap-3">
        <span aria-hidden className="mt-[7px] inline-block h-1 w-6 shrink-0 rounded-full bg-accent" />
        <p className="text-[12px] leading-relaxed text-muted">{t('honest')}</p>
      </footer>

      <BottomNav />
    </main>
  );
}
