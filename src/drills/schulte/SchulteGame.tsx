'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { paramsForLevel, type SchulteParams } from './params';
import {
  applyRound,
  initialState,
  type ApplyOutcome,
} from '@/drills/engine/AdaptiveController';
import { speedScoreFromTime } from '@/drills/engine/performance';
import type { AdaptiveState } from '@/drills/engine/types';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';
import {
  loadDifficulty,
  saveDifficulty,
  saveBest,
  saveLast,
  incSynapses,
  pushHistory,
  recordActivity,
} from '@/lib/storage';
import { fxLevelUp, fxFinish } from '@/lib/feedback';

const DRILL_ID = 'schulte';
// Har to'g'ri raqam topilganda vaqt shu qadar orqaga qaytadi (qo'shiladi).
const TIME_BONUS_MS = 1000;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Chalg'ituvchi rang-shovqin palitra (yuqori D).
const NOISE_COLORS = ['#ECEFF7', '#4D8DFF', '#F4B740', '#FF6B6B', '#7C9CFF'];
function noiseColor() {
  return NOISE_COLORS[Math.floor(Math.random() * NOISE_COLORS.length)];
}

function fmtTime(ms: number): string {
  const deci = Math.max(0, Math.ceil(ms / 100));
  const s = Math.floor(deci / 10);
  const dd = deci % 10;
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const p = (x: number) => String(x).padStart(2, '0');
  return `${p(mm)}:${p(ss)}.${dd}`;
}

interface RoundSummary {
  found: number;
  errors: number;
  outcome: ApplyOutcome;
}

