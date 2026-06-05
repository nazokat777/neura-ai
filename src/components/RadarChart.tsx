'use client';

// Sof SVG radar grafik — kutubxonasiz, halol-data.
// O'lchanmagan domen (value === null) markazda turadi va alohida
// (uzuq, ichi bo'sh) ko'rsatiladi: soxta "0 ball" emas, "hali yo'q".

export interface RadarAxis {
  /** Domen kaliti (react key) */
  key: string;
  /** Ko'rinadigan nom */
  label: string;
  /** 0..1 — real o'lchangan natija, yoki null (o'lchanmagan) */
  value: number | null;
}

const SIZE = 260;
const C = SIZE / 2;
const R = 92; // maksimal radius
const RINGS = [0.25, 0.5, 0.75, 1]; // grid halqalari
const LABEL_R = R + 22; // nom radiusi
// Yon teglar viewBox'dan chiqib ketmasligi uchun gorizontal/vertikal bo'sh joy.
const PAD_X = 48;
const PAD_TOP = 8;
const PAD_BOTTOM = 28;

/** i-axis burchagi (radian), tepadan boshlanadi, soat yo'nalishi. */
function angle(i: number, n: number): number {
  return -Math.PI / 2 + (i * 2 * Math.PI) / n;
}

function point(i: number, n: number, radius: number): [number, number] {
  const a = angle(i, n);
  return [C + radius * Math.cos(a), C + radius * Math.sin(a)];
}

export default function RadarChart({ axes }: { axes: RadarAxis[] }) {
  const n = axes.length;
  if (n < 3) return null;

  // Polygon — o'lchanmagan vertekslar markazda (0).
  const polygon = axes
    .map((ax, i) => {
      const v = ax.value == null ? 0 : Math.max(0, Math.min(1, ax.value));
      return point(i, n, v * R).join(',');
    })
    .join(' ');

  const hasAnyData = axes.some((ax) => ax.value != null);

  return (
    <svg
      viewBox={`${-PAD_X} ${-PAD_TOP} ${SIZE + PAD_X * 2} ${SIZE + PAD_TOP + PAD_BOTTOM}`}
      className="w-full max-w-[320px]"
      role="img"
      aria-label="Kognitiv profil radar grafigi"
    >
      {/* Grid halqalari */}
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={axes
            .map((_, i) => point(i, n, ring * R).join(','))
            .join(' ')}
          fill="none"
          stroke="#1E2633"
          strokeWidth={1}
        />
      ))}

      {/* O'qlar (spoke) */}
      {axes.map((ax, i) => {
        const [x, y] = point(i, n, R);
        const measured = ax.value != null;
        return (
          <line
            key={`spoke-${ax.key}`}
            x1={C}
            y1={C}
            x2={x}
            y2={y}
            stroke="#1E2633"
            strokeWidth={1}
            strokeDasharray={measured ? undefined : '2 4'}
          />
        );
      })}

      {/* Natija ko'pburchagi (faqat ma'lumot bo'lsa) */}
      {hasAnyData && (
        <polygon
          points={polygon}
          fill="rgba(77,141,255,0.14)"
          stroke="#4D8DFF"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      )}

      {/* Vertekslar va nomlar */}
      {axes.map((ax, i) => {
        const measured = ax.value != null;
        const v = measured ? Math.max(0, Math.min(1, ax.value as number)) : 0;
        const [px, py] = point(i, n, v * R);
        const [lx, ly] = point(i, n, LABEL_R);
        const anchor =
          Math.abs(lx - C) < 8 ? 'middle' : lx > C ? 'start' : 'end';
        return (
          <g key={`node-${ax.key}`}>
            {measured ? (
              <circle cx={px} cy={py} r={3.5} fill="#4D8DFF" />
            ) : (
              <circle
                cx={C}
                cy={C}
                r={3}
                fill="#06080F"
                stroke="#8A93A6"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            )}
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-muted"
              style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em' }}
            >
              {ax.label.toUpperCase()}
            </text>
            <text
              x={lx}
              y={ly + 12}
              textAnchor={anchor}
              dominantBaseline="middle"
              className={measured ? 'fill-ink' : 'fill-muted/60'}
              style={{
                fontSize: 11,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {measured ? `${Math.round(v * 100)}` : '—'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
