const CACHE_NAME = "barbara-zero-v30";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css?v=30",
  "./script.js?v=30",
  "./manifest.webmanifest?v=2",
  "./privacy.html",
  "./assets/icons/app-icon.svg?v=1",
  "./assets/icons/apple-touch-icon.png?v=1",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
];

const SCENE_ASSETS = [
  "./assets/illustrated/house-scene.png",
  "./assets/illustrated/school-scene.png",
  "./assets/illustrated/hospital-scene.png",
  "./assets/illustrated/shop-scene.png",
  "./assets/illustrated/shopping-scene.png",
  "./assets/illustrated/park-scene.png",
  "./assets/illustrated/pool-scene.png",
];

const CHARACTER_ASSETS = [
  "./assets/illustrated/characters/girl.png",
  "./assets/illustrated/characters/boy.png",
  "./assets/illustrated/characters/mom.png",
  "./assets/illustrated/characters/swimmer.png",
  "./assets/illustrated/characters/corgi.png",
  "./assets/illustrated/characters/cat.png",
  "./assets/illustrated/characters/bunny.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
  // Lazy cache scenes + characters after install
  caches.open(CACHE_NAME).then((cache) => {
    SCENE_ASSETS.forEach((url) => cache.add(url).catch(() => {}));
    CHARACTER_ASSETS.forEach((url) => cache.add(url).catch(() => {}));
  });
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Navigation requests – network first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }

  // Images – cache first, then network (stale-while-revalidate)
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // All other assets – cache first with network update
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
