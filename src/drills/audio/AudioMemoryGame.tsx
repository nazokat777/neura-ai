'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { paramsForLevel, type AudioParams } from './params';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import { fxNote } from '@/lib/feedback';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

const DRILL_ID = 'audioMemory';
const PADS = [
  { color: '#FF6B6B', freq: 330 },
  { color: '#F4B740', freq: 392 },
  { color: '#4D8DFF', freq: 494 },
  { color: '#7C9CFF', freq: 587 },
];
const NOTE_MS = 340;

export default function AudioMemoryGame() {
  const t = useTranslations('audio');
  const tg = useTranslations('game');
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [params, setParams] = useState<AudioParams>(() => paramsForLevel(1));
  const [phase, setPhase] = useState<'play' | 'input'>('play');
  const [active, setActive] = useState<number | null>(null);
  // SURVIVAL: ketma-ketlikni to'liq qaytarsa → keyingi bosqich; 3 jon tugasa → tugadi.
  const [runLevel, setRunLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const stagesRef = useRef(0);

  const seqRef = useRef<number[]>([]);
  const inputIdxRef = useRef(0);
  const lastTapRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const flash = (pad: number) => {
    setActive(pad);
    fxNote(PADS[pad].freq);
    timersRef.current.push(window.setTimeout(() => setActive(null), NOTE_MS * 0.7));
  };

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
      const seq = Array.from({ length: p.seqLen }, () =>
        Math.floor(Math.random() * 4),
      );
      seqRef.current = seq;
      inputIdxRef.current = 0;
      setPhase('play');
      setActive(null);
      clearTimers();
      const step = NOTE_MS + p.gapMs;
      seq.forEach((pad, k) => {
        timersRef.current.push(window.setTimeout(() => flash(pad), 600 + k * step));
      });
      timersRef.current.push(
        window.setTimeout(() => {
          setPhase('input');
          lastTapRef.current = performance.now();
        }, 600 + seq.length * step),
      );
    },
    [feel],
  );

  useEffect(() => {
    if (ready) startRound(state.D, true);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const endGame = useCallback(() => {
    clearTimers();
    const stages = stagesRef.current;
    const accuracy = Math.max(0, Math.min(1, 0.45 + stages * 0.06));
    finish({ accuracy, speedScore: accuracy, meta: { stages } });
  }, [finish]);

  const onPad = useCallback(
    (pad: number) => {
      if (phase !== 'input') return;
      const i = inputIdxRef.current;
      const expected = seqRef.current[i];
      const ok = pad === expected;
      const now = performance.now();
      const rt = now - lastTapRef.current;
      lastTapRef.current = now;
      feel.register(ok, 1 - rt / 1500);
      setActive(pad);
      fxNote(PADS[pad].freq);
      window.setTimeout(() => setActive(null), 160);

      if (!ok) {
        // ❌ Xato pad → jon ketadi. 3 jon tugasa o'yin tugaydi.
        setPhase('play'); // padlarni darhol qulflaymiz (qo'shimcha bosish jon olmasin)
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          endGame();
        } else {
          // jon qoldi — o'sha bosqichni qaytadan (yangi ohang).
          window.setTimeout(() => startRound(runLevel, false), 600);
        }
        return;
      }
      inputIdxRef.current = i + 1;
      if (inputIdxRef.current >= seqRef.current.length) {
        // ✅ To'liq qaytardi → keyingi bosqich (uzunroq), ball saqlanadi.
        setPhase('play'); // padlarni qulflaymiz (pauzada qo'shimcha bosish bo'lmasin)
        stagesRef.current += 1;
        window.setTimeout(() => startRound(runLevel + 1, false), 500);
      }
    },
    [phase, feel, endGame, runLevel, startRound],
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

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={runLevel} lives={lives} progress={`${params.seqLen}`} />

      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {phase === 'play' ? t('listen') : t('repeat')}
      </span>

      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        {PADS.map((pad, i) => (
          <button
            key={i}
            onClick={() => onPad(i)}
            disabled={phase === 'play'}
            aria-label={`pad ${i + 1}`}
            className="aspect-square rounded-2xl transition-all duration-100 active:scale-95 disabled:cursor-default"
            style={{
              backgroundColor: pad.color,
              opacity: active === i ? 1 : 0.4,
              boxShadow: active === i ? `0 0 26px ${pad.color}` : 'none',
              transform: active === i ? 'scale(1.04)' : undefined,
            }}
          />
        ))}
      </div>

      <p className="max-w-[20rem] text-center text-sm text-muted">{t('instruction')}</p>
    </div>
  );
}
