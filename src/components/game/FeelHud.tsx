'use client';

import { useTranslations } from 'next-intl';
import type { GameFeel } from '@/drills/engine/useGameFeel';

// O'yin tepasidagi jonli HUD: daraja · progress · ball · kombo.
export default function FeelHud({
  feel,
  level,
  progress,
  lives,
  maxLives = 3,
}: {
  feel: GameFeel;
  level: number;
  /** "3 / 12" kabi progress matni (ixtiyoriy). */
  progress?: string;
  /** Qolgan jonlar (survival). Berilsa yuraklar ko'rsatiladi. */
  lives?: number;
  maxLives?: number;
}) {
  const tc = useTranslations('common');
  const tg = useTranslations('game');

  return (
    <div className="num flex w-full items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 text-muted">
        <span>
          {tc('level')} <span className="text-ink">{level}</span>
        </span>
        {lives !== undefined && (
          <span className="flex items-center gap-0.5" aria-label={`${lives}/${maxLives}`}>
            {Array.from({ length: maxLives }, (_, i) => (
              <span
                key={i}
                className={i < lives ? 'text-danger' : 'text-line'}
                style={{ fontSize: '13px', lineHeight: 1 }}
              >
                {i < lives ? '♥' : '♡'}
              </span>
            ))}
          </span>
        )}
      </span>

      <div className="flex items-center gap-3">
        {progress && <span className="text-muted">{progress}</span>}
        {feel.combo >= 2 && (
          <span
            key={feel.combo}
            className="animate-combo rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent"
          >
            {tg('combo')} ×{feel.combo}
          </span>
        )}
        <span
          className="tabular-nums font-semibold text-ink"
          style={{ minWidth: '3.5ch', textAlign: 'right' }}
        >
          {feel.score}
        </span>
      </div>
    </div>
  );
}
