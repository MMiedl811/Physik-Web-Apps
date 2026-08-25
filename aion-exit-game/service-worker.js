const CACHE='aion-eva-v2';
const ASSETS=[
  './','./index.html','./assets/hero.png','./assets/intro.webp','./assets/map.webp',
  './assets/scenes/weltbilder.webp','./assets/scenes/kepler.webp','./assets/scenes/exoplaneten.webp',
  './assets/scenes/unsichtbar.webp','./assets/scenes/horizont.webp'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(hit=>hit||fetch(event.request).then(response=>{
    if(response.ok&&new URL(event.request.url).origin===location.origin){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}
    return response;
  }).catch(()=>caches.match('./index.html'))));
});
