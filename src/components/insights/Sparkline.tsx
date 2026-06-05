'use client';

// Kichik SVG sparkline — real natija tarixini ko'rsatadi (halol-data).
// Ma'lumot 2 tadan kam bo'lsa — chizilmaydi.
export default function Sparkline({
  values,
  width = 72,
  height = 24,
  color = '#4D8DFF',
}: {
  values: number[]; // 0..1 oralig'idagi performance qiymatlari
  width?: number;
  height?: number;
  color?: string;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return [x, y] as const;
  });

  const d = pts
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const area = `${d} L${pts[pts.length - 1][0].toFixed(1)},${height - pad} L${pts[0][0].toFixed(1)},${height - pad} Z`;
  const [lx, ly] = pts[pts.length - 1];

  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      <path d={area} fill={color} opacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2.2} fill={color} />
    </svg>
  );
}
