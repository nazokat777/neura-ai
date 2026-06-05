CINEMATIC SCROLL-SCRUB VIDEO (CLAUDE.md §7)

Veo/Flow'da yasagan videoni shu papkaga tashlang:

  intro.mp4    ← asosiy video (MAJBURIY nom)
  poster.jpg   ← birinchi kadr (ixtiyoriy, statik fallback)

Talablar:
- Format: MP4 (H.264)
- Nisbat: 9:16 vertikal (1080x1920)
- Davomiylik: 6-8s
- Harakat: SEKIN, uzluksiz (slow dolly/zoom) — scrub silliq bo'lsin
- Seamless: birinchi kadr = oxirgi kadr

Fayl tushishi bilan /[locale]/intro sahifasida scroll-scrub
avtomatik ishlaydi. Poster qo'shsangiz, IntroHero.tsx'da
POSTER = '/cinematic/poster.jpg' qilib yozing.
