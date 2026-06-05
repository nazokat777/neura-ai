# Neyron AI — barcha platformalarga chiqarish

Bitta kod bazasi (`next build` → statik `out/`) hamma joyda ishlaydi.

## 0. Build
```bash
npm run build      # statik fayllar -> out/
```

---

## 1. Veb / PWA (desktop + mobil brauzer + Telegram/Instagram/YouTube ichki brauzeri)
`out/` papkasini istalgan statik hostingга qo'ying:
- **Vercel:** `vercel deploy` (yoki GitHub'ga ulang)
- **Netlify / Cloudflare Pages:** `out/` ni publish papka qiling
- **Oddiy server:** `out/` ni nginx/apache orqali bering

PWA avtomatik: foydalanuvchi brauzerда "Install / O'rnatish" tugmasini ko'radi
(manifest.webmanifest + sw.js). Desktop va Android'да o'rnatiladi.

> Instagram/YouTube ichida havola ochilsa — PWA ularning ichki brauzerида ishlaydi.
> (Bu platformalarga "ilova" sifatida o'rnatib bo'lmaydi — bu ularning cheklovi.)

---

## 2. Telegram Mini App
1. Veb-ilovani (1-bo'lim) HTTPS URL'ga joylang (masalan https://neyron.app).
2. Telegram'да **@BotFather** orqali bot yarating.
3. `/newapp` → botni tanlang → Mini App URL'ini bering (HTTPS URL).
4. Tayyor: bot tugmasi yoki `t.me/<bot>/<app>` orqali ochiladi.

Kod allaqachon tayyor: `telegram-web-app.js` yuklanadi, `PlatformInit`
`ready()`/`expand()` chaqiradi va mavzu ranglarini moslaydi.

---

## 3. Android va iOS (App Store / Google Play) — Capacitor
```bash
npm i -D @capacitor/cli
npm i @capacitor/core
npx cap init        # appId: ai.neyron.app (capacitor.config.ts'da tayyor)
npm run build       # out/ hosil bo'ladi (webDir)
npx cap add android
npx cap add ios
npx cap sync
npx cap open android   # Android Studio'da build/signed APK/AAB
npx cap open ios       # Xcode'da build (faqat macOS)
```
`capacitor.config.ts` allaqachon `webDir: 'out'` bilan sozlangan.

---

## 4. Desktop ilova (ixtiyoriy, native .exe/.dmg)
PWA desktop'да o'rnatiladi (1-bo'lim) — ko'pincha yetarli.
To'liq native kerak bo'lsa: Electron yoki Tauri bilan `out/` ni o'rab bering.

---

## Platforma matritsasi
| Platforma | Usul | Holat |
|---|---|---|
| Desktop/mobil brauzer | PWA | ✅ tayyor |
| Telegram | Mini App | ✅ kod tayyor (URL + bot kerak) |
| Instagram/YouTube | havola → PWA (ichki brauzer) | ✅ ishlaydi |
| Android/iOS do'kon | Capacitor | ✅ sozlangan (paketlash kerak) |
| Desktop native | PWA yoki Electron/Tauri | PWA tayyor |
