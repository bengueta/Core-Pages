/* offline support: the app shell is stored on first visit and served from the device afterwards */
const CACHE='budget-v1-2026-11-17';
const SHELL=['./','index.html','manifest.webmanifest','lib/gsap.min.js','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  const font=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(u.origin!==location.origin && !font) return;
  if(r.mode==='navigate'){   // newest page when online, stored page when offline
    e.respondWith(fetch(r).then(res=>{ const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./',copy)); return res; }).catch(()=>caches.match('./').then(m=>m||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok||res.type==='opaque'){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(r,copy)); } return res; })));
});
