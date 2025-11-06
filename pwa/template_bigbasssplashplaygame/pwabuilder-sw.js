// This is the "Offline copy of assets" service worker
// Version: 1.0.2 - Added OneSignal integration for push notifications

const CACHE = "pwabuilder-offline-v1.0.2";

// Import OneSignal service worker FIRST (required for push notifications)
// This must be imported before other service worker code
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// Import Workbox for caching
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Clear old caches on activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old cache versions
            return cacheName.startsWith("pwabuilder-offline") && cacheName !== CACHE;
          })
          .map((cacheName) => {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {});

// Cache strategy: Network first, then cache (better for updates)
// But for CSS/JS, use CacheFirst for better performance
workbox.routing.registerRoute(
  ({request}) => request.destination === 'style' || request.destination === 'script',
  new workbox.strategies.CacheFirst({
    cacheName: CACHE,
    plugins: [
      {
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    ]
  })
);

// For other resources, use NetworkFirst
workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE,
    plugins: [
      {
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    ]
  })
);
