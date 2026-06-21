const CACHE_NAME = 'explora-pwa-v11-webp-runtime-fix';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './assets/rafain.webp?v=webp1', './assets/ponto_certo.webp?v=webp1'
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const network = await fetch(event.request, {cache:'no-store'});
        const cache = await caches.open(CACHE_NAME);
        cache.put('./index.html', network.clone()).catch(()=>{});
        return network;
      } catch (e) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request, {ignoreSearch:true});
    if (cached) return cached;
    try {
      const network = await fetch(event.request, {cache:'no-store'});
      if (network && network.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, network.clone()).catch(()=>{});
      }
      return network;
    } catch (e) {
      return Response.error();
    }
  })());
});
