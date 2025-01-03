const CACHE_NAME = 'PWA-Gym-cache-v1';
const urlsToCache = [
  '/PWA-Gym/',
  '/PWA-Gym/index.html',
  '/PWA-Gym/manifest.json',
  '/PWA-Gym/icons/icon-192x192.png',
  '/PWA-Gym/icons/icon-512x512.png'
];

// Install event: Cache app resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate the new service worker immediately
});

// Fetch event: Serve cached resources or fetch from network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests (ignore POST, PUT, etc.)
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', request.url);
        return cachedResponse;
      }

      console.log('[Service Worker] Fetching from network:', request.url);
      return fetch(request)
        .then((response) => {
          // Clone the response to cache it
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
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

  self.clients.claim(); // Ensure the new service worker controls all clients
});
