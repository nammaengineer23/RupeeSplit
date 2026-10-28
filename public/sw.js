// RupeeSplit Production Service Worker
// Provides reliable offline app shell while strictly protecting sensitive user data

const CACHE_NAME = 'rupeesplit-static-v2';

// Shell assets safely precached for offline app availability
const STATIC_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/favicon.ico'
];

// Domains and endpoints that MUST NEVER be cached under any circumstances
const SENSITIVE_HOSTS = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'accounts.google.com',
  'oauth2.googleapis.com',
  'apis.google.com',
  'content.googleapis.com'
];

function isSensitiveRequest(request, url) {
  // Only GET requests can ever be cached
  if (request.method !== 'GET') return true;

  // Never cache API proxy endpoints, receipts, scans, or auth routes
  if (url.pathname.startsWith('/api/') || 
      url.pathname.includes('/auth') || 
      url.pathname.includes('/receipt') || 
      url.pathname.includes('/bill')) {
    return true;
  }

  // Never cache any requests directed to external auth, Firestore, or user account services
  if (SENSITIVE_HOSTS.some(host => url.hostname.includes(host))) {
    return true;
  }

  // Never cache requests that carry auth tokens, api keys, or session secrets
  if (request.headers.has('Authorization') || request.headers.has('Authentication')) {
    return true;
  }

  const query = url.search.toLowerCase();
  if (query.includes('token') || 
      query.includes('key=') || 
      query.includes('auth=') || 
      query.includes('secret') || 
      query.includes('code=')) {
    return true;
  }

  return false;
}

// 1. Install Event: Precache essential app shell assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL_ASSETS).catch((err) => {
        console.warn('[RupeeSplit SW] Non-fatal precache warning:', err);
      });
    })
  );
});

// 2. Activate Event: Clear outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Handle requests securely with safe offline fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-http/https schemes
  if (!url.protocol.startsWith('http')) return;

  // If the request contains sensitive info, tokens, or is an API/Firestore call, bypass cache completely
  if (isSensitiveRequest(request, url)) {
    return;
  }

  // A. Navigation requests (HTML page): Network-first with cache fallback to /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/index.html') || await caches.match('/');
        if (cached) return cached;
        return new Response(
          '<!doctype html><html><head><meta charset="utf-8"><title>RupeeSplit - Offline</title></head><body><div style="font-family:sans-serif;padding:2rem;text-align:center;"><h2>Offline Mode</h2><p>You are currently offline. Your saved local trip data remains safely available on your device.</p></div></body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
    );
    return;
  }

  // B. Google Fonts: Cache-first strategy
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // C. Static bundle assets (JS, CSS, icons, images)
  const isStaticAsset = url.origin === self.location.origin && (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.webmanifest')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => {
          if (request.destination === 'image') {
            return caches.match('/icon.svg');
          }
          return new Response('Asset unavailable offline', { status: 503, statusText: 'Offline' });
        });
      })
    );
    return;
  }

  // D. All other requests: direct network
});

// 4. Background Sync handler
// Note: We safely acknowledge background sync events without claiming unsynchronized expenses are synced
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-expenses') {
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log('[RupeeSplit SW] Background connectivity event received. Local client handles verified synchronization.');
      })
    );
  }
});

// 5. Periodic Sync handler
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-currency-rates') {
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log('[RupeeSplit SW] Periodic check event received.');
      })
    );
  }
});

// 6. Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'RupeeSplit', body: 'Trip update available' };
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now()
    }
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'RupeeSplit', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
