/* LicenseHub Service Worker v1.2
   Must be in /public/sw.js — served from root of the domain scope */
const CACHE = "licensehub-v1.2";
const PRECACHE = [
  "/licensehub/",
  "/licensehub/index.html",
  "/licensehub/manifest.json",
  "/licensehub/favicon.ico",
  "/licensehub/logo192.png",
  "/licensehub/logo512.png"
];

// ── INSTALL ──────────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────────────────
self.addEventListener("fetch", (e) => {
  // Never intercept Google API / Apps Script / Font calls
  const u = e.request.url;
  if (u.includes("script.google.com") || u.includes("googleapis.com") ||
      u.includes("fonts.googleapis.com") || u.includes("fonts.gstatic.com") ||
      u.includes("google.com")) return;

  // Network first, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (e.request.method === "GET" && res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) => {
          if (cached) return cached;
          if (e.request.mode === "navigate")
            return caches.match("/licensehub/index.html");
        })
      )
  );
});
