// Device detector skeleti (CLAUDE.md §7) — zaif qurilmada og'ir
// cinematic scrub o'rniga statik kadr ko'rsatish uchun.
export interface DeviceCapability {
  reducedMotion: boolean;
  lowPower: boolean;
  cores: number;
  memoryGb: number | null;
}

export function detectCapability(): DeviceCapability {
  if (typeof window === 'undefined') {
    return { reducedMotion: false, lowPower: false, cores: 4, memoryGb: null };
  }
  const reducedMotion = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  // deviceMemory hamma brauzerda yo'q — ehtiyotkor.
  const memoryGb = (navigator as { deviceMemory?: number }).deviceMemory ?? null;
  const lowPower = cores <= 4 || (memoryGb !== null && memoryGb <= 4);
  return { reducedMotion: !!reducedMotion, lowPower, cores, memoryGb };
}

/** Cinematic scrub ko'rsatsa bo'ladimi? */
export function shouldUseCinematic(cap = detectCapability()): boolean {
  return !cap.reducedMotion && !cap.lowPower;
}
