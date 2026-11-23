const CACHE_NAME = 'floorvision-assets-v5';

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
  if (url.origin !== self.location.origin) return;

  // Exclude same-origin API rewrites and Firebase Hosting reserved paths
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/__/')) {
    return;
  }

  // Network-First strategy for index.html / root / navigation requests
  const isNavigation = event.request.mode === 'navigate' || 
                       url.pathname === '/' || 
                       url.pathname === '/index.html';

  if (isNavigation) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        // Cache the latest index.html on success under the canonical '/index.html' key
        if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            return cache.put('/index.html', responseToCache);
          }).catch(() => {});
        }
        return networkResponse;
      }).catch(() => {
        // Offline: serve canonical '/index.html' from cache (never undefined)
        return caches.match('/index.html')
          .then((cached) => cached || caches.match('/'))
          .then((cached) => cached || Response.error());
      })
    );
    return;
  }

  // Stale-While-Revalidate for other static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Fetch latest copy from the network in background
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the newly retrieved asset only if same-origin basic 2xx response
        if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            return cache.put(event.request, responseToCache);
          }).catch(() => {});
        }
        return networkResponse;
      }).catch(() => cached || Response.error());

      // Return cached copy immediately (speed) or wait for network (fallback)
      return cached || fetchPromise;
    })
  );
});