export default function SchulteGame() {
  const t = useTranslations('schulte');
  const tc = useTranslations('common');
  const tg = useTranslations('game');
  const tb = useTranslations('baseline');
  const router = useRouter();
  const feel = useGameFeel();

  // Baseline (A-nuqta) rejimida ochilganmi? (`?b=1`) — tugagach testga qaytaramiz.
  const [fromBaseline, setFromBaseline] = useState(false);
  useEffect(() => {
    setFromBaseline(new URLSearchParams(window.location.search).get('b') === '1');
  }, []);

  const [state, setState] = useState<AdaptiveState>(() => initialState(1));
  const [params, setParams] = useState<SchulteParams>(() => paramsForLevel(1));
  const [numbers, setNumbers] = useState<number[]>([]); // har katakdagi joriy raqam
  const [colors, setColors] = useState<string[]>([]);
  const [target, setTarget] = useState(1);
  const [wrongPos, setWrongPos] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bonusFlash, setBonusFlash] = useState(0); // "+1s" animatsiyasini qayta ishga tushiradi
  const [summary, setSummary] = useState<RoundSummary | null>(null);

  const foundRef = useRef(0);
  const errorsRef = useRef(0);
  const spawnRef = useRef(0); // keyingi chiqadigan yangi raqam
  const lastFindRef = useRef(0);
  const endAtRef = useRef(0);
  const tickRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  // doimiy qiymatlar (timer closure'lari uchun)
  const stateRef = useRef(state);
  const paramsRef = useRef(params);
  stateRef.current = state;
  paramsRef.current = params;

  const clearTimers = () => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    if (endRef.current) window.clearTimeout(endRef.current);
    tickRef.current = null;
    endRef.current = null;
  };

  const finishRound = useCallback(() => {
    clearTimers();
    const s = stateRef.current;
    const p = paramsRef.current;
    const found = foundRef.current;
    const errors = errorsRef.current;
    const total = found + errors;
    const accuracy = total > 0 ? found / total : 0;
    const avgPerFind = found > 0 ? p.durationMs / found : p.durationMs;
    const speedScore = speedScoreFromTime(avgPerFind, p.targetPerFindMs);
    const outcome = applyRound(s, {
      accuracy,
      speedScore,
      meta: { found, errors },
    });
    const at = Date.now();
    saveDifficulty(DRILL_ID, outcome.state);
    saveBest(DRILL_ID, found);
    saveLast(DRILL_ID, {
      performance: outcome.performance,
      level: outcome.state.D,
      at,
    });
    incSynapses(DRILL_ID);
    pushHistory(DRILL_ID, {
      at,
      performance: outcome.performance,
      level: outcome.state.D,
    });
    recordActivity();
    if (outcome.direction === 'up') fxLevelUp();
    else fxFinish();
    setState(outcome.state);
    setSummary({ found, errors, outcome });
  }, []);

  const startRound = useCallback(
    (s: AdaptiveState) => {
      const p = paramsForLevel(s.D);
      setParams(p);
      const init = shuffle(Array.from({ length: p.count }, (_, i) => i + 1));
      setNumbers(init);
      setColors(init.map(() => (p.colorNoise ? noiseColor() : '#ECEFF7')));
      setTarget(1);
      setWrongPos(null);
      setSummary(null);
      foundRef.current = 0;
      errorsRef.current = 0;
      spawnRef.current = p.count + 1; // keyingi yangi raqam
      feel.reset();

      const now = performance.now();
      endAtRef.current = now + p.durationMs;
      lastFindRef.current = now;
      setTimeLeft(p.durationMs);

      clearTimers();
      tickRef.current = window.setInterval(() => {
        const left = endAtRef.current - performance.now();
        if (left <= 0) {
          setTimeLeft(0);
          finishRound(); // bonus tufayli muddat o'zgaradi — shuning uchun tick orqali tugaymiz
          return;
        }
        setTimeLeft(left);
      }, 100);
    },
    [feel, finishRound],
  );

  // Saqlangan darajani yuklab, birinchi raundni boshlash.
  useEffect(() => {
    const loaded = loadDifficulty(DRILL_ID);
    setState(loaded);
    stateRef.current = loaded;
    startRound(loaded);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCell = useCallback(
    (pos: number) => {
      if (summary) return;
      const value = numbers[pos];
      if (value !== target) {
        errorsRef.current += 1;
        feel.register(false);
        setWrongPos(pos);
        window.setTimeout(() => setWrongPos(null), 200);
        return;
      }
      // to'g'ri: tezlik bonusini hisobla
      const nowT = performance.now();
      const dt = nowT - lastFindRef.current;
      lastFindRef.current = nowT;
      feel.register(true, 1 - dt / paramsRef.current.targetPerFindMs);
      foundRef.current += 1;

      // ⏪ Vaqt orqaga qaytadi — har to'g'ri raqam vaqt qo'shadi.
      endAtRef.current += TIME_BONUS_MS;
      setTimeLeft(Math.max(0, endAtRef.current - nowT));
      setBonusFlash((x) => x + 1);

      // raqamni almashtir: o'rniga yangi (kattaroq) raqam chiqadi
      const spawn = spawnRef.current;
      spawnRef.current = spawn + 1;
      setNumbers((prev) => {
        const nx = [...prev];
        nx[pos] = spawn;
        return nx;
      });
      if (paramsRef.current.colorNoise) {
        setColors((prev) => {
          const nx = [...prev];
          nx[pos] = noiseColor();
          return nx;
        });
      }
      setTarget((tg2) => tg2 + 1);
    },
    [summary, numbers, target, feel],
  );

  // ---- Natija ekrani ----
  if (summary) {
    const { outcome } = summary;
    const dirKey =
      outcome.direction === 'up'
        ? 'levelUp'
        : outcome.direction === 'down'
          ? 'levelDown'
          : 'levelSame';
    const acc =
      summary.found + summary.errors > 0
        ? Math.round((summary.found / (summary.found + summary.errors)) * 100)
        : 0;
    const dirText = outcome.direction === 'up' ? '↑' : outcome.direction === 'down' ? '↓' : '=';
    const dirColor =
      outcome.direction === 'up'
        ? 'text-emerald-300'
        : outcome.direction === 'down'
          ? 'text-danger'
          : 'text-muted';
    void dirKey;
    return (
      <div className="animate-pop relative mx-auto flex w-full max-w-md flex-col px-4 py-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 0%, rgba(125,100,255,0.22), rgba(6,8,15,0) 70%)',
          }}
        />

        <span className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
          {t('timeUp')}
        </span>

        {/* Hero — topilgan raqamlar */}
        <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl">
          <p
            className="num font-semibold leading-none"
            style={{
              fontSize: 'clamp(3.2rem, 16vw, 4.6rem)',
              background: 'linear-gradient(135deg, #6FA8FF, #B06CFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {summary.found}
          </p>
          <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
            {t('found')}
          </p>
        </div>

        {/* Statistikalar */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <StatCard label={tc('accuracy')} value={`${acc}%`} />
          <StatCard label={tg('score')} value={`${feel.score}`} />
          <StatCard label={tg('maxCombo')} value={`×${feel.maxCombo}`} />
        </div>

        {/* Daraja */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 backdrop-blur-xl">
          <span className="text-[13px] text-muted">{tc('level')}</span>
          <span className="num flex items-center gap-1.5 text-[15px] font-semibold text-ink">
            {outcome.state.D}
            <span className={['animate-accent', dirColor].join(' ')}>{dirText}</span>
          </span>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          {fromBaseline ? (
            <>
              <button
                onClick={() => router.push('/baseline')}
                className="w-full rounded-full py-4 text-[16px] font-semibold text-bg active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #4D8DFF, #B06CFF)', boxShadow: '0 8px 28px rgba(125,100,255,0.35)' }}
              >
                {tb('returnToTest')} →
              </button>
              <button
                onClick={() => startRound(outcome.state)}
                className="w-full rounded-full border border-white/10 bg-white/[0.03] py-3 text-[14px] font-medium text-ink active:scale-[0.98]"
              >
                {tc('again')}
              </button>
            </>
          ) : (
            <button
              onClick={() => startRound(outcome.state)}
              className="w-full rounded-full py-4 text-[16px] font-semibold text-bg active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4D8DFF, #B06CFF)', boxShadow: '0 8px 28px rgba(125,100,255,0.35)' }}
            >
              {tc('again')} →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---- O'yin ekrani ----
  const lowTime = timeLeft <= 5000;
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-4">
      <FeelFx feel={feel} />

      {/* Vaqt + HUD */}
      <div className="flex w-full items-center justify-between">
        <span className="relative flex items-center">
          <span
            className={[
              'num text-2xl font-semibold tabular-nums',
              lowTime ? 'text-danger' : 'text-ink',
            ].join(' ')}
            style={lowTime ? { textShadow: '0 0 14px rgba(255,107,107,0.6)' } : undefined}
          >
            {fmtTime(timeLeft)}
          </span>
          {bonusFlash > 0 && (
            <span
              key={bonusFlash}
              className="num animate-rise absolute left-full ml-2 whitespace-nowrap text-sm font-semibold text-accent"
            >
              +{(TIME_BONUS_MS / 1000).toFixed(0)}s
            </span>
          )}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('find', { n: target })}
        </span>
      </div>
      <FeelHud feel={feel} level={state.D} progress={`${params.n}×${params.n}`} />

      {/* Vaqt chizig'i */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface2">
        <div
          className={lowTime ? 'h-full bg-danger' : 'h-full bg-accent'}
          style={{ width: `${Math.min(100, (timeLeft / params.durationMs) * 100)}%` }}
        />
      </div>

      <div
        className="grid w-full max-w-md select-none gap-2"
        style={{ gridTemplateColumns: `repeat(${params.n}, minmax(0, 1fr))` }}
      >
        {numbers.map((value, i) => {
          const isWrong = wrongPos === i;
          return (
            <button
              key={i}
              onClick={() => onCell(i)}
              style={{ color: isWrong ? undefined : colors[i] }}
              className={[
                'num aspect-square rounded-xl text-xl font-semibold transition-all duration-150',
                'flex items-center justify-center active:scale-90',
                isWrong ? 'bg-danger text-bg' : 'bg-surface2 hover:bg-line',
              ].join(' ')}
            >
              {value}
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted">{t('instruction')}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center backdrop-blur-xl">
      <p className="num text-xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
    </div>
  );
}
