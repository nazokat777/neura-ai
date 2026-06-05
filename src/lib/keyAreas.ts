// "Key Areas" — har kognitiv bo'lim qaysi miya mintaqalarini ishga soladi
// (reference dizayni uslubida). HALOL: soddalashtirilgan ta'limiy ma'lumot,
// tibbiy tasvir emas; manba — standart neyroanatomiya (Kandel; Gazzaniga).
//
// 3 tilда (uz/ru/en) — CategoryView locale'ga qarab tanlaydi.
// Har mintaqa: { region } nomi + { fn } funksiyasi.

export type Loc = 'uz' | 'ru' | 'en';

export interface KeyArea {
  region: Record<Loc, string>;
  fn: Record<Loc, string>;
}

export const KEY_AREAS: Record<string, KeyArea[]> = {
  memory: [
    {
      region: { uz: 'Gippokamp', ru: 'Гиппокамп', en: 'Hippocampus' },
      fn: { uz: 'Xotira shakllanishi', ru: 'Формирование памяти', en: 'Memory formation' },
    },
    {
      region: { uz: 'Chakka bo‘lagi', ru: 'Височная доля', en: 'Temporal lobe' },
      fn: { uz: 'Ma‘lumotni qayta ishlash', ru: 'Обработка информации', en: 'Information processing' },
    },
    {
      region: { uz: 'Entorinal korteks', ru: 'Энторинальная кора', en: 'Entorhinal cortex' },
      fn: { uz: 'Xotirani kodlash', ru: 'Кодирование памяти', en: 'Memory encoding' },
    },
    {
      region: { uz: 'Prefrontal korteks', ru: 'Префронтальная кора', en: 'Prefrontal cortex' },
      fn: { uz: 'Xotirani tiklash', ru: 'Извлечение памяти', en: 'Memory retrieval' },
    },
  ],
  attention: [
    {
      region: { uz: 'Prefrontal korteks', ru: 'Префронтальная кора', en: 'Prefrontal cortex' },
      fn: { uz: 'Diqqatni ushlab turish', ru: 'Удержание внимания', en: 'Sustained attention' },
    },
    {
      region: { uz: 'Oldingi cingulat', ru: 'Передняя поясная кора', en: 'Anterior cingulate' },
      fn: { uz: 'Xato aniqlash', ru: 'Обнаружение ошибок', en: 'Error detection' },
    },
    {
      region: { uz: 'Parietal korteks', ru: 'Теменная кора', en: 'Parietal cortex' },
      fn: { uz: 'Fazoviy diqqat', ru: 'Пространственное внимание', en: 'Spatial attention' },
    },
  ],
  logic: [
    {
      region: { uz: 'Prefrontal korteks', ru: 'Префронтальная кора', en: 'Prefrontal cortex' },
      fn: { uz: 'Fikrlash va reja', ru: 'Рассуждение и планирование', en: 'Reasoning & planning' },
    },
    {
      region: { uz: 'Parietal korteks', ru: 'Теменная кора', en: 'Parietal cortex' },
      fn: { uz: 'Mantiqiy ishlov', ru: 'Логическая обработка', en: 'Logical processing' },
    },
    {
      region: { uz: 'Dorsolateral PFK', ru: 'Дорсолатеральная ПФК', en: 'Dorsolateral PFC' },
      fn: { uz: 'Muammo yechish', ru: 'Решение задач', en: 'Problem solving' },
    },
  ],
  speed: [
    {
      region: { uz: 'Sensomotor korteks', ru: 'Сенсомоторная кора', en: 'Sensorimotor cortex' },
      fn: { uz: 'Reaksiya', ru: 'Реакция', en: 'Reaction' },
    },
    {
      region: { uz: 'Talamus', ru: 'Таламус', en: 'Thalamus' },
      fn: { uz: 'Signal uzatish', ru: 'Передача сигнала', en: 'Signal relay' },
    },
    {
      region: { uz: 'Serebellum', ru: 'Мозжечок', en: 'Cerebellum' },
      fn: { uz: 'Vaqt hisobi', ru: 'Тайминг', en: 'Timing' },
    },
  ],
  focus: [
    {
      region: { uz: 'Oldingi cingulat', ru: 'Передняя поясная кора', en: 'Anterior cingulate' },
      fn: { uz: 'Ziddiyat nazorati', ru: 'Контроль конфликта', en: 'Conflict monitoring' },
    },
    {
      region: { uz: 'Prefrontal korteks', ru: 'Префронтальная кора', en: 'Prefrontal cortex' },
      fn: { uz: 'Impulsni tiyish', ru: 'Контроль импульсов', en: 'Impulse control' },
    },
    {
      region: { uz: 'Bazal gangliya', ru: 'Базальные ганглии', en: 'Basal ganglia' },
      fn: { uz: 'Javobni tormozlash', ru: 'Торможение реакции', en: 'Response inhibition' },
    },
  ],
  motor: [
    {
      region: { uz: 'Motor korteks', ru: 'Моторная кора', en: 'Motor cortex' },
      fn: { uz: 'Harakatni bajarish', ru: 'Выполнение движения', en: 'Movement execution' },
    },
    {
      region: { uz: 'Serebellum', ru: 'Мозжечок', en: 'Cerebellum' },
      fn: { uz: 'Koordinatsiya', ru: 'Координация', en: 'Coordination' },
    },
    {
      region: { uz: 'Bazal gangliya', ru: 'Базальные ганглии', en: 'Basal ganglia' },
      fn: { uz: 'Harakat ketma-ketligi', ru: 'Последовательность движений', en: 'Movement sequencing' },
    },
  ],
  vision: [
    {
      region: { uz: 'Oksipital korteks', ru: 'Затылочная кора', en: 'Occipital cortex' },
      fn: { uz: 'Vizual ishlov', ru: 'Зрительная обработка', en: 'Visual processing' },
    },
    {
      region: { uz: 'Parietal korteks', ru: 'Теменная кора', en: 'Parietal cortex' },
      fn: { uz: 'Fazoviy ko‘rish', ru: 'Пространственное зрение', en: 'Spatial vision' },
    },
    {
      region: { uz: 'Okulomotor tizim', ru: 'Глазодвигательная система', en: 'Oculomotor system' },
      fn: { uz: 'Ko‘z harakati', ru: 'Движение глаз', en: 'Eye movement' },
    },
  ],
};

// Bo'lim → asosiy o'lchov mashqi (halol metrika uchun). vision = kognitiv ball
// yo'q (ko'z qulayligi), shuning uchun null.
export const CATEGORY_PRIMARY_DRILL: Record<string, string | null> = {
  memory: 'memory',
  attention: 'schulte',
  logic: 'math',
  speed: 'speed',
  focus: 'stroop',
  motor: 'eyeHand',
  vision: null,
};
