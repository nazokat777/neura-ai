'use client';

import type { GameFeel } from '@/drills/engine/useGameFeel';

// Cinematic feedback qatlami — ekran chetidan bir lahzalik nur + suzuvchi ball.
// `feel.last` o'zgarganда (id orqali) animatsiya qayta ishga tushadi.
// pointer-events yo'q — o'yinга xalaqit bermaydi.
export default function FeelFx({ feel }: { feel: GameFeel }) {
  const last = feel.last;
  if (!last) return null;

  const isMiss = last.tier === 'miss';
  const color = isMiss
    ? 'rgba(255,107,107,0.55)' // danger
    : last.tier === 'great'
      ? 'rgba(77,141,255,0.6)' // accent
      : 'rgba(77,141,255,0.4)';

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      {/* Ekran chetidan nur */}
      <div
        key={`edge-${last.id}`}
        className="animate-edge absolute inset-0"
        style={{
          boxShadow: `inset 0 0 90px 8px ${color}`,
        }}
      />

      {/* Suzuvchi "+ball" yoki "Miss" — markaz yuqorida */}
      <div
        key={`float-${last.id}`}
        className="animate-float absolute left-1/2 top-[34%] text-center"
      >
        {isMiss ? (
          <span className="text-2xl font-semibold text-danger">×</span>
        ) : (
          <span className="num flex flex-col items-center">
            <span
              className="text-3xl font-bold"
              style={{ color: last.tier === 'great' ? '#4D8DFF' : '#ECEFF7' }}
            >
              +{last.value}
            </span>
            {last.multiplier > 1 && (
              <span className="text-[11px] font-semibold text-accent">
                ×{last.multiplier}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
