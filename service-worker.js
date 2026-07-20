const CACHE_NAME='explora-pwa-v15-symmetric-transfer-buttons';
const APP_SHELL=['./posters/grid/aquafoz.jpg', './posters/grid/aquamania.jpg', './posters/grid/aripuca.jpg', './posters/grid/aves.jpg', './posters/grid/bluepark.jpg', './posters/grid/cat_arg.jpg', './posters/grid/cat_bra.jpg', './posters/grid/catamaran.jpg', './posters/grid/compras_py.jpg', './posters/grid/dutyfree.jpg', './posters/grid/feirinha.jpg', './posters/grid/guarani.jpg', './posters/grid/guiraoga.jpg', './posters/grid/helisul.jpg', './posters/grid/hito.jpg', './posters/grid/icebar.jpg', './posters/grid/itaipu_br.jpg', './posters/grid/marco_br.jpg', './posters/grid/mezquita.jpg', './posters/grid/monday.jpg', './posters/grid/ponto_certo.jpg', './posters/grid/rafain.jpg', './posters/grid/templo.jpg', './posters/grid/volver_aero.jpg', './posters/grid/wanda.jpg', './posters/grid/yupstar.jpg', './', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icon-512.png'];
const VIDEO_ASSETS=['./videos/aquafoz.mp4', './videos/aquamania.mp4', './videos/aripuca.mp4', './videos/aves.mp4', './videos/bluepark.mp4', './videos/cat_arg.mp4', './videos/cat_bra.mp4', './videos/catamaran.mp4', './videos/compras_py.mp4', './videos/dutyfree.mp4', './videos/feirinha.mp4', './videos/guarani.mp4', './videos/guiraoga.mp4', './videos/helisul.mp4', './videos/hito.mp4', './videos/icebar.mp4', './videos/itaipu_br.mp4', './videos/marco_br.mp4', './videos/mezquita.mp4', './videos/monday.mp4', './videos/ponto_certo.mp4', './videos/rafain.mp4', './videos/templo.mp4', './videos/volver_aero.mp4', './videos/wanda.mp4', './videos/yupstar.mp4'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(!event.data||event.data.type!=='CACHE_APP')return;
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    for(const url of VIDEO_ASSETS){
      try{if(!(await cache.match(url)))await cache.add(url)}catch{}
    }
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const network=await fetch(event.request,{cache:'no-store'});
        const cache=await caches.open(CACHE_NAME);
        cache.put('./index.html',network.clone()).catch(()=>{});
        return network;
      }catch{
        return (await caches.match('./index.html'))||(await caches.match('./'));
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const network=await fetch(event.request,{cache:'no-store'});
      if(network&&network.ok){
        const cache=await caches.open(CACHE_NAME);
        cache.put(event.request,network.clone()).catch(()=>{});
      }
      return network;
    }catch{return Response.error()}
  })());
});
