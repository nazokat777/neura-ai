NEYRON AI — BO'LIM FONI VIDEOLARI
=================================

Har kognitiv bo'lim foniga cinematic video qo'yiladi. Faylni shu papkaga
quyidagi NOMLAR bilan tashlang — kod avtomatik topadi va ishlatadi.
Video yo'q bo'lsa, o'rniga cinematic gradient ko'rinadi (xato bo'lmaydi).

IKKI FORMAT (kod ekran nisbatiga qarab avtomatik tanlaydi):
  - Telefon / vertikal ekran → 9:16, fayl nomi:  <id>.mp4
  - Desktop / web / keng ekran → 16:9, fayl nomi: <id>-wide.mp4
  Faqat bittasini qo'ysangiz ham ishlaydi (yo'g'ining o'rniga bori ko'rsatiladi).
  Ikkalasi ham yo'q bo'lsa — cinematic gradient (xato bo'lmaydi).

KERAKLI FAYLLAR (har biri bitta bo'lim foni — 9:16 va 16:9):
  memory.mp4   + memory-wide.mp4      → Xotira bo'limi
  attention.mp4+ attention-wide.mp4   → Diqqat bo'limi
  logic.mp4    + logic-wide.mp4       → Mantiq bo'limi
  speed.mp4    + speed-wide.mp4       → Tezlik bo'limi
  focus.mp4    + focus-wide.mp4       → Fokus (Tormozlanish) bo'limi
  motor.mp4    + motor-wide.mp4       → Motor va Qo'l bo'limi
  vision.mp4   + vision-wide.mp4      → Ko'z mashqlari bo'limi

TEXNIK TAVSIYALAR (mobil-barqaror, cinematic):
  - Format: MP4 (H.264) — hamma joyda ishlaydi (iOS/Android/Telegram/web).
  - Nisbat: 9:16 (telefon) VA 16:9 (keng ekran) — ikki variant.
  - Davomiylik: 6-10 soniya, SEAMLESS LOOP (boshi va oxiri jilmaydi).
  - Tovush: KERAK EMAS (jim ijro etiladi — muted autoplay).
  - O'lcha: iloji boricha kichik (1-3 MB). Toza fon, qorong'i ohang
    (#06080F bilan uyg'un), bir teal urg'u (#34E5D0) — matn ustida o'qiladi.
  - Har bo'lim o'z mavzusida: masalan motor → qo'l/barmoq harakati,
    vision → ko'z/optik, memory → yorug' tugunlar, speed → tez chiziqlar.

ISHLASH MANTIG'I (kodda tayyor):
  - components/cinematic/SectionVideo.tsx — video loop+muted+autoplay,
    poster/gradient zaxira, reduced-motion va zaif qurilmada gradientga tushadi.
  - lib/catalog.ts → sectionVideoSrc(id)     = /cinematic/sections/<id>.mp4 (9:16)
                     sectionVideoSrcWide(id) = /cinematic/sections/<id>-wide.mp4 (16:9)
