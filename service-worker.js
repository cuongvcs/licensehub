/* LicenseHub Service Worker v1.2 */
var CACHE = 'licensehub-v1.2';

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(['/licensehub/', '/licensehub/index.html']).catch(function(){});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.indexOf('script.google.com') > -1 || url.indexOf('googleapis.com') > -1) return;
  e.respondWith(
    fetch(e.request).then(function(res) {
      if (e.request.method === 'GET' && res && res.status === 200) {
        caches.open(CACHE).then(function(c){ c.put(e.request, res.clone()); });
      }
      return res;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || (e.request.mode === 'navigate' ? caches.match('/licensehub/') : null);
      });
    })
  );
});
