// Service Worker for Voice Journal PWA
const CACHE_NAME = 'voice-journal-v2';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './journal.html',
  './journal-app.js',
  './env-config.js',
  './production-config.js',
  './config.js',
  './icon.svg'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Handle GitHub Pages paths
        let requestUrl = event.request.url;
        if (requestUrl.includes('kimchoi-jjiggae.github.io/coachMe/')) {
          // Convert absolute paths to relative paths for GitHub Pages
          requestUrl = requestUrl.replace('https://kimchoi-jjiggae.github.io/coachMe/', './');
        }
        
        return fetch(requestUrl).catch(() => {
          // If fetch fails, try to serve index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
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
});
