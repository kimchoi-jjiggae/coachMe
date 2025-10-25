// Service Worker for Voice Journal PWA
// Handles background notifications and offline functionality

const CACHE_NAME = 'voice-journal-v1';
const urlsToCache = [
  './',
  './index.html',
  './journal-app.js',
  './env-config.js',
  './style.css',
  './manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync for notifications
self.addEventListener('sync', event => {
  if (event.tag === 'journal-reminder') {
    console.log('Background sync: Journal reminder');
    event.waitUntil(sendJournalReminder());
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Open the app
  event.waitUntil(
    clients.openWindow('./')
  );
});

// Send journal reminder notification
async function sendJournalReminder() {
  try {
    // Get notification settings from IndexedDB
    const settings = await getNotificationSettings();
    
    if (settings.enabled) {
      const options = {
        body: settings.message || "Time for your daily journal reflection! 📝",
        icon: './icons/icon-192x192.svg',
        badge: './icons/icon-72x72.svg',
        tag: 'journal-reminder',
        requireInteraction: true,
        actions: [
          {
            action: 'open',
            title: 'Write Entry',
            icon: './icons/icon-72x72.svg'
          },
          {
            action: 'later',
            title: 'Remind Later',
            icon: './icons/icon-72x72.svg'
          }
        ]
      };
      
      return self.registration.showNotification('Voice Journal Reminder', options);
    }
  } catch (error) {
    console.error('Error sending journal reminder:', error);
  }
}

// Get notification settings from IndexedDB
async function getNotificationSettings() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VoiceJournalDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const getRequest = store.get('notificationSettings');
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result || {
          enabled: true,
          time: '20:00',
          message: "Time for your daily journal reflection! 📝"
        });
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    };
  });
}

// Schedule daily notifications
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleDailyNotification(event.data.time);
  }
});

// Schedule notification for specific time
function scheduleDailyNotification(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const delay = scheduledTime.getTime() - now.getTime();
  
  setTimeout(() => {
    sendJournalReminder();
    // Schedule next day
    scheduleDailyNotification(time);
  }, delay);
  
  console.log('Scheduled notification for:', scheduledTime);
}