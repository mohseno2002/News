const CACHE='irn-v7';
const ASSETS=['./','./index.html','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const u=e.request.url;
  // لا تُخزّن طلبات RSS/البروكسي إطلاقًا
  if(u.includes('allorigins')||u.includes('corsproxy')||u.includes('codetabs')||u.includes('workers.dev')||u.includes('news.google')){return}
  // الصفحة الرئيسية: شبكة أولًا (عشان أي تحديث جديد يظهر فورًا) والكاش احتياطي للأوفلاين
  if(e.request.mode==='navigate'||u.endsWith('/index.html')||u.endsWith('/')){
    e.respondWith(
      fetch(e.request).then(res=>{
        if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}
        return res;
      }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  // باقي الأصول (خطوط/مانيفست): كاش أولًا
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      if(e.request.method==='GET'&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
