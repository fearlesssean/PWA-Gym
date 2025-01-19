const APP_NAME = 'PWA-Gym'; // Unique identifier for the app
const CACHE_VERSION = 'v1';
const CACHE_NAME = `${APP_NAME}-cache-${CACHE_VERSION}`;
const APP_SCOPE = '/PWA-Gym/';  // Scope of your app hosted on GitHub Pages

// Define URLs to cache
const urlsToCache = [
  `${APP_SCOPE}`,               // Cache the root directory
  `${APP_SCOPE}index.html`,     // Main page
  `${APP_SCOPE}manifest.json`,  // Manifest file
  `${APP_SCOPE}icons/icon-192x192.png`,  // Icons
  `${APP_SCOPE}icons/icon-512x512.png`,
];

// Install event: Cache app resources
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] ${APP_NAME}: Install event`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`[Service Worker] ${APP_NAME}: Caching resources`);
      return cache.addAll(urlsToCache);
    }).catch((err) => {
      console.error(`[Service Worker] ${APP_NAME}: Cache error during install`, err);
    })
  );
  self.skipWaiting(); // Activate the service worker immediately
});

// Fetch event: Serve cached resources or fetch from network
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Only handle requests within the app's scope
  if (!requestUrl.pathname.startsWith(APP_SCOPE)) {
    console.log(`[Service Worker] ${APP_NAME}: Ignoring request outside scope`, requestUrl.pathname);
    return;
  }

  // Prevent caching of non-necessary resources like third-party requests
  if (requestUrl.hostname !== location.hostname) {
    console.log(`[Service Worker] ${APP_NAME}: Ignoring external request`, requestUrl.href);
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log(`[Service Worker] ${APP_NAME}: Serving from cache`, requestUrl.pathname);
        return cachedResponse;
      }

      console.log(`[Service Worker] ${APP_NAME}: Fetching from network`, requestUrl.pathname);
      return fetch(event.request)
        .then((networkResponse) => {
          // Check if the response is cacheable
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            console.warn(`[Service Worker] ${APP_NAME}: Network response uncacheable`, requestUrl.pathname);
            return networkResponse; // Return uncacheable response
          }

          // Cache the fetched response for future requests
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch((error) => {
          console.error(`[Service Worker] ${APP_NAME}: Fetch failed`, error);
          // Optionally serve a fallback page or resource
          if (event.request.destination === 'document') {
            return caches.match(`${APP_SCOPE}index.html`);
          }
        });
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] ${APP_NAME}: Activate event`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(`${APP_NAME}-`) && cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] ${APP_NAME}: Deleting old cache`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients immediately
});
