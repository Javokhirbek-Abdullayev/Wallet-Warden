const CACHE_NAME = "wallet-warden-v2";
const STATIC_ASSETS = ["/", "/index.html", "/style.css", "/app.js", "/manifest.json", "/supabase.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) =>
      Promise.all(STATIC_ASSETS.map((url) => c.add(url).catch(() => {}))).then(() => undefined)
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("supabase.co")) return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
