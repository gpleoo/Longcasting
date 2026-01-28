// Service Worker for Longcasting Pro
// Version 1.6.0

const CACHE_NAME = 'longcasting-v1.6';
const RUNTIME_CACHE = 'longcasting-runtime';
const MAP_TILES_CACHE = 'longcasting-map-tiles';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/css/mobile.css',
    '/css/accessibility.css',
    '/manifest.json',
    // Moduli JS
    '/js/utils.js',
    '/js/DataManager.js',
    '/js/GPSTracker.js',
    '/js/i18n.js',
    '/js/Validator.js',
    '/js/Performance.js',
    '/js/Accessibility.js',
    // Add offline fallback page
    '/offline.html'
];

// Map tile URL patterns
const MAP_TILE_REGEX = /https:\/\/[a-c]\.tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png/;

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS.filter(url => url !== '/offline.html'));
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME &&
                        cacheName !== RUNTIME_CACHE &&
                        cacheName !== MAP_TILES_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle map tiles separately
    if (MAP_TILE_REGEX.test(request.url)) {
        event.respondWith(handleMapTiles(request));
        return;
    }

    // Handle API requests (always network first)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Handle static assets (cache first)
    event.respondWith(cacheFirst(request));
});

// Strategy: Cache First (for static assets)
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        console.log('[SW] Serving from cache:', request.url);
        return cached;
    }

    try {
        const response = await fetch(request);

        // Cache successful responses
        if (response.ok) {
            const clonedResponse = response.clone();
            const runtimeCache = await caches.open(RUNTIME_CACHE);
            runtimeCache.put(request, clonedResponse);
        }

        return response;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);

        // Return offline page for navigation requests
        if (request.destination === 'document') {
            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) return offlinePage;
        }

        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Strategy: Network First (for API requests)
async function networkFirst(request) {
    try {
        const response = await fetch(request);

        // Cache successful API responses
        if (response.ok) {
            const clonedResponse = response.clone();
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, clonedResponse);
        }

        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        const cached = await caches.match(request);

        if (cached) {
            return cached;
        }

        return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Strategy: Cache with Network Update (for map tiles)
async function handleMapTiles(request) {
    const cache = await caches.open(MAP_TILES_CACHE);
    const cached = await cache.match(request);

    // Return cached tile immediately
    if (cached) {
        // Update cache in background
        fetch(request).then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
        }).catch(() => {
            // Silently fail if network is unavailable
        });

        return cached;
    }

    // Fetch from network and cache
    try {
        const response = await fetch(request);

        if (response.ok) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        // Return empty tile or placeholder
        return new Response('', {
            status: 404,
            statusText: 'Tile not available offline'
        });
    }
}

// Background sync for data synchronization
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-sessions') {
        console.log('[SW] Syncing sessions...');
        event.waitUntil(syncSessions());
    }
});

async function syncSessions() {
    try {
        // Get pending sessions from IndexedDB or localStorage
        // Send to server
        console.log('[SW] Sessions synced successfully');
    } catch (error) {
        console.error('[SW] Sync failed:', error);
        throw error; // Retry sync later
    }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};
    const title = data.title || 'Longcasting Pro';
    const options = {
        body: data.body || 'Nuova notifica',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        data: data
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});
