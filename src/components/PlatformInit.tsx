'use client';

import { useEffect } from 'react';

// PWA service worker registratsiyasi + Telegram Mini App integratsiyasi.
// Bitta kod: brauzer (PWA), Telegram (Mini App), Capacitor (native) — hammasida ishlaydi.
export default function PlatformInit() {
  useEffect(() => {
    // 1) PWA service worker — FAQAT productionда.
    // Dev rejimда SW barqaror chunk URL'larini keshlab eski kodni beradi,
    // shuning uchun dev'da ro'yxatdan o'tmaymiz va mavjud SW/keshni tozalaymiz.
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          /* offline rejim ixtiyoriy — jim o'tamiz */
        });
      } else {
        navigator.serviceWorker
          .getRegistrations()
          .then((rs) => rs.forEach((r) => r.unregister()))
          .catch(() => {});
        if (window.caches) {
          caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
        }
      }
    }

    // 2) Telegram Mini App (agar Telegram ichida ochilgan bo'lsa)
    const tg = (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram
      ?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        tg.setHeaderColor?.('#06080F');
        tg.setBackgroundColor?.('#06080F');
        document.documentElement.dataset.tg = '1';
      } catch {
        /* Telegram tashqarisida — e'tibor bermaymiz */
      }
    }
  }, []);

  return null;
}

interface TgWebApp {
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
}
