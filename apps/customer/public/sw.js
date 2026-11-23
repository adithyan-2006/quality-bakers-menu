/* eslint-disable no-undef */
// Quality Bakers Menu - Service Worker
// Production-grade offline fallback and asset caching
const CACHE_NAME = 'qbm-offline-v2';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/images/wifi-bread.png',
  '/favicon.ico',
  '/icon.png',
  '/apple-icon.png',
];

// Install: Cache essential offline fallback assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Pre-caching offline assets failed:', err);
      }),
  );
});

// Activate: Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch: Intercept navigations and serve offline.html when network is unreachable
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions or non-http protocols
  if (!request.url.startsWith('http')) {
    return;
  }

  // Never cache or intercept ping requests (used for real-time connectivity testing)
  if (request.url.includes('/api/ping')) {
    return;
  }

  // HTML page navigations: Network-first, fall back to offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedFallback = await cache.match(OFFLINE_URL);
        if (cachedFallback) {
          return cachedFallback;
        }
        // Fallback response if cache match fails
        return new Response(
          '<!DOCTYPE html><html><body style="background:#B92B1F;color:#F4EBDD;text-align:center;padding:40px;font-family:sans-serif;"><h1>CRUMBLED!</h1><p>You are offline. Please check your connection and try again.</p></body></html>',
          {
            headers: { 'Content-Type': 'text/html' },
          },
        );
      }),
    );
    return;
  }

  // Next.js image optimizer interceptor for offline fallback
  const url = new URL(request.url);
  if (
    url.pathname.startsWith('/_next/image') &&
    url.searchParams.get('url')?.includes('wifi-bread')
  ) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedImg = await cache.match('/images/wifi-bread.png');
        if (cachedImg) return cachedImg;
        return Response.error();
      }),
    );
    return;
  }

  // Precached assets (images, icons, etc.): Network-first with cache fallback
  if (PRECACHE_ASSETS.includes(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }
});

// Allow clients to trigger skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
