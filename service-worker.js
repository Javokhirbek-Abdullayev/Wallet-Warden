const CACHE_NAME = "wallet-warden-v3";
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

function isAppDocumentRequest(req) {
  const navigate = req.mode === "navigate" || req.destination === "document";
  if (!navigate || req.method !== "GET") return false;
  try {
    const u = new URL(req.url);
    return u.pathname === "/" || u.pathname.endsWith("/index.html");
  } catch {
    return false;
  }
}

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("supabase.co")) return;
  const req = e.request;
  if (isAppDocumentRequest(req)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || fetch(req)))
    );
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
