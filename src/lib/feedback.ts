// Ovoz + haptic (tebranish) feedback — o'yin "feel"ини sezilarli ko'taradi.
//
// - Web Audio API bilan sintez qilinadi (asset yo'q, nol yuk, past kechikish).
// - AudioContext faqat foydalanuvchi harakatidан keyin ishga tushadi
//   (brauzer autoplay siyosati) — birinchi register()да resume() qilinadi.
// - O'chirib qo'yish mumkin (localStorage 'sound:off'); jim rejimда jim.
// - Haptic: navigator.vibrate (asosан Android). iOS jim o'tadi — xato yo'q.

const isClient = typeof window !== 'undefined';

let ctx: AudioContext | null = null;
let muted: boolean | null = null;

function soundOff(): boolean {
  if (muted !== null) return muted;
  if (!isClient) return true;
  try {
    muted = window.localStorage.getItem('sound:off') === '1';
  } catch {
    muted = false;
  }
  return muted;
}

export function isSoundOn(): boolean {
  return !soundOff();
}

export function setSoundOn(on: boolean): void {
  muted = !on;
  if (!isClient) return;
  try {
    window.localStorage.setItem('sound:off', on ? '0' : '1');
  } catch {
    /* private rejim — jim o'tamiz */
  }
}

// Foydalanuvchi harakati ICHIDA chaqirilishi shart (brauzer autoplay siyosati):
// AudioContext'ni yaratadi/uyg'otadi va jim nota bilan "ochadi". Shundан keyin
// setTimeout ichidан chiqarilgan ovozlar ham eshitiladi (Audio-Xotira ketma-ketligi).
export function unlockAudio(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, c.currentTime);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.02);
  } catch {
    /* ignore */
  }
}

function getCtx(): AudioContext | null {
  if (!isClient || soundOff()) return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Bitta nota — yengil sintez (sine/triangle + tez so'nish).
function tone(
  freq: number,
  startOffset: number,
  dur: number,
  gain = 0.12,
  type: OscillatorType = 'sine',
): void {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + startOffset;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  // tez attack, silliq release — "click" bo'lmasligi uchun
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function vibrate(pattern: number | number[]): void {
  if (!isClient || soundOff()) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* qo'llab-quvvatlanmasa — jim */
  }
}

// ---- Voqea-ovozlari (semantik) ----

/** To'g'ri javob — yoqimli ko'tariluvchi blip. combo qancha baland — shuncha tetik. */
export function fxHit(combo = 0, great = false): void {
  const base = great ? 660 : 523; // E5 / C5
  const lift = Math.min(8, combo) * 14; // kombo bilan biroz ko'tariladi
  tone(base + lift, 0, 0.14, 0.22, 'triangle');
  if (great) tone(base * 1.5 + lift, 0.05, 0.14, 0.12, 'sine');
  vibrate(great ? 18 : 10);
}

/** Xato — past, qisqa "thud". */
export function fxMiss(): void {
  tone(150, 0, 0.18, 0.28, 'sawtooth');
  vibrate([12, 30, 12]);
}

/** Kombo bosqichi oshdi — qisqa arpeggio (har 3 to'g'rida). */
export function fxComboUp(step: number): void {
  const root = 523 + Math.min(6, step) * 40;
  tone(root, 0, 0.1, 0.07, 'triangle');
  tone(root * 1.26, 0.07, 0.1, 0.07, 'triangle');
  tone(root * 1.5, 0.14, 0.12, 0.07, 'triangle');
}

/** Daraja oshdi — mukofot akkordi (natija ekranida). */
export function fxLevelUp(): void {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.3, 0.08, 'sine'));
  vibrate([20, 40, 20, 40, 30]);
}

/** Raund tugadi — yumshoq tasdiq. */
export function fxFinish(): void {
  tone(440, 0, 0.18, 0.08, 'sine');
  tone(660, 0.1, 0.22, 0.07, 'sine');
}

/** Audio-Xotira (Simon) uchun panel notasi — BALAND va to'liq (yaxshi eshitilsin).
 *  Ikki qatlam (sine + triangle) boyitadi, gain yuqori. */
export function fxNote(freq: number, dur = 0.42): void {
  tone(freq, 0, dur, 0.5, 'triangle');
  tone(freq * 2, 0, dur * 0.6, 0.18, 'sine');
}
