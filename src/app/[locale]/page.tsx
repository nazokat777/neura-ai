import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import LangLink from '@/components/nav/LangLink';
import CinematicBackground from '@/components/CinematicBackground';
import OnboardingGate from '@/components/OnboardingGate';
import Greeting from '@/components/Greeting';
import BottomNav from '@/components/nav/BottomNav';
import StreakBadge from '@/components/game/StreakBadge';
import { CATALOG } from '@/lib/catalog';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tApp = await getTranslations('app');
  const tg = await getTranslations('games');
  const tb = await getTranslations('brain.discover');
  const totalGames = CATALOG.reduce((s, c) => s + c.games.length, 0);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))] lg:max-w-5xl lg:px-10">
      <OnboardingGate />

      {/* Cinematic tirik fon — neyron-zarra maydoni (matnga tegmaydi) */}
      <CinematicBackground />

      {/* Ambient accent glow — bitta urg'u, sekin so'nuvchi */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-60"
        style={{
          background:
            'radial-gradient(45% 55% at 28% 0%, rgba(77,141,255,0.20), rgba(6,8,15,0) 70%), radial-gradient(45% 55% at 72% 0%, rgba(176,108,255,0.18), rgba(6,8,15,0) 70%)',
        }}
      />

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Boshiga — Miyaga sayohat (intro)ni qaytadan ko'rish */}
          <Link
            href="/intro"
            aria-label={tb('kicker')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line/60 bg-bg/40 text-ink backdrop-blur-sm active:scale-95"
          >
            ←
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt=""
            aria-hidden
            className="h-7 w-7 rounded-lg"
          />
          <span className="text-sm font-semibold tracking-tight text-ink">
            {tApp('name')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge compact />
          {/* Til tanlash sahifasi — barcha sahifalarda bir xil (izchillik) */}
          <LangLink />
        </div>
      </header>

      {/* Desktopда (lg+) ikki ustun: chap — qahramon matn, o'ng — ro'yxat.
          Mobilда oddiy vertikal oqim (mobil-first dizayn buzilmaydi). */}
      <div className="lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-x-16">
      <section className="mt-10 flex flex-col gap-4 lg:sticky lg:top-10">
        <Greeting />
        <span
          className="animate-rise text-[11px] font-semibold uppercase tracking-[0.18em] text-accent"
          style={{ animationDelay: '40ms' }}
        >
          {tApp('tagline')}
        </span>

        <h1
          className="t-display animate-rise"
          style={{
            animationDelay: '120ms',
            fontSize: 'clamp(2.8rem, 11vw, 4.25rem)',
            lineHeight: '0.92',
            letterSpacing: '-0.045em',
          }}
        >
          {t('title')}
        </h1>

        <p
          className="max-w-[20rem] animate-rise text-[15px] leading-relaxed text-muted"
          style={{ animationDelay: '200ms' }}
        >
          {t('subtitle')}
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-4 lg:mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {t('explore')}
          </h2>
          <span className="num text-[11px] font-medium tabular-nums text-muted/70">
            {t('gamesTotal', { n: totalGames })}
          </span>
        </div>

        <ul className="flex flex-col">
          {CATALOG.map((cat, i) => {
            const num = String(i + 1).padStart(2, '0');
            return (
              <li
                key={cat.id}
                className="animate-rise"
                style={{ animationDelay: `${240 + i * 50}ms` }}
              >
                <Link href={`/games/${cat.id}`} className="block">
                  <div
                    className={[
                      'group relative flex items-center gap-4 border-t border-line py-4',
                      i === CATALOG.length - 1 ? 'border-b' : '',
                      'transition-colors duration-200 active:bg-surface/60',
                    ].join(' ')}
                  >
                    <span className="num w-6 shrink-0 text-[11px] font-medium tabular-nums text-muted/70">
                      {num}
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[18px] font-medium leading-tight text-ink">
                        {tg(`cat.${cat.id}.name`)}
                      </span>
                      <span className="truncate text-[11px] text-muted">
                        {tg(`cat.${cat.id}.tagline`)}
                      </span>
                    </div>

                    <span className="num text-[12px] font-semibold tabular-nums text-muted/70">
                      {cat.games.length}
                    </span>
                    <span
                      aria-hidden
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-base text-ink transition-all duration-200 group-hover:border-accent group-hover:bg-accent group-hover:text-bg group-active:scale-95"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      </div>

      <footer className="mt-auto pt-10">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-[7px] inline-block h-1 w-6 shrink-0 rounded-full bg-accent"
          />
          <p className="text-[12px] leading-relaxed text-muted">
            {t('honest')}
          </p>
        </div>
      </footer>

      <BottomNav />
    </main>
  );
}
