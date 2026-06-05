'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { saveOnboarding, saveName, type Onboarding } from '@/lib/storage';

// Config-asosli anketa. Savollar tartibi shu yerda; matnlar messages.onboarding.q.
const QUESTIONS: {
  key: keyof Onboarding | 'name';
  type: 'single' | 'multi' | 'text';
  options: string[];
}[] = [
  { key: 'name', type: 'text', options: [] },
  { key: 'age', type: 'single', options: ['a1', 'a2', 'a3', 'a4', 'a5'] },
  { key: 'work', type: 'single', options: ['student', 'knowledge', 'manual', 'manager', 'other'] },
  { key: 'concerns', type: 'multi', options: ['memory', 'focus', 'speed', 'fatigue', 'stress'] },
  { key: 'sleep', type: 'single', options: ['lt5', 'h56', 'h78', 'gt8'] },
  { key: 'stress', type: 'single', options: ['low', 'mid', 'high'] },
  { key: 'nutrition', type: 'single', options: ['poor', 'ok', 'good'] },
  { key: 'goal', type: 'multi', options: ['focus', 'memory', 'speed', 'habit', 'curiosity'] },
];

export default function OnboardingFlow() {
  const t = useTranslations('onboarding');
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Onboarding>({});
  const [name, setName] = useState('');
  const total = QUESTIONS.length;
  const q = QUESTIONS[step];

  const current = q.key === 'name' ? undefined : answers[q.key as keyof Onboarding];
  const hasAnswer =
    q.type === 'text'
      ? name.trim().length > 0
      : q.type === 'multi'
        ? Array.isArray(current) && current.length > 0
        : current != null;

  function selectSingle(opt: string) {
    const key = q.key as keyof Onboarding;
    setAnswers((a) => ({ ...a, [key]: opt }));
  }

  function toggleMulti(opt: string) {
    const key = q.key as keyof Onboarding;
    setAnswers((a) => {
      const arr = Array.isArray(a[key]) ? (a[key] as string[]) : [];
      return {
        ...a,
        [key]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt],
      };
    });
  }

  function next() {
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      if (name.trim()) saveName(name);
      saveOnboarding(answers);
      router.push('/baseline');
    }
  }

  const isSelected = (opt: string) =>
    q.type === 'multi'
      ? Array.isArray(current) && current.includes(opt)
      : current === opt;

  return (
    <div className="flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface2">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
        <span className="num text-[11px] font-medium tabular-nums text-muted">
          {t('step', { i: step + 1, total })}
        </span>
      </div>

      {/* Savol */}
      <div key={q.key} className="mt-10 flex flex-1 flex-col">
        <span className="animate-rise text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('kicker')}
        </span>
        <h1
          className="t-display animate-rise mt-3"
          style={{
            animationDelay: '60ms',
            fontSize: 'clamp(1.9rem, 7vw, 2.6rem)',
            lineHeight: '1.0',
            letterSpacing: '-0.03em',
          }}
        >
          {t(`q.${q.key}.q`)}
        </h1>
        {q.type === 'multi' && (
          <span className="mt-2 text-[12px] text-muted">{t('multiHint')}</span>
        )}

        {q.type === 'text' ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hasAnswer) next();
            }}
            placeholder={t('q.name.placeholder')}
            autoFocus
            maxLength={24}
            className="mt-8 w-full rounded-2xl border border-line bg-surface px-5 py-4 text-[17px] font-medium text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
          />
        ) : (
        <div className="mt-8 flex flex-col gap-3">
          {q.options.map((opt) => {
            const sel = isSelected(opt);
            return (
              <button
                key={opt}
                onClick={() =>
                  q.type === 'multi' ? toggleMulti(opt) : selectSingle(opt)
                }
                className={[
                  'flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors active:scale-[0.99]',
                  sel
                    ? 'border-accent bg-accent/10 text-ink'
                    : 'border-line bg-surface text-ink hover:border-muted',
                ].join(' ')}
              >
                <span className="text-[15px] font-medium">
                  {t(`q.${q.key}.o.${opt}`)}
                </span>
                <span
                  className={[
                    'flex h-5 w-5 items-center justify-center rounded-full border text-[11px]',
                    sel ? 'border-accent bg-accent text-bg' : 'border-line text-transparent',
                  ].join(' ')}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>
        )}
      </div>

      {/* Navigatsiya */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-sm text-muted disabled:opacity-30"
        >
          ← {t('back')}
        </button>
        <button
          onClick={next}
          disabled={!hasAnswer}
          className="rounded-full bg-accent px-9 py-3 font-medium text-bg transition-opacity active:scale-95 disabled:opacity-30"
        >
          {step === total - 1 ? t('finish') : t('next')}
        </button>
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
        {t('honest')}
      </p>
    </div>
  );
}
