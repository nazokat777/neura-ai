'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { paramsForLevel, type StroopParams } from './params';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

const DRILL_ID = 'stroop';

// Rang kalitlari (so'z nomi messages.stroop.names dan, rang hex shu yerда).
// 8 ta ANIQ FARQLI rang (o'xshash ko'k/siyohranglar olib tashlandi —
// foydalanuvchi rangni aniq ajratsin).
const COLORS = [
  { key: 'red', hex: '#FF4D4D' },
  { key: 'blue', hex: '#3B82F6' },
  { key: 'green', hex: '#22C55E' },
  { key: 'yellow', hex: '#FACC15' },
  { key: 'purple', hex: '#A855F7' },
  { key: 'orange', hex: '#FB923C' },
  { key: 'pink', hex: '#EC4899' },
  { key: 'cyan', hex: '#14E0E0' },
] as const;

interface Trial {
  wordKey: string; // ko'rsatilgan so'z
  inkIndex: number; // matnning ko'rinish rangi (xalaqit — chalg'ituvchi)
  answerIndex: number; // TO'G'RI javob = SO'Z MA'NOSI rangi
}

function makeTrial(p: StroopParams): Trial {
  const pool = COLORS.slice(0, p.colorCount);
  // So'z ma'nosi (javob) — buni topish kerak.
  const wordIndex = Math.floor(Math.random() * pool.length);
  const mismatched = Math.random() < p.mismatch;
  // Harf rangi (xalaqit) — ma'nodan farqli bo'lsa qiyinlashadi.
  let inkIndex = wordIndex;
  if (mismatched && pool.length > 1) {
    do {
      inkIndex = Math.floor(Math.random() * pool.length);
    } while (inkIndex === wordIndex);
  }
  return { wordKey: pool[wordIndex].key, inkIndex, answerIndex: wordIndex };
}

export default function StroopGame() {
  const t = useTranslations('stroop');
  const tg = useTranslations('game');
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [params, setParams] = useState<StroopParams>(() => paramsForLevel(1));
  const [trial, setTrial] = useState<Trial | null>(null);
  const [index, setIndex] = useState(0);
  // SURVIVAL: to'g'ri javob → keyingi bosqich; 3 jon tugasa → tugadi.
  const [runLevel, setRunLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const baseDRef = useRef(1);
  const stagesRef = useRef(0);
  const trialStartRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  // Joriy trial raqami — eskirgan trialga mo'ljal bosishni rad etish uchun
  // (qulf O'RNIGA: tez bosishni bloklamaydi, faqat noto'g'ri trialni rad etadi).
  const trialIdRef = useRef(0);
  const loseLifeRef = useRef<() => void>(() => {});

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const endGame = useCallback(() => {
    clearTimer();
    const stages = stagesRef.current;
    const accuracy = Math.max(0, Math.min(1, 0.45 + stages * 0.05));
    finish({ accuracy, speedScore: accuracy, meta: { stages } });
  }, [finish]);

  // Bitta bosqichni ko'rsatadi (survival — chegara yo'q).
  const showTrial = useCallback((p: StroopParams) => {
    setTrial(makeTrial(p));
    trialStartRef.current = performance.now();
    clearTimer();
    // Bu trialga ID beramiz. Timeout faqat SHU trial hali javobsiz bo'lsa
    // ishlaydi (tez bosish bloklanmaydi — qulf yo'q).
    trialIdRef.current += 1;
    const myId = trialIdRef.current;
    timerRef.current = window.setTimeout(() => {
      if (trialIdRef.current !== myId) return; // allaqachon javob berilgan
      feel.register(false);
      loseLifeRef.current();
    }, p.trialMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const curLevel = () => baseDRef.current + Math.floor(stagesRef.current / 5);

  // Jon yo'qotish: 3 tasi tugasa o'yin tugaydi, aks holda yangi bosqich (o'sha daraja).
  const loseLife = useCallback(() => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    if (livesRef.current <= 0) {
      endGame();
      return;
    }
    showTrial(paramsForLevel(curLevel()));
  }, [endGame, showTrial]);
  loseLifeRef.current = loseLife;

  const beginRun = useCallback(
    (D: number) => {
      baseDRef.current = D;
      stagesRef.current = 0;
      livesRef.current = 3;
      setLives(3);
      setIndex(0);
      setRunLevel(D);
      feel.reset();
      const p = paramsForLevel(D);
      setParams(p);
      showTrial(p);
    },
    [showTrial, feel],
  );

  useEffect(() => {
    if (ready) beginRun(state.D);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onAnswer = useCallback(
    (i: number) => {
      if (!trial) return;
      trialIdRef.current += 1; // bu trial javob oldi — timeout endi ishламaydi
      clearTimer();
      const rt = performance.now() - trialStartRef.current;
      const ok = i === trial.answerIndex;
      feel.register(ok, 1 - rt / params.trialMs);
      if (!ok) {
        loseLife();
        return;
      }
      // ✅ keyingi bosqich; har 5 bosqichда qiyinlashadi
      stagesRef.current += 1;
      setIndex((n) => n + 1);
      const lvl = curLevel();
      const p = paramsForLevel(lvl);
      setRunLevel(lvl);
      setParams(p);
      showTrial(p);
    },
    [trial, params, feel, loseLife, showTrial],
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
          beginRun(summary.outcome.state.D);
        }}
      />
    );
  }

  const pool = COLORS.slice(0, params.colorCount);
  return (
    <div className="flex flex-col items-center gap-8 px-4 py-8">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={runLevel} lives={lives} progress={`#${index + 1}`} />

      <div className="relative flex min-h-[28vh] w-full items-center justify-center overflow-hidden rounded-3xl bg-surface/40">
        {trial && (
          <span
            key={index}
            className="t-display animate-stim text-6xl font-semibold"
            style={{
              color: COLORS[trial.inkIndex].hex,
              textShadow: `0 0 30px ${COLORS[trial.inkIndex].hex}55`,
            }}
          >
            {t(`names.${trial.wordKey}`)}
          </span>
        )}
        {/* vaqt chizig'i */}
        <span
          key={`bar-${index}`}
          className="absolute bottom-0 left-0 h-1 bg-accent"
          style={{ animation: `shrink-bar ${params.trialMs}ms linear forwards` }}
        />
      </div>

      <p className="text-center text-sm text-muted">{t('instruction')}</p>

      <div className="grid w-full max-w-md grid-cols-4 gap-3">
        {pool.map((c, i) => (
          <button
            key={c.key}
            onClick={() => onAnswer(i)}
            aria-label={c.key}
            className="aspect-square rounded-xl transition-transform active:scale-90"
            style={{
              backgroundColor: c.hex,
              boxShadow: `0 4px 16px ${c.hex}33`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
