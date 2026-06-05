// "Miya olimi tahlili" — foydalanuvchi natijalarini (baseline o'lchovi) va
// anketa javoblarini (concerns + goal, ko'p tanlovli) birlashtirib, shaxsiy
// mashq rejasini tuzadi. HALOL: tibbiy tashxis emas — o'lchov + o'z-bahosiga
// asoslangan moslashtirish. Manba: standart kognitiv neyrofan (Kandel,
// Gazzaniga; Diamond 2013 — ijro funksiyalari).

import { loadLast, type Onboarding } from '@/lib/storage';
import { CATEGORY_PRIMARY_DRILL } from '@/lib/keyAreas';

// Tahlilга kiradigan bo'limlar (baseline o'lchanadigan 5 + wellness vision).
export const PLAN_CATEGORIES = [
  'memory',
  'attention',
  'logic',
  'speed',
  'focus',
  'vision',
] as const;

export type PlanCategory = (typeof PLAN_CATEGORIES)[number];

// Anketa "concerns" → kognitiv bo'lim(lar).
const CONCERN_MAP: Record<string, PlanCategory[]> = {
  memory: ['memory'],
  focus: ['attention', 'focus'], // diqqat tarqoqligi → diqqat + tormozlanish
  speed: ['speed'],
  fatigue: ['attention', 'vision'],
  stress: ['focus', 'vision'],
};

// Anketa "goal" → kognitiv bo'lim(lar).
const GOAL_MAP: Record<string, PlanCategory[]> = {
  focus: ['attention', 'focus'],
  memory: ['memory'],
  speed: ['speed'],
  habit: [], // umumiy — muayyan bo'limga bog'lanmaydi
  curiosity: ['logic'],
};

export interface PlanItem {
  category: PlanCategory;
  /** Baseline o'lchovi (0–100) yoki null (o'lchanmagan). */
  measured: number | null;
  score: number; // ichki saralash uchun
  reasons: { weak: boolean; concern: boolean; goal: boolean };
}

export interface Analysis {
  items: PlanItem[];
  /** Hech qanday signal yo'q (anketa ham, test ham) — bo'sh holat. */
  empty: boolean;
}

const W_WEAK = 1.2; // o'lchangan zaiflik vazni
const W_CONCERN = 0.6;
const W_GOAL = 0.4;
const WEAK_THRESHOLD = 75; // shundan past o'lchov "zaifroq" deб belgilanadi

export function buildAnalysis(o: Onboarding | null): Analysis {
  const concerns = o?.concerns ?? [];
  const goals = o?.goal ?? [];

  const acc: Record<string, PlanItem> = {};
  for (const cat of PLAN_CATEGORIES) {
    const drill = CATEGORY_PRIMARY_DRILL[cat];
    const last = drill ? loadLast(drill) : null;
    // performance 0..1 → 0..100 ko'rsatkichga aylantiramiz.
    const measured = last ? Math.round(last.performance * 100) : null;
    acc[cat] = {
      category: cat,
      measured,
      score: 0,
      reasons: { weak: false, concern: false, goal: false },
    };
  }

  // 1) O'lchangan zaiflik (test natijasi) — past ball → yuqori ustuvorlik.
  for (const cat of PLAN_CATEGORIES) {
    const it = acc[cat];
    if (it.measured != null) {
      it.score += ((100 - it.measured) / 100) * W_WEAK;
      if (it.measured < WEAK_THRESHOLD) it.reasons.weak = true;
    }
  }

  // 2) Anketa: concerns
  for (const c of concerns) {
    for (const cat of CONCERN_MAP[c] ?? []) {
      if (!acc[cat]) continue;
      acc[cat].score += W_CONCERN;
      acc[cat].reasons.concern = true;
    }
  }

  // 3) Anketa: goal
  for (const g of goals) {
    for (const cat of GOAL_MAP[g] ?? []) {
      if (!acc[cat]) continue;
      acc[cat].score += W_GOAL;
      acc[cat].reasons.goal = true;
    }
  }

  const items = Object.values(acc)
    .filter((it) => it.score > 0)
    .sort((a, b) => b.score - a.score);

  return { items, empty: items.length === 0 };
}
