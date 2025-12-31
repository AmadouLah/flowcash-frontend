// Service Worker pour FlowCash
const CACHE_NAME = 'flowcash-v1';
const RUNTIME_CACHE = 'flowcash-runtime-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/styles.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    })
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return caches.open(RUNTIME_CACHE).then((cache) => {
            return fetch(event.request).then((response) => {
              if (response.status === 200) {
                cache.put(event.request, response.clone());
              }
              return response;
            });
          });
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
  }
});

// Background Sync pour synchroniser les dépenses
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-depenses') {
    event.waitUntil(
      synchroniserDepenses()
    );
  }
});

async function synchroniserDepenses() {
  try {
    const cache = await caches.open('depenses-offline');
    const keys = await cache.keys();
    
    for (const request of keys) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation', error);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation des dépenses', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'flowcash-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('FlowCash', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

