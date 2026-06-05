'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { bankFor, type WordEntry } from './words';
import { useDrill } from '@/drills/engine/useDrill';
import { useGameFeel } from '@/drills/engine/useGameFeel';
import ResultPanel from '@/components/ResultPanel';
import FeelHud from '@/components/game/FeelHud';
import FeelFx from '@/components/game/FeelFx';

const DRILL_ID = 'crossword';

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

interface Tile { ch: string; id: number; }

export default function CrosswordGame() {
  const t = useTranslations('crossword');
  const tg = useTranslations('game');
  const locale = useLocale();
  const { state, ready, summary, finish, nextRound } = useDrill(DRILL_ID);
  const feel = useGameFeel();

  const [entry, setEntry] = useState<WordEntry | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [built, setBuilt] = useState<Tile[]>([]);
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);

  const wordsRef = useRef<WordEntry[]>([]);
  const startRef = useRef(0);
  // SURVIVAL: to'g'ri so'z → keyingi bosqich; 3 jon tugasa → tugadi.
  const stagesRef = useRef(0);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);

  const loadTrial = useCallback((i: number) => {
    const bank = wordsRef.current;
    // So'zlar tugasa qaytadan aralashtiramiz (survival — chegara yo'q).
    if (i > 0 && i % bank.length === 0) wordsRef.current = shuffle(bank);
    const e = wordsRef.current[i % wordsRef.current.length];
    setEntry(e);
    setTiles(shuffle(e.word.split('').map((ch, id) => ({ ch, id }))));
    setBuilt([]);
    setFlash(null);
    setIndex(i);
    startRef.current = performance.now();
  }, []);

  const startRound = useCallback(
    (D: number) => {
      void D;
      wordsRef.current = shuffle(bankFor(locale));
      stagesRef.current = 0;
      livesRef.current = 3;
      setLives(3);
      feel.reset();
      loadTrial(0);
    },
    [locale, feel, loadTrial],
  );

  useEffect(() => {
    if (ready) startRound(state.D);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const usedIds = new Set(built.map((b) => b.id));

  const tapTile = (tile: Tile) => {
    if (flash || usedIds.has(tile.id) || !entry) return;
    if (built.length >= entry.word.length) return;
    setBuilt((b) => [...b, tile]);
  };
  const backspace = () => {
    if (flash) return;
    setBuilt((b) => b.slice(0, -1));
  };

  const check = useCallback(() => {
    if (!entry || built.length !== entry.word.length || flash) return;
    const guess = built.map((b) => b.ch).join('');
    const ok = guess === entry.word;
    const rt = performance.now() - startRef.current;
    feel.register(ok, 1 - rt / 20000);
    setFlash(ok ? 'ok' : 'bad');
    window.setTimeout(() => {
      if (!ok) {
        // ❌ Noto'g'ri so'z → jon ketadi. 3 jon tugasa o'yin tugaydi.
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          const stages = stagesRef.current;
          const accuracy = Math.max(0, Math.min(1, 0.45 + stages * 0.06));
          finish({ accuracy, speedScore: accuracy, meta: { stages } });
        } else {
          // jon qoldi — keyingi so'z (bosqich qo'shilmaydi).
          loadTrial(index + 1);
        }
        return;
      }
      // ✅ To'g'ri → keyingi so'z.
      stagesRef.current += 1;
      loadTrial(index + 1);
    }, 700);
  }, [entry, built, flash, index, feel, finish, loadTrial]);

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
          startRound(summary.outcome.state.D);
        }}
      />
    );
  }

  const wordLen = entry?.word.length ?? 0;
  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <FeelFx feel={feel} />
      <FeelHud feel={feel} level={state.D} lives={lives} progress={`#${index + 1}`} />

      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {t('clue')}
      </span>
      <p className="max-w-[22rem] text-center text-[19px] font-medium text-ink">
        {entry?.clue}
      </p>

      {/* Javob kataklari */}
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: wordLen }, (_, i) => {
          const b = built[i];
          return (
            <div
              key={i}
              className={[
                'flex h-12 w-10 items-center justify-center rounded-lg border text-2xl font-semibold',
                flash === 'ok'
                  ? 'border-accent bg-accent text-bg'
                  : flash === 'bad'
                    ? 'border-danger text-danger'
                    : b
                      ? 'border-accent/60 bg-surface2 text-ink'
                      : 'border-line text-muted',
              ].join(' ')}
            >
              {b?.ch ?? ''}
            </div>
          );
        })}
      </div>

      {/* Harf plitkalari */}
      <div className="flex flex-wrap justify-center gap-2">
        {tiles.map((tile) => {
          const used = usedIds.has(tile.id);
          return (
            <button
              key={tile.id}
              onClick={() => tapTile(tile)}
              disabled={used}
              className={[
                'flex h-12 w-10 items-center justify-center rounded-lg text-2xl font-semibold transition-all active:scale-90',
                used ? 'bg-surface/40 text-muted/30' : 'bg-surface2 text-ink hover:bg-line',
              ].join(' ')}
            >
              {tile.ch}
            </button>
          );
        })}
      </div>

      <div className="flex w-full max-w-md gap-3">
        <button
          onClick={backspace}
          disabled={built.length === 0 || !!flash}
          className="flex-1 rounded-2xl bg-surface2 py-3 font-medium text-ink active:scale-95 disabled:opacity-30"
        >
          ⌫
        </button>
        <button
          onClick={check}
          disabled={built.length !== wordLen || !!flash}
          className="flex-[2] rounded-2xl bg-accent py-3 font-semibold text-bg active:scale-95 disabled:opacity-30"
        >
          {t('check')}
        </button>
      </div>
    </div>
  );
}
