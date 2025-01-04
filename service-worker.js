const APP_NAME = 'PWA-Gym'; // Unique identifier for the app
const CACHE_VERSION = 'v1';
const CACHE_NAME = `${APP_NAME}-cache-${CACHE_VERSION}`;
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
  console.log(`[Service Worker] ${APP_NAME}: Install`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`[Service Worker] ${APP_NAME}: Caching app resources`);
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Fetch event: Serve cached resources or fetch from network
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Only handle requests under this app's scope
  if (!requestUrl.pathname.startsWith(APP_SCOPE)) {
    console.log(`[Service Worker] ${APP_NAME}: Ignoring request outside app scope:`, requestUrl.pathname);
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log(`[Service Worker] ${APP_NAME}: Serving from cache:`, requestUrl.pathname);
        return cachedResponse;
      }

      console.log(`[Service Worker] ${APP_NAME}: Fetching from network:`, requestUrl.pathname);
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
          console.error(`[Service Worker] ${APP_NAME}: Fetch failed:`, error);
          throw error;
        });
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] ${APP_NAME}: Activate`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(`${APP_NAME}-`) && cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] ${APP_NAME}: Deleting old cache:`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
