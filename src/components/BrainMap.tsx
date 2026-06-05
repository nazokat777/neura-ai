'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadLast, loadSynapses } from '@/lib/storage';
import { detectCapability } from '@/lib/deviceDetector';

// Cinematic miya: har mintaqa bir domenga bog'langan va o'sha mashqning
// OXIRGI natijasidan yonadi. Sinaps uchqunlari mintaqalar orasida oqadi.
// "Sinaps faolligi" = jami o'ynalgan raundlar (halol metafora, biologik da'vo emas).

interface Region {
  domain: string;
  drillId: string;
  x: number;
  y: number;
  labelAnchor: 'start' | 'middle' | 'end';
  lx: number;
  ly: number;
}

// Miya lobalari ustidagi nuqtalar (viewBox 0 0 300 230).
const REGIONS: Region[] = [
  { domain: 'logic', drillId: 'math', x: 222, y: 96, labelAnchor: 'start', lx: 240, ly: 92 },
  { domain: 'attention', drillId: 'schulte', x: 150, y: 64, labelAnchor: 'middle', lx: 150, ly: 44 },
  { domain: 'focus', drillId: 'stroop', x: 78, y: 104, labelAnchor: 'end', lx: 60, ly: 100 },
  { domain: 'memory', drillId: 'memory', x: 176, y: 150, labelAnchor: 'start', lx: 196, ly: 158 },
  { domain: 'speed', drillId: 'speed', x: 142, y: 112, labelAnchor: 'middle', lx: 142, ly: 200 },
];

// Tezlik — markaziy hub; qolganlari unga ulanadi (sinaps yo'llari).
const HUB = REGIONS[4];
const LINKS = REGIONS.filter((r) => r !== HUB).map((r) => ({ from: HUB, to: r }));

interface RegionData extends Region {
  value: number | null;
}

export default function BrainMap() {
  const tdom = useTranslations('domains');
  const tb = useTranslations('brain');

  const [regions, setRegions] = useState<RegionData[]>(
    REGIONS.map((r) => ({ ...r, value: null })),
  );
  const [synapses, setSynapses] = useState(0);
  const [display, setDisplay] = useState(0); // count-up qiymati
  const [animate, setAnimate] = useState(false);

  // localStorage faqat mount'dan keyin (hydration xavfsiz).
  useEffect(() => {
    setRegions(
      REGIONS.map((r) => {
        const last = loadLast(r.drillId);
        return { ...r, value: last ? last.performance : null };
      }),
    );
    const total = loadSynapses();
    setSynapses(total);
    setAnimate(!detectCapability().reducedMotion);
  }, []);

  // "Sinaps faolligi" raqami 0 dan jami qiymatga sanaladi (cinematic).
  useEffect(() => {
    if (!animate) {
      setDisplay(synapses);
      return;
    }
    if (synapses === 0) return;
    let raf = 0;
    const dur = 900;
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min(1, (ts - startTs) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
      setDisplay(Math.round(eased * synapses));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [synapses, animate]);

  return (
    <div className="flex flex-col items-center gap-6">
      <svg
        viewBox="0 0 300 230"
        className="w-full max-w-[340px]"
        role="img"
        aria-label={tb('aria')}
      >
        <defs>
          <filter id="brainGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(77,141,255,0.30)" />
            <stop offset="100%" stopColor="rgba(77,141,255,0)" />
          </radialGradient>
        </defs>

        {/* Yumshoq markaziy nur */}
        <ellipse cx="150" cy="112" rx="120" ry="80" fill="url(#coreGlow)" />

        {/* Miya silueti */}
        <path
          d="M62 118 C50 84 92 52 140 56 C168 40 214 46 232 72 C258 78 264 114 244 132
             C250 158 218 178 184 170 C158 188 108 184 90 160 C60 158 50 140 62 118 Z"
          fill="rgba(12,16,24,0.6)"
          stroke="#1E2633"
          strokeWidth="1.5"
        />
        {/* Egatlar (gyri) — miya teksturasi */}
        <g fill="none" stroke="#1E2633" strokeWidth="1.2" strokeLinecap="round">
          <path d="M92 96 C120 86 150 102 176 92" />
          <path d="M100 122 C132 114 168 128 202 116" />
          <path d="M110 148 C140 140 170 152 196 144" />
          <path d="M150 60 L150 168" opacity="0.5" />
        </g>

        {/* Sinaps yo'llari + uchqunlar */}
        {LINKS.map((l, i) => {
          const id = `link-${i}`;
          const measured = regions.find((r) => r.domain === l.to.domain)?.value != null;
          // Egri yo'l (hub → mintaqa)
          const mx = (l.from.x + l.to.x) / 2;
          const my = (l.from.y + l.to.y) / 2 - 14;
          const d = `M${l.from.x} ${l.from.y} Q${mx} ${my} ${l.to.x} ${l.to.y}`;
          return (
            <g key={id}>
              <path
                id={id}
                d={d}
                fill="none"
                stroke={measured ? 'rgba(77,141,255,0.35)' : 'rgba(138,147,166,0.18)'}
                strokeWidth="1.2"
              />
              {animate && measured && (
                <circle r="2.2" fill="#4D8DFF">
                  <animateMotion
                    dur={`${1.8 + i * 0.25}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                  >
                    <mpath href={`#${id}`} />
                  </animateMotion>
                </circle>
              )}
            </g>
          );
        })}

        {/* Mintaqa tugunlari */}
        {regions.map((r) => {
          const measured = r.value != null;
          const v = measured ? Math.max(0, Math.min(1, r.value as number)) : 0;
          const radius = 4 + v * 5;
          return (
            <g key={r.domain}>
              {measured && (
                <circle
                  cx={r.x}
                  cy={r.y}
                  r={radius + 6}
                  fill="#4D8DFF"
                  opacity={0.18 + v * 0.25}
                  filter="url(#brainGlow)"
                />
              )}
              <circle
                cx={r.x}
                cy={r.y}
                r={measured ? radius : 4}
                fill={measured ? '#4D8DFF' : '#06080F'}
                stroke={measured ? 'none' : '#8A93A6'}
                strokeWidth={measured ? 0 : 1}
                strokeDasharray={measured ? undefined : '2 2'}
              />
              <text
                x={r.lx}
                y={r.ly}
                textAnchor={r.labelAnchor}
                dominantBaseline="middle"
                className={measured ? 'fill-ink' : 'fill-muted'}
                style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em' }}
              >
                {tdom(r.domain).toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Sinaps faolligi — halol metafora (jami raundlar) */}
      <div className="flex flex-col items-center gap-1">
        <span className="num text-5xl font-semibold tabular-nums text-ink">
          {display}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {tb('synapses')}
        </span>
      </div>

      <p className="max-w-[22rem] text-center text-[12px] leading-relaxed text-muted">
        {tb('honest')}
      </p>
    </div>
  );
}
