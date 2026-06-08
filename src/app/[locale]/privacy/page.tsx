import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import CinematicBackground from '@/components/CinematicBackground';
import BackButton from '@/components/nav/BackButton';
import LangLink from '@/components/nav/LangLink';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return { title: t('title') };
}

interface Section {
  h: string;
  p: string;
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('privacy');
  const sections = t.raw('sections') as Section[];

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-24 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <CinematicBackground />

      <header className="flex items-center justify-between">
        <BackButton fallback="/profile" />
        <LangLink />
      </header>

      <section className="mt-7 flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('kicker')}
        </span>
        <h1
          className="t-display"
          style={{ fontSize: 'clamp(2.1rem, 8vw, 2.8rem)', lineHeight: '0.98', letterSpacing: '-0.04em' }}
        >
          {t('title')}
        </h1>
        <p className="mt-1 text-[12px] text-muted">{t('updated')}</p>
      </section>

      <p className="mt-6 text-[15px] leading-relaxed text-ink/85">{t('intro')}</p>

      <div className="mt-8 flex flex-col gap-7">
        {sections.map((s, i) => (
          <section key={i} className="flex flex-col gap-2">
            <h2 className="text-[16px] font-semibold text-ink">{s.h}</h2>
            <p className="text-[14px] leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
