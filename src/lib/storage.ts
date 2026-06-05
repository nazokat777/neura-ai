// Lokal saqlash (CLAUDE.md §4.2). MVP: localStorage.
// Capacitor Preferences'ga keyin oson ko'chiriladi (bir xil interfeys).
import type { AdaptiveState } from '@/drills/engine/types';
import { initialState } from '@/drills/engine/AdaptiveController';

const isClient = typeof window !== 'undefined';

function read<T>(key: string, fallback: T): T {
  if (!isClient) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isClient) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* kvota/private rejim — jim o'tamiz */
  }
}

export function loadDifficulty(drillId: string): AdaptiveState {
  return read(`difficulty:${drillId}`, initialState(1));
}

export function saveDifficulty(drillId: string, state: AdaptiveState): void {
  write(`difficulty:${drillId}`, state);
}

export function loadBest(drillId: string): number | null {
  return read<number | null>(`best:${drillId}`, null);
}

export function saveBest(drillId: string, value: number): void {
  const cur = loadBest(drillId);
  if (cur === null || value > cur) write(`best:${drillId}`, value);
}

/** Oxirgi mashq natijasi — halol-data: faqat real o'lchangan qiymat. */
export interface LastResult {
  /** 0..1 — oxirgi raund performance qiymati */
  performance: number;
  /** O'sha paytdagi daraja (D) */
  level: number;
  /** Unix ms — qachon o'lchangani */
  at: number;
}

/** Domen profili shu qiymatdan hisoblanadi (kognitiv profil ekrani). */
export function loadLast(drillId: string): LastResult | null {
  return read<LastResult | null>(`last:${drillId}`, null);
}

export function saveLast(drillId: string, value: LastResult): void {
  write(`last:${drillId}`, value);
}

// "Sinaps faolligi" — har tugatilgan raund bitta uchqun. Halol metafora:
// bu real o'ynalgan raundlar soni, biologik da'vo emas.
export function incSynapses(drillId: string): number {
  const total = read<number>('synapses:total', 0) + 1;
  write('synapses:total', total);
  write(`synapses:${drillId}`, read<number>(`synapses:${drillId}`, 0) + 1);
  return total;
}

export function loadSynapses(): number {
  return read<number>('synapses:total', 0);
}

export function loadSynapsesByDrill(drillId: string): number {
  return read<number>(`synapses:${drillId}`, 0);
}

// Onboarding anketa javoblari — neyro-tavsiyalar uchun (halol: shaxsiy
// moslashtirish, tibbiy tashxis emas).
export interface Onboarding {
  age?: string;
  work?: string;
  stress?: string;
  sleep?: string;
  nutrition?: string;
  concerns?: string[];
  goal?: string[];
}

export function loadOnboarding(): Onboarding | null {
  return read<Onboarding | null>('onboarding', null);
}

export function saveOnboarding(value: Onboarding): void {
  write('onboarding', value);
}

export function isOnboarded(): boolean {
  return loadOnboarding() != null;
}

// Foydalanuvchi ismi (ro'yhatdan o'tishда kiritiladi) — faqat salomlash uchun.
export function loadName(): string {
  return read<string>('userName', '');
}

export function saveName(value: string): void {
  write('userName', value.trim());
}

// Baseline ("A nuqtasi") tugaganini belgilash.
export function isBaselineDone(): boolean {
  return read<boolean>('baseline:done', false);
}

export function setBaselineDone(): void {
  write('baseline:done', true);
}

// ---- Natija tarixi (real o'sishni ko'rsatish — halol-data) ----
// Har tugatilgan raund: {at, performance, level}. Faqat real o'lchov.
export interface HistoryPoint {
  at: number;
  performance: number;
  level: number;
}

const HISTORY_MAX = 60; // oxirgi 60 raund yetarli (sparkline + delta)

export function pushHistory(drillId: string, p: HistoryPoint): void {
  const arr = read<HistoryPoint[]>(`history:${drillId}`, []);
  arr.push(p);
  if (arr.length > HISTORY_MAX) arr.splice(0, arr.length - HISTORY_MAX);
  write(`history:${drillId}`, arr);
}

export function loadHistory(drillId: string): HistoryPoint[] {
  return read<HistoryPoint[]>(`history:${drillId}`, []);
}

// ---- Streak (kunlik ketma-ketlik) ----
// Har kuni kamida bitta raund → streak +1. Bir kun o'tkazib yuborilsa — 0 dan.
// HALOL: faqat real faollik kuni hisoblanadi.
export interface Streak {
  current: number;
  longest: number;
  /** oxirgi faol kun — YYYY-MM-DD (lokal) */
  lastDay: string;
}

function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

// ---- Akkauntni o'chirish (lokal) ----
// Hamma lokal ma'lumotni o'chiradi: profil, tarix, anketa, ism, streak.
// HALOL: hech qanday server yo'q — bu qurilmadagi barcha izni butunlay tozalaydi.
export function clearAll(): void {
  if (!isClient) return;
  try {
    window.localStorage.clear();
  } catch {
    /* private rejim — jim o'tamiz */
  }
}

export function loadStreak(): Streak {
  return read<Streak>('streak', { current: 0, longest: 0, lastDay: '' });
}

/** Bugungi faollikni qayd etadi va streak'ni yangilaydi. */
export function recordActivity(): Streak {
  const today = dayKey();
  const s = loadStreak();
  if (s.lastDay === today) return s; // bugun allaqachon hisoblangan
  let current = 1;
  if (s.lastDay) {
    const gap = daysBetween(s.lastDay, today);
    if (gap === 1) current = s.current + 1; // ketma-ket kun
    // gap > 1 → uzilgan, 1 dan boshlanadi
  }
  const next: Streak = {
    current,
    longest: Math.max(s.longest, current),
    lastDay: today,
  };
  write('streak', next);
  return next;
}
