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

// Fetch event - PWA scope handling
self.addEventListener('fetch', (event) => {
  // Only handle requests from our domain
  if (!event.request.url.includes('kimchoi-jjiggae.github.io/coachMe/')) {
    return;
  }
  
  // For navigation requests, handle PWA scope issues
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful, return the response
          return response;
        })
        .catch(() => {
          // If network fails, try different fallback strategies
          return caches.match('./index.html').then((response) => {
            if (response) {
              return response;
            }
            // Try to fetch index.html directly
            return fetch('./index.html').then((response) => {
              if (response.ok) {
                return response;
              }
              // Ultimate fallback with proper redirect
              return new Response(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Voice Journal</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta name="theme-color" content="#6366f1">
                    <script>
                      // Force redirect to the correct path
                      window.location.href = 'https://kimchoi-jjiggae.github.io/coachMe/index.html';
                    </script>
                  </head>
                  <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
                    <h1>🎙️ Voice Journal</h1>
                    <p>Redirecting to your journal...</p>
                  </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            });
          });
        })
    );
    return;
  }
  
  // For other requests, try to fix path issues
  let requestUrl = event.request.url;
  
  // Fix common PWA path issues
  if (requestUrl.includes('kimchoi-jjiggae.github.io/coachMe/')) {
    // Ensure the request has the correct path
    if (!requestUrl.endsWith('/') && !requestUrl.includes('.')) {
      requestUrl = requestUrl + '/index.html';
    }
  }
  
  event.respondWith(
    fetch(requestUrl)
      .then((response) => {
        return response;
      })
      .catch(() => {
        // Try to serve from cache
        return caches.match(event.request);
      })
  );
});
