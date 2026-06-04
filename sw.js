// LicenseHub Service Worker v1.2
const CACHE_NAME = "licensehub-v1.2";
const STATIC_ASSETS = [
  "/licensehub/",
  "/licensehub/index.html",
  "/licensehub/static/js/main.4cfe3827.js",
  "/licensehub/manifest.json",
  "/licensehub/favicon.ico",
  "/licensehub/logo192.png",
  "/licensehub/logo512.png"
];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/licensehub/",
        "/licensehub/index.html",
        "/licensehub/manifest.json",
        "/licensehub/favicon.ico"
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate — clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip Google APIs and Apps Script requests (always need network)
  const url = event.request.url;
  if (
    url.includes("script.google.com") ||
    url.includes("googleapis.com") ||
    url.includes("fonts.googleapis.com") ||
    url.includes("fonts.gstatic.com")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (event.request.method === "GET" && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fallback to index.html for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/licensehub/index.html");
          }
        });
      })
  );
});
