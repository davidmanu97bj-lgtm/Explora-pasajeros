const CACHE_NAME = 'explora-pwa-v12-tablet-gallery';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icon-512.png",
  "./assets/logo-explora-horizontal.webp",
  "./posters/generated/aquafoz.jpg",
  "./posters/generated/aquamania.jpg",
  "./posters/generated/aripuca.jpg",
  "./posters/generated/aves.jpg",
  "./posters/generated/bluepark.jpg",
  "./posters/generated/cat_arg.jpg",
  "./posters/generated/cat_bra.jpg",
  "./posters/generated/catamaran.jpg",
  "./posters/generated/compras_py.jpg",
  "./posters/generated/dutyfree.jpg",
  "./posters/generated/feirinha.jpg",
  "./posters/generated/guarani.jpg",
  "./posters/generated/guiraoga.jpg",
  "./posters/generated/helisul.jpg",
  "./posters/generated/hito.jpg",
  "./posters/generated/icebar.jpg",
  "./posters/generated/itaipu_br.jpg",
  "./posters/generated/marco_br.jpg",
  "./posters/generated/mezquita.jpg",
  "./posters/generated/monday.jpg",
  "./posters/generated/ponto_certo.jpg",
  "./posters/generated/rafain.jpg",
  "./posters/generated/templo.jpg",
  "./posters/generated/volver_aero.jpg",
  "./posters/generated/wanda.jpg",
  "./posters/generated/yupstar.jpg"
];

async function cacheShell(){
  const cache=await caches.open(CACHE_NAME);
  await Promise.all(APP_SHELL.map(async url=>{
    try{await cache.add(url)}catch(e){console.warn('No se pudo precargar',url)}
  }));
}

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(cacheShell());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='CACHE_APP')event.waitUntil(cacheShell());
});

async function rangeResponse(request,cached){
  const range=request.headers.get('range');
  if(!range||!cached)return cached;
  const buffer=await cached.arrayBuffer();
  const size=buffer.byteLength;
  const match=/bytes=(\d+)-(\d*)/.exec(range);
  if(!match)return cached;
  const start=Number(match[1]);
  const end=match[2]?Number(match[2]):size-1;
  if(start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  const chunk=buffer.slice(start,Math.min(end+1,size));
  const headers=new Headers(cached.headers);
  headers.set('Content-Range',`bytes ${start}-${Math.min(end,size-1)}/${size}`);
  headers.set('Content-Length',String(chunk.byteLength));
  headers.set('Accept-Ranges','bytes');
  return new Response(chunk,{status:206,statusText:'Partial Content',headers});
}

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
      }catch(e){
        return (await caches.match('./index.html'))||(await caches.match('./'));
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(event.request,{ignoreSearch:true});
    if(cached)return rangeResponse(event.request,cached);
    try{
      const network=await fetch(event.request);
      if(network&&network.ok&&network.status===200){
        const cache=await caches.open(CACHE_NAME);
        cache.put(event.request,network.clone()).catch(()=>{});
      }
      return network;
    }catch(e){
      return Response.error();
    }
  })());
});
