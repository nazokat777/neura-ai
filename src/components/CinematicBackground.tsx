'use client';

import { useEffect, useRef } from 'react';
import { detectCapability } from '@/lib/deviceDetector';

// Cinematic fon — sof canvas neyron-zarra maydoni + teal aurora.
// Matnga tegmaydi (faqat orqa fon). Asset kerak emas.
// Performance: device-detector + reduced-motion bilan yengillashadi,
// tab yashirilganda to'xtaydi.

const ACCENT = '77, 141, 255'; // #4D8DFF rgb
const PULSE = '176, 108, 255'; // #B06CFF — "neyron o'qi" rangi

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Tugunlar orasида yuguruvchi signal (miya "ishlayotgandek" effekt).
interface Pulse {
  i: number;
  j: number;
  t: number;
  speed: number;
}

export default function CinematicBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    // Non-null aliaslar (closure ichida TS narrowing saqlanishi uchun)
    const cv = canvas;
    const ctx = context;

    const cap = detectCapability();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    const maxPulses = cap.lowPower ? 3 : 7;

    function seedPulse() {
      for (let tries = 0; tries < 12; tries++) {
        const i = Math.floor(Math.random() * nodes.length);
        const j = Math.floor(Math.random() * nodes.length);
        if (i === j) continue;
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < linkDist * 1.5) {
          pulses.push({ i, j, t: 0, speed: 0.006 + Math.random() * 0.012 });
          return;
        }
      }
    }

    // Zarra zichligi qurilmaga moslashadi (halol performance).
    const density = cap.lowPower ? 0.000035 : 0.00007;
    const maxNodes = cap.lowPower ? 28 : 64;
    const linkDist = cap.lowPower ? 110 : 140;

    function build() {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(maxNodes, Math.floor(w * h * density));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
      }));
      pulses = [];
    }

    function drawAurora() {
      // Tepada sekin so'nuvchi teal nur — chuqurlik hissi.
      const g = ctx.createRadialGradient(w * 0.5, -h * 0.05, 0, w * 0.5, -h * 0.05, h * 0.85);
      g.addColorStop(0, `rgba(${ACCENT}, 0.26)`);
      g.addColorStop(0.5, `rgba(${ACCENT}, 0.06)`);
      g.addColorStop(1, 'rgba(6, 8, 15, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      drawAurora();

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // Yaqin tugunlarni ulovchi nozik chiziqlar (neyron tarmoq).
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const a = (1 - d / linkDist) * 0.38;
            ctx.strokeStyle = `rgba(${ACCENT}, ${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Tugun nuqtalari.
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${ACCENT}, 0.75)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // "Neyron o'qlari" — tugunlar orasида yuguruvchi yorqin signallar.
      while (pulses.length < maxPulses) seedPulse();
      for (const p of pulses) {
        p.t += p.speed;
        const a = nodes[p.i];
        const b = nodes[p.j];
        if (!a || !b) {
          p.t = 1;
          continue;
        }
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const r = 6;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, `rgba(${PULSE}, 0.95)`);
        glow.addColorStop(0.5, `rgba(${PULSE}, 0.35)`);
        glow.addColorStop(1, `rgba(${PULSE}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      pulses = pulses.filter((p) => p.t < 1);
    }

    // Reduced-motion / juda zaif qurilma → bitta statik kadr, animatsiya yo'q.
    const staticOnly = cap.reducedMotion;
    let raf = 0;
    let running = true;

    function loop() {
      if (!running) return;
      frame();
      raf = requestAnimationFrame(loop);
    }

    function onResize() {
      build();
      if (staticOnly) frame();
    }

    build();
    if (staticOnly) {
      frame();
    } else {
      loop();
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!staticOnly && !running) {
        running = true;
        loop();
      }
    }

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 h-full w-full"
    />
  );
}
