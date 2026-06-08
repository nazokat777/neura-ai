'use client';

// O'yin "faol"mi yo'qmi — global signal. DrillGate o'yin boshlanganda
// faollashtiradi, sahifa tark etilganda o'chiradi. DrillHeader'dagi
// "← Orqaga" tugmasi shu signalga qarab chiqishdan oldin tasdiq so'raydi
// (faol mashq o'rtasida tasodifan chiqib, joriy raundni yo'qotmaslik uchun).
import { useSyncExternalStore } from 'react';

let active = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setDrillActive(value: boolean): void {
  if (active === value) return;
  active = value;
  emit();
}

export function useDrillActive(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => active,
    () => false,
  );
}
