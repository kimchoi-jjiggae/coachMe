// Minimal Service Worker for PWA
const CACHE_NAME = 'voice-journal-minimal';

// Install event
self.addEventListener('install', (event) => {
  console.log('Minimal service worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Minimal service worker activating...');
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

// Fetch event - minimal handling
self.addEventListener('fetch', (event) => {
  // Only handle requests from our domain
  if (!event.request.url.includes('kimchoi-jjiggae.github.io/coachMe/')) {
    return;
  }
  
  // For navigation requests, always try to fetch from network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful, return the response
          return response;
        })
        .catch(() => {
          // If network fails, try to serve index.html
          return caches.match('./index.html').then((response) => {
            if (response) {
              return response;
            }
            // Ultimate fallback
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
                    // Try to redirect to the main app
                    setTimeout(() => {
                      window.location.href = './index.html';
                    }, 1000);
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
  
  // For other requests, just fetch from network
  event.respondWith(fetch(event.request));
});
