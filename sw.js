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

// Fetch event - PWA-optimized strategy
self.addEventListener('fetch', (event) => {
  // Only handle requests from our domain
  if (!event.request.url.includes('kimchoi-jjiggae.github.io/coachMe/')) {
    return;
  }
  
  // Handle navigation requests specially for PWA
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // For navigation requests, try to serve index.html from cache
          return caches.match('./index.html').then((response) => {
            if (response) {
              return response;
            }
            // Fallback to a basic page
            return new Response(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Voice Journal</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <meta name="theme-color" content="#6366f1">
                </head>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
                  <h1>🎙️ Voice Journal</h1>
                  <p>Loading your journal...</p>
                  <script>
                    // Redirect to the main app
                    window.location.href = './index.html';
                  </script>
                </body>
              </html>
            `, {
              headers: { 'Content-Type': 'text/html' }
            });
          });
        })
    );
    return;
  }
  
  // Handle other requests (CSS, JS, images, etc.)
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
        return caches.match(event.request);
      })
  );
});
