// Define a cache name
const CACHE_NAME = 'PWA-Gym-cache-v1';
const url_path = '/PWA-Gym/';

// Files to cache
const urlsToCache = [
  `${url_path}index.html`,
  `${url_path}icons/icon-192x192.png`,
  `${url_path}icons/icon-512x512.png`,
  `${url_path}service-worker.js`,
  `${url_path}manifest.json`
];

// Install the service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate the service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(cache => cache !== CACHE_NAME) // Filter old caches
          .map(caches.delete) // Delete old caches
      )
    )
  );
});

// Fetch event handler
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
