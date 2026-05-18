const CACHE_NAME = "copacenter-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon.png"
];

// On Installation: Pre-cache static shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[Service Worker] Pré-cacheando recursos essenciais...");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// On Activation: Clean up deprecated caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Limpando cache obsoleto:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// On Fetch events: Network-First for HTML (so user always gets latest updates live if online),
// and Stale-While-Revalidate for JS/CSS/Images to load instantly
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  
  // 1. Network-First Strategy for HTML documents
  if (event.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname === "/" || url.pathname.endsWith("/copa-2026-app/")) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match("./index.html") || caches.match("./");
        })
    );
  } else {
    // 2. Stale-While-Revalidate Strategy for static files (JS, CSS, PNG, Manifest)
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Silence network fetch warnings offline
          });
          
        return cachedResponse || fetchPromise;
      })
    );
  }
});
