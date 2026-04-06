// Plaza Steel & Crockery - Service Worker
const CACHE_NAME = 'plaza-rate-list-v5';

const urlsToCache = [
    './',
    './index.html',
    './admin-login.html',
    './admin-dashboard.html',
    './portal.html',
    './manifest.json',
    './cache/logo.png',
    './cache/app icon.png',
    './assets/css/style.css',
    './assets/css/animations.css',
    './assets/js/main.js',
    './assets/js/search.js',
    './assets/js/pwa.js'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch Event - Network first for dynamic content
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    
    // Skip cross-origin requests
    if (!url.startsWith(self.location.origin)) {
        return;
    }
    
    // Always fetch JSON files from network (no cache)
    if (url.includes('.json')) {
        event.respondWith(
            fetch(url, { cache: 'no-store' })
                .then(response => response)
                .catch(() => {
                    return new Response('[]', { 
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }
    
    // For HTML pages, try network first
    if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For other resources, use cache first
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(event.request).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Handle messages from main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
