const CACHE_NAME = 'floorvision-assets-v3';

// We pre-cache the root documents so they load immediately offline
const PRECACHE_URLS = [
  '/',
  '/index.html'
];

// Install Event: pre-cache root shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clean up old version caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate caching strategy for static resources
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and http/https schemes (prevents chrome-extension caching crashes)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Exclude real-time synchronization channels (Firestore and Gemini AI API calls)
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('generativelanguage.googleapis.com')
  ) {
    return;
  }

  // Network-First strategy for index.html / root / navigation requests
  const isNavigation = event.request.mode === 'navigate' || 
                       url.pathname === '/' || 
                       url.pathname === '/index.html';

  if (isNavigation) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        // Cache the latest index.html on success
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline: serve from cache
        return caches.match(event.request);
      })
    );
    return;
  }

  // Stale-While-Revalidate for other static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Fetch latest copy from the network in background
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the newly retrieved asset
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failure (offline), return cachedResponse or let it fail gracefully
      });

      // Return cached copy immediately (speed) or wait for network (fallback)
      return cachedResponse || fetchPromise;
    })
  );
});
