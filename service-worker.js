const CACHE_NAME = 'explora-pwa-v6-blackview-restaurants';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './posters/rafain.jpg', './posters/ponto_certo.jpg'
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

async function rangeResponse(request) {
  const range = request.headers.get('range');
  const cleanURL = new URL(request.url);
  cleanURL.search = '';
  const cache = await caches.open(CACHE_NAME);
  let full = await cache.match(cleanURL.toString());
  if (!full) {
    const net = await fetch(cleanURL.toString(), {cache:'no-store'});
    if (!net.ok) return net;
    full = net.clone();
    cache.put(cleanURL.toString(), net.clone()).catch(()=>{});
  }
  if (!range) return full;
  const blob = await full.blob();
  const match = /bytes=(\d+)-(\d*)/.exec(range);
  if (!match) return full;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : blob.size - 1;
  const chunk = blob.slice(start, end + 1);
  return new Response(chunk, {
    status: 206,
    headers: {
      'Content-Type': full.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${blob.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(chunk.size)
    }
  });
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('.mp4')) {
    event.respondWith(rangeResponse(event.request));
    return;
  }

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
      const network = await fetch(event.request);
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
