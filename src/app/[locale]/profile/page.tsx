import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import DrillHeader from '@/components/DrillHeader';
import CinematicBackground from '@/components/CinematicBackground';
import BrainStage from '@/components/brain/BrainStage';
import AnalysisPlan from '@/components/profile/AnalysisPlan';
import ProfileHeading from '@/components/profile/ProfileHeading';
import BottomNav from '@/components/nav/BottomNav';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tp = await getTranslations('profile');
  const tc = await getTranslations('common');
  const tr = await getTranslations('recs');
  const ta = await getTranslations('account');
  const ts = await getTranslations('settings');
  const tb = await getTranslations('brain.discover');
  const ti = await getTranslations('insights');

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-28 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <CinematicBackground />

      {/* Ambient accent glow — bosh sahifa bilan bir xil til */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] opacity-50"
        style={{
          background:
            'radial-gradient(45% 55% at 28% 0%, rgba(77,141,255,0.18), rgba(6,8,15,0) 70%), radial-gradient(45% 55% at 72% 0%, rgba(176,108,255,0.16), rgba(6,8,15,0) 70%)',
        }}
      />

      <DrillHeader title={tp('title')} backLabel={tc('back')} />

      <section className="mt-6 flex flex-col gap-3">
        <span className="animate-rise text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {tp('kicker')}
        </span>
        <ProfileHeading fallback={tp('heading')} />
      </section>

      {/* Cinematic 3D miya — markaziy vizual */}
      <section className="mt-6 animate-rise" style={{ animationDelay: '160ms' }}>
        <BrainStage />
      </section>

      {/* Domen ballari Profil'дан olib tashlandi — endi faqat "Tahlil"да
          (takror yo'q). Profil = shaxs + reja + sozlama. */}

      {/* Domen ballarini ko'rish uchun Tahlilga havola */}
      <Link
        href="/insights"
        className="mt-8 flex items-center justify-between rounded-2xl border border-accent-dim/40 bg-accent-dim/10 px-5 py-4 active:scale-[0.99]"
      >
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-ink">{ti('title')}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            {ti('kicker')}
          </span>
        </div>
        <span className="text-muted">→</span>
      </Link>

      {/* Neyrobiolog tahlili — test + anketaga moslab shaxsiy reja */}
      <section className="mt-8 animate-rise" style={{ animationDelay: '300ms' }}>
        <AnalysisPlan />
      </section>

      {/* Neyro-tavsiyalar havolasi */}
      <Link
        href="/recommendations"
        className="mt-8 flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4 active:scale-[0.99]"
      >
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-ink">
            {tr('title')}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            {tr('kicker')}
          </span>
        </div>
        <span className="text-muted">→</span>
      </Link>

      {/* Akkaunt — haftalik/oylik natijalar + o'chirish */}
      <Link
        href="/account"
        className="mt-3 flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4 active:scale-[0.99]"
      >
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-ink">{ta('title')}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            {ta('kicker')}
          </span>
        </div>
        <span className="text-muted">→</span>
      </Link>

      {/* Kirish videosini qayta ko'rish (Miyaga sayohat) */}
      <Link
        href="/intro"
        className="mt-3 flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4 active:scale-[0.99]"
      >
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-ink">{tb('kicker')}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            {tb('lead')}
          </span>
        </div>
        <span className="text-muted">▶</span>
      </Link>

      {/* Til tanlash sahifasi */}
      <Link
        href="/language"
        className="mt-3 flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4 active:scale-[0.99]"
      >
        <span className="text-[15px] font-medium text-ink">{ts('language')}</span>
        <span className="text-muted">→</span>
      </Link>

      <BottomNav />
    </main>
  );
}
