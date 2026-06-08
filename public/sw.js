// Neura AI — service worker (PWA offline + tez yuklash).
// MUHIM: versiyani har asset o'zgarishida oshiring — eski kesh o'chadi.
const CACHE = 'neura-v3';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navigatsiya: network-first (yangi kontent), offline bo'lsa cache.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/en/'))),
    );
    return;
  }

  // Statik assetlar (rasm/JS/CSS): STALE-WHILE-REVALIDATE.
  // Keshdan darhol beradi (tez), lekin fonda yangisini olib keshni yangilaydi
  // — shunda logo/asset o'zgarsa keyingi tashrifda yangisi ko'rinadi
  // (cache-first kabi "abadiy eski" muammosi yo'q).
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    ),
  );
});
