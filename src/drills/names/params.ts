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

export interface PoolName {
  name: string;
  gender: 'men' | 'women';
}

// Ism havzasi HAR TIL uchun alohida — ingliz/rus tilida o'zbek ismlari
// chiqmasligi uchun (foydalanuvchi til-mosligi shikoyati). Yuz (foto) jinsi
// ismga mos bo'lsin (men/women).
export const NAME_POOLS: Record<string, PoolName[]> = {
  uz: [
    { name: 'Aziz', gender: 'men' }, { name: 'Laylo', gender: 'women' },
    { name: 'Dilnoza', gender: 'women' }, { name: 'Bekzod', gender: 'men' },
    { name: 'Madina', gender: 'women' }, { name: 'Jasur', gender: 'men' },
    { name: 'Kamola', gender: 'women' }, { name: 'Sardor', gender: 'men' },
    { name: 'Nilufar', gender: 'women' }, { name: 'Otabek', gender: 'men' },
    { name: 'Zarina', gender: 'women' }, { name: 'Akmal', gender: 'men' },
    { name: 'Sevara', gender: 'women' }, { name: 'Rustam', gender: 'men' },
    { name: 'Gulnora', gender: 'women' }, { name: 'Timur', gender: 'men' },
  ],
  en: [
    { name: 'James', gender: 'men' }, { name: 'Emma', gender: 'women' },
    { name: 'Oliver', gender: 'men' }, { name: 'Sophia', gender: 'women' },
    { name: 'William', gender: 'men' }, { name: 'Olivia', gender: 'women' },
    { name: 'Henry', gender: 'men' }, { name: 'Mia', gender: 'women' },
    { name: 'Lucas', gender: 'men' }, { name: 'Ava', gender: 'women' },
    { name: 'Noah', gender: 'men' }, { name: 'Isabella', gender: 'women' },
    { name: 'Jack', gender: 'men' }, { name: 'Grace', gender: 'women' },
    { name: 'Leo', gender: 'men' }, { name: 'Chloe', gender: 'women' },
  ],
  ru: [
    { name: 'Иван', gender: 'men' }, { name: 'Анна', gender: 'women' },
    { name: 'Дмитрий', gender: 'men' }, { name: 'Мария', gender: 'women' },
    { name: 'Сергей', gender: 'men' }, { name: 'Елена', gender: 'women' },
    { name: 'Алексей', gender: 'men' }, { name: 'Ольга', gender: 'women' },
    { name: 'Андрей', gender: 'men' }, { name: 'Наталья', gender: 'women' },
    { name: 'Максим', gender: 'men' }, { name: 'Татьяна', gender: 'women' },
    { name: 'Павел', gender: 'men' }, { name: 'Ирина', gender: 'women' },
    { name: 'Никита', gender: 'men' }, { name: 'Юлия', gender: 'women' },
  ],
};

export function namePool(locale: string): PoolName[] {
  return NAME_POOLS[locale] ?? NAME_POOLS.en;
}
