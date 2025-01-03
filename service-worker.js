const CACHE_NAME = 'PWA-Gym-cache-v1';
const APP_SCOPE = '/PWA-Gym/';
const urlsToCache = [
  '/PWA-Gym/',
  '/PWA-Gym/index.html',
  '/PWA-Gym/manifest.json',
  '/PWA-Gym/icons/icon-192x192.png',
  '/PWA-Gym/icons/icon-512x512.png',
];

// Install event: Cache app resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app resources');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Fetch event: Serve cached resources or fetch from network
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Only handle requests under this app's scope
  if (!requestUrl.pathname.startsWith(APP_SCOPE)) {
    console.log('[Service Worker] Ignoring request outside app scope:', requestUrl.pathname);
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', requestUrl.pathname);
        return cachedResponse;
      }

      console.log('[Service Worker] Fetching from network:', requestUrl.pathname);
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response; // Return uncacheable response directly
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          console.error('[Service Worker] Fetch failed:', error);
          throw error;
        });
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );

  self.clients.claim(); // Ensure control of all clients
});

