// PWA Service Worker for Edo Innovates LMS

const CACHE_VERSION = 1;
const STATIC_CACHE = `lms-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `lms-dynamic-v${CACHE_VERSION}`;
const ASSET_CACHE = `lms-assets-v${CACHE_VERSION}`;

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// Install event - pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately without waiting for page reload
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name.startsWith('lms-') &&
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE &&
              name !== ASSET_CACHE
            );
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all open pages immediately
  self.clients.claim();
});

// Helper - determine if request is for an API
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Helper - determine if request is for a page (HTML navigation)
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Helper - determine if request is for a static asset
function isStaticAsset(url) {
  const extensions = ['.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  return extensions.some((ext) => url.pathname.endsWith(ext));
}

// Fetch event - serve from cache or network with different strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Skip API requests - always go to network
  if (isApiRequest(url)) {
    return;
  }

  // For navigation requests - Network First with fallback to cache
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version of the page
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback - serve cached page
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // For static assets - Cache First, falling back to network
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(ASSET_CACHE).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
    return;
  }

  // For other requests - Network First with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
