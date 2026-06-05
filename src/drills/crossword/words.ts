// Krossvord (anagram) — ta'rifга qarab so'zni harflardan tuzish.
// Mantiq + til + ishchi xotira. Har til uchun alohida so'z bazasi.

export interface WordEntry {
  word: string; // BOSH HARFLARDA
  clue: string;
}

export const WORD_BANK: Record<string, WordEntry[]> = {
  uz: [
    { word: 'MIYA', clue: 'Fikrlash a’zosi' },
    { word: 'XOTIRA', clue: 'Eslab qolish qobiliyati' },
    { word: 'DIQQAT', clue: 'E’tibor, jamlanish' },
    { word: 'KITOB', clue: 'O‘qish uchun' },
    { word: 'QUYOSH', clue: 'Kunduzgi yulduz' },
    { word: 'DARYO', clue: 'Katta oqar suv' },
    { word: 'BAHOR', clue: 'Gullaydigan fasl' },
    { word: 'SHAMOL', clue: 'Esadigan havo' },
    { word: 'MAKTAB', clue: 'O‘qish joyi' },
    { word: 'YULDUZ', clue: 'Tunda porlaydi' },
  ],
  ru: [
    { word: 'МОЗГ', clue: 'Орган мышления' },
    { word: 'ПАМЯТЬ', clue: 'Способность запоминать' },
    { word: 'ФОКУС', clue: 'Сосредоточенность' },
    { word: 'КНИГА', clue: 'Её читают' },
    { word: 'СОЛНЦЕ', clue: 'Дневная звезда' },
    { word: 'РЕКА', clue: 'Текущая вода' },
    { word: 'ВЕСНА', clue: 'Время цветения' },
    { word: 'ВЕТЕР', clue: 'Движение воздуха' },
    { word: 'ШКОЛА', clue: 'Место учёбы' },
    { word: 'ЗВЕЗДА', clue: 'Светит ночью' },
  ],
  en: [
    { word: 'BRAIN', clue: 'Organ of thought' },
    { word: 'MEMORY', clue: 'Ability to recall' },
    { word: 'FOCUS', clue: 'Concentration' },
    { word: 'BOOK', clue: 'You read it' },
    { word: 'SUN', clue: 'Daytime star' },
    { word: 'RIVER', clue: 'Flowing water' },
    { word: 'SPRING', clue: 'Blooming season' },
    { word: 'WIND', clue: 'Moving air' },
    { word: 'SCHOOL', clue: 'Place to study' },
    { word: 'STAR', clue: 'Shines at night' },
  ],
};

export function bankFor(locale: string): WordEntry[] {
  return WORD_BANK[locale] ?? WORD_BANK.en;
}
