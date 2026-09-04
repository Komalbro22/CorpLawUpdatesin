const CACHE_NAME = 'corplaw-cache-v4';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline page and assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: Network First with Cache Fallback for navigation, Cache First for static assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // In development (localhost), bypass service worker to ensure fresh HMR and Next.js chunks
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;

  // Ignore non-http/https schemes (e.g. chrome-extension://, moz-extension://)
  if (!url.protocol.startsWith('http')) return;

  // Let browser fetch external third-party origins (ImgBB, Cloudflare, Google Analytics, Extensions) directly
  if (url.origin !== location.origin) return;

  const acceptHeader = event.request.headers.get('accept') || '';
  const isHtmlNavigation = event.request.mode === 'navigate' || acceptHeader.includes('text/html');

  // If this is a page navigation (HTML page)
  if (isHtmlNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy).catch(() => {});
            }).catch(() => {});
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Cache First strategy for assets (JS, CSS, images, fonts)
  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch a fresh version in the background to update cache (stale-while-revalidate)
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse);
                });
              }
            })
            .catch(() => {
              // Ignore background fetch error
            });
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});

// ════════════════════════════════════════════════════════════
// WEB PUSH NOTIFICATION LISTENERS
// ════════════════════════════════════════════════════════════

// Handle incoming Web Push message
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'CorpLawUpdates Alert';
    const targetUrl = data.url || '/updates';

    const options = {
      body: data.body || 'New corporate law circular update published.',
      icon: data.icon || '/apple-icon.png',
      badge: '/icon.png',
      data: {
        url: targetUrl,
        timestamp: data.timestamp || Date.now(),
      },
      tag: data.tag || `corplaw-update-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [150, 50, 150, 50, 200],
      actions: [
        { action: 'open', title: '📖 Read Update' },
        { action: 'dismiss', title: '✖ Dismiss' },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('[Service Worker] Error handling push payload:', err);
  }
});

// Handle Notification click — open/focus article URL or process action
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/updates';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});


// Handle browser push subscription changes / rotation (Chrome/Firefox)
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        return fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      })
      .catch((err) => {
        console.error('[Service Worker] Failed to renew push subscription:', err);
      })
  );
});

