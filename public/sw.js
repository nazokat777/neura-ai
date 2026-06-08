// Neura AI — service worker.
// KESH URUSHINI TUGATISH: eski cache-first SW eskirgan rasm/JS'ni "abadiy"
// berib yuborardi. Bu versiya HAMMA eski keshni o'chiradi va KESHLAMAYDI
// (har doim tarmoqdan yangi) — shunda har o'zgarish darhol ko'rinadi.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();
      // Ochiq sahifalarni yangilaymiz — yangi (keshsiz) kontent yuklansin.
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((c) => c.navigate(c.url));
    })(),
  );
});

// Keshlamaymiz — barcha so'rovlar to'g'ridan-to'g'ri tarmoqqa.
self.addEventListener('fetch', () => {});
