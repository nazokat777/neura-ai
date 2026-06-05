// Ismlar va Yuzlar — assotsiativ xotira (eng hayotiy xotira mashqi).

export interface NamesParams {
  /** yodlanadigan yuz-ism juftlari */
  count: number;
  /** yodlash vaqti (ms) */
  memMs: number;
}

export function paramsForLevel(D: number): NamesParams {
  const d = Math.max(1, Math.floor(D));
  const count = Math.min(6, 2 + Math.floor(d / 2));
  const memMs = count * 1500;
  return { count, memMs };
}

// Ism havzasi (atoqli otlar — tarjima qilinmaydi).
export const NAME_POOL = [
  'Aziz', 'Laylo', 'Dilnoza', 'Bekzod', 'Madina', 'Jasur',
  'Kamola', 'Sardor', 'Nilufar', 'Otabek', 'Zarina', 'Akmal',
  'Sevara', 'Rustam', 'Gulnora', 'Timur',
];

// Har ism jinsi — yuz (foto) jinsi ismga MOS bo'lsin
// (o'g'il/qiz farqlanmasligi shikoyati tuzatildi).
export const NAME_GENDER: Record<string, 'men' | 'women'> = {
  Aziz: 'men', Laylo: 'women', Dilnoza: 'women', Bekzod: 'men',
  Madina: 'women', Jasur: 'men', Kamola: 'women', Sardor: 'men',
  Nilufar: 'women', Otabek: 'men', Zarina: 'women', Akmal: 'men',
  Sevara: 'women', Rustam: 'men', Gulnora: 'women', Timur: 'men',
};
