// Simple Service Worker for Voice Journal PWA
const CACHE_NAME = 'voice-journal-v3';

// Install event - minimal caching
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - simple network-first strategy
self.addEventListener('fetch', (event) => {
  // Only handle requests from our domain
  if (!event.request.url.includes('kimchoi-jjiggae.github.io/coachMe/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful, cache and return the response
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // If no cache, return a basic offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return new Response(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Voice Journal - Offline</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                  <h1>Voice Journal</h1>
                  <p>You're offline. Please check your internet connection and try again.</p>
                  <button onclick="window.location.reload()">Retry</button>
                </body>
              </html>
            `, {
              headers: { 'Content-Type': 'text/html' }
            });
          }
        });
      })
  );
});
