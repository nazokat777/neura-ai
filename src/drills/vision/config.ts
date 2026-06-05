// Ko'z mashqlari — boshqariladigan (guided) WELLNESS sessiyalari.
//
// MUHIM (halol-data): bular KOGNITIV mashq EMAS, ball yoki daraja bermaydi.
// Maqsad — raqamli ko'z charchog'ini kamaytirish (AAO tavsiyasi). Shuning uchun
// adaptiv dvigatel (useDrill) ishlatilmaydi; faqat boshqariladigan animatsiya.

export type VisionMode = 'shift' | 'rest' | 'trace';

export interface VisionConfig {
  id: string;
  mode: VisionMode;
  /** sessiya davomiyligi (ms) */
  durationMs: number;
  /** 'shift' uchun yarim sikl (yaqin/uzoq almashinuvi) ms */
  halfMs?: number;
  /** 'trace' uchun bitta aylanish (sakkiz) ms */
  lapMs?: number;
}

export const VISION_CONFIGS: Record<string, VisionConfig> = {
  focusShift: { id: 'focusShift', mode: 'shift', durationMs: 42000, halfMs: 3500 },
  rule202020: { id: 'rule202020', mode: 'rest', durationMs: 20000 },
  figureEight: { id: 'figureEight', mode: 'trace', durationMs: 30000, lapMs: 6000 },
};
