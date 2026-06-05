NEYRON AI — MIYA (NEYRO) VIDEOLARI
==================================

"Miyaga sayohat" oqimi uchun cinematic videolar. Shu papkaga quyidagi nomlar
bilan tashlang — kod avtomatik topadi. Video yo'q bo'lsa cinematic gradient
ko'rinadi (xato bo'lmaydi).

IKKI FORMAT (kod ekran nisbatiga qarab avtomatik tanlaydi):
  - Telefon / vertikal → 9:16, fayl nomi:  <nom>.mp4
  - Desktop / web / keng → 16:9, fayl nomi: <nom>-wide.mp4
  Bittasi bo'lsa ham ishlaydi; ikkalasi yo'q bo'lsa gradient ko'rinadi.

ASOSIY (hoziroq ishlatiladi):
  discover.mp4   + discover-wide.mp4   → "O'zingizni taniysizmi?" kirish ekrani
                   (neyro-chiziqli odam / aylanuvchi miya, tuzilish ko'rsatilsin)

MINTAQA VIDEOLARI (ixtiyoriy — har bo'lim qaysi miya qismini ishga solishi):
  hippocampus(-wide).mp4      → Xotira (gippokamp)
  frontoparietal(-wide).mp4   → Diqqat (fronto-parietal)
  prefrontal(-wide).mp4       → Mantiq (prefrontal korteks)
  sensorimotor(-wide).mp4     → Tezlik (sensomotor)
  acc(-wide).mp4              → Tormozlanish (oldingi cingulat)
  motorCerebellum(-wide).mp4  → Motor (motor korteks + serebellum)
  occipital(-wide).mp4        → Ko'z (oksipital)

TEXNIK TAVSIYA:
  - Format: MP4 (H.264) — mobil/web/Telegram/desktop hammasida ishlaydi
  - Nisbat: 9:16 (telefon) VA 16:9 (keng ekran) — ikki variant
  - Davomiylik: 6-12s, SEAMLESS LOOP
  - Tovushsiz (jim ijro), 1-4 MB
  - Qorong'i ohang (#06080F), teal urg'u (#34E5D0), miya/neyron mavzusi
  - Matn ustida o'qiladigan bo'lsin (juda yorqin emas)

ISHLASH:
  - components/cinematic/SectionVideo.tsx — video loop/muted/autoplay + gradient zaxira
  - lib/brainRegions.ts → brainVideoSrc(region)     = /cinematic/brain/<region>.mp4 (9:16)
                          brainVideoSrcWide(region) = /cinematic/brain/<region>-wide.mp4 (16:9)
  - Discover ekrani: /cinematic/brain/discover.mp4
