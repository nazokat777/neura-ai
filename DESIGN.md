# Design

> Vizual yo'nalish: **Linear-style terminal-native** — zich, qat'iy grid,
> muhandislik aniqligi, nozik teal urg'u. To'q premium, kam stimul.
> Register: brand (cinematic kirish bundan mustasno: katta tipografiya momenti).

## Color

Strategiya: **Restrained** — tinted neutrallar + bitta teal urg'u (≤10% sirt).
Neytrallar brend hue (teal ~185°) tomon nozik tintlangan; `#000`/`#fff` ishlatilmaydi.

| Rol | Hex | OKLCH (taxminiy) | Foydalanish |
|---|---|---|---|
| bg | `#06080F` | oklch(0.12 0.015 260) | Asosiy fon |
| surface | `#0C1018` | oklch(0.17 0.015 260) | Karta/panel |
| surface2 | `#141A26` | oklch(0.22 0.018 260) | Katak/tugma yuzasi |
| line | `#1E2633` | oklch(0.28 0.018 260) | Chegara/ajratgich |
| ink | `#ECEFF7` | oklch(0.94 0.008 260) | Asosiy matn |
| muted | `#8A93A6` | oklch(0.65 0.02 260) | Ikkilamchi matn |
| accent | `#34E5D0` | oklch(0.83 0.13 185) | Bitta urg'u (teal) |
| accent-dim | `#1E8C82` | oklch(0.56 0.09 185) | Bosilgan/passiv teal |

Stroop palitrasi (rang-korlik xavfsiz: rang + so'z/shakl dublikati):
red `#FF6B6B`, blue `#7C9CFF`, green `#4ADE80`, yellow `#F4D35E`,
purple `#B794F6`, orange `#F4A340`, pink `#F472B6`, cyan `#34E5D0`.

## Typography

- **Display:** Fraunces (serif, italic urg'u). Sarlavhalar, natija "Tayyor!" momentlari.
  line-height 0.95, letter-spacing -0.04em.
- **Body / UI:** Hanken Grotesk. Toza grotesk, 400/500/600.
- Inter/Roboto/Arial ishlatilmaydi.
- Hierarchy: scale + weight (≥1.25 nisbat). `t-h1` clamp(2.4rem, 9vw, 3.4rem).
- **Barcha raqam/ball:** `font-variant-numeric: tabular-nums` (`.num` klassi).
- Body satr uzunligi ≤65–75ch.

## Elevation & Surface

Tekis, "terminal" his — soyalar o'rniga surface darajalari (bg → surface → surface2)
va 1px `line` chegaralar. Glassmorphism yo'q. Radius: katak/tugma `rounded-xl`,
panel `rounded-2xl/3xl`, urg'u tugma `rounded-full`.

## Layout

- Mobil-birinchi: `max-w-md` markazlashtirilgan ustun, safe-area paddinglari.
- Mashq grid'lari: `repeat(n, minmax(0,1fr))`, `gap-2`, kvadrat kataklar.
- Ritm uchun bo'sh joyni o'zgartir — bir xil padding monotonlikdan qoch.
- Kartalar faqat zarur bo'lganda; ichma-ich karta yo'q.

## Motion

- Faqat opacity/transform; layout xususiyatlari animatsiya qilinmaydi.
- ease-out (quart/expo); bounce/elastic yo'q.
- Tugmalarda `active:scale-95` mikro-feedback.
- Reduced-motion: barcha animatsiya ~0ms (globals.css'da).

## Components

- **Tugma (primary):** `bg-accent text-bg rounded-full px-10 py-3`, bosishda scale.
- **Mashq katagi:** kvadrat, `bg-surface2`, holatga qarab accent/qizil.
- **ResultPanel:** display sarlavha + tabular stat'lar + flow-zone yo'nalishi (↑/↓/=).
- **LocaleSwitcher:** segmented pill, faol til accent fonда.
