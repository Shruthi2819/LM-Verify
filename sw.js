const CACHE_NAME = "lm-verify-shell-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.svg",
];

// Install event — pre-cache core application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching application shell");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event — intercept and apply offline caching strategy
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Bypasses authenticated API routes to prevent sensitive API response leaks in cache (Rule 20)
  if (
    requestUrl.pathname.includes("/api/") ||
    requestUrl.pathname.includes("/gatc/") ||
    requestUrl.pathname.includes("/lmo/") ||
    requestUrl.pathname.includes("/admin/") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // Network-First for HTML/routing paths to allow dynamic index.html loads
  if (event.request.mode === "navigate" || requestUrl.pathname.endsWith(".html") || requestUrl.pathname === "/") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache a copy of the root html shell
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          // Return cached root shell if network drops
          return caches.match("/");
        })
    );
    return;
  }

  // Stale-While-Revalidate for CSS, JS, assets, icons
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Silence network errors when offline
        });

      return cachedResponse || fetchPromise;
    })
  );
});
