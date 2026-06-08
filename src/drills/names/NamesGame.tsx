'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { paramsForLevel, namePool, type NamesParams } from './params';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';
import Avatar from './Avatar';

const DRILL_ID = 'names';

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

interface Person { seed: number; name: string; gender: 'men' | 'women'; }

export default function NamesGame() {
  const t = useTranslations('names');
  const tg = useTranslations('game');
  const locale = useLocale();
  // Joriy tilga mos ism havzasi (ingliz/rus tilida o'zbek ismi chiqmasin).
  const pool = namePool(locale);
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [params, setParams] = useState<NamesParams>(() => paramsForLevel(1));
  const [phase, setPhase] = useState<'memorize' | 'quiz'>('memorize');
  const [people, setPeople] = useState<Person[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [qi, setQi] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  // SURVIVAL: barcha ismni to'g'ri topsa → keyingi bosqich; 3 jon tugasa → tugadi.
  const [runLevel, setRunLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const stagesRef = useRef(0);

  const tapRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const buildOptions = useCallback((person: Person, all: Person[]) => {
    const others = pool
      .map((p) => p.name)
      .filter((n) => n !== person.name && !all.some((p) => p.name === n));
    const distractors = shuffle(others).slice(0, 3);
    setOptions(shuffle([person.name, ...distractors]));
  }, [pool]);

  const startRound = useCallback(
    (D: number, fresh = false) => {
      const p = paramsForLevel(D);
      setParams(p);
      setRunLevel(D);
      if (fresh) {
        feel.reset();
        stagesRef.current = 0;
        livesRef.current = 3;
        setLives(3);
      }
      const picks = shuffle(pool).slice(0, p.count);
      const seeds = shuffle(Array.from({ length: 40 }, (_, i) => i + 1)).slice(0, p.count);
      const ppl = picks.map((entry, i) => ({
        name: entry.name,
        seed: seeds[i],
        gender: entry.gender,
      }));
      setPeople(ppl);
      setOrder(shuffle(ppl.map((_, i) => i)));
      setQi(0);
      setPicked(null);
      setPhase('memorize');
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setPhase('quiz');
        setQi(0);
        buildOptions(ppl[shuffle(ppl.map((_, i) => i))[0]], ppl);
        tapRef.current = performance.now();
      }, p.memMs);
    },
    [feel, buildOptions, pool],
  );

  // quiz boshlanganda birinchi savol variantlari
  useEffect(() => {
    if (phase === 'quiz' && people.length && order.length) {
      buildOptions(people[order[qi]], people);
      tapRef.current = performance.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qi]);

  useEffect(() => {
    if (ready) startRound(state.D, true);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const choose = useCallback(
    (name: string) => {
      if (picked) return;
      const person = people[order[qi]];
      const ok = name === person.name;
      const rt = performance.now() - tapRef.current;
      feel.register(ok, 1 - rt / 4000);
      setPicked(name);
      window.setTimeout(() => {
        if (!ok) {
          // ❌ Xato → jon ketadi. 3 jon tugasa o'yin tugaydi.
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            const stages = stagesRef.current;
            const accuracy = Math.max(0, Math.min(1, 0.45 + stages * 0.05));
            finish({ accuracy, speedScore: accuracy, meta: { stages } });
            return;
          }
        }
        // jon qoldi yoki to'g'ri — davom etamiz.
        if (qi + 1 >= order.length) {
          // ✅ Butun bosqich tugadi → keyingi bosqich (ko'proq odam).
          stagesRef.current += 1;
          startRound(runLevel + 1, false);
        } else {
          setPicked(null);
          setQi(qi + 1);
        }
      }, 650);
    },
    [picked, people, order, qi, feel, finish, runLevel, startRound],
  );

  if (summary) {
    const stages = summary.result.meta?.stages ?? 0;
    return (
      <ResultPanel
        outcome={summary.outcome}
        stats={[
          { label: tg('stages'), value: `${stages}` },
          { label: tg('score'), value: `${feel.score}` },
          { label: tg('maxCombo'), value: `×${feel.maxCombo}` },
        ]}
        onContinue={() => {
          nextRound();
          startRound(summary.outcome.state.D, true);
        }}
      />
    );
  }

  // ---- Yodlash ----
  if (phase === 'memorize') {
    return (
      <div className="flex flex-col items-center gap-5 px-4 py-6">
        <FeelHud feel={feel} level={runLevel} lives={lives} progress={`${params.count}`} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('memorize')}
        </span>
        <div className="grid w-full max-w-md grid-cols-2 gap-4">
          {people.map((p) => (
            <div
              key={p.seed}
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface/40 p-4"
            >
              <Avatar seed={p.seed} gender={p.gender} />
              <span className="text-[17px] font-medium text-ink">{p.name}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted">{t('instruction')}</p>
      </div>
    );
  }

  // ---- Savol ----
  const person = people[order[qi]];
  return (
    <div className="flex flex-col items-center gap-5 px-4 py-6">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={runLevel} lives={lives} progress={`${qi + 1} / ${order.length}`} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {t('whoIsThis')}
      </span>

      {person && (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-line bg-surface/40 p-6">
          <Avatar seed={person.seed} gender={person.gender} size={110} />
        </div>
      )}

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {options.map((name) => {
          const isCorrect = picked && name === person?.name;
          const isWrongPick = picked === name && name !== person?.name;
          return (
            <button
              key={name}
              onClick={() => choose(name)}
              className={[
                'rounded-2xl py-4 text-[17px] font-medium transition-colors active:scale-95',
                isCorrect
                  ? 'bg-accent text-bg'
                  : isWrongPick
                    ? 'bg-danger text-bg'
                    : 'bg-surface2 text-ink',
              ].join(' ')}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
