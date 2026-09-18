/* ═══════════════════════════════════════════════════════════════
   PSALMS & PROVERBS PWA — Service Worker
   Caches all text content for offline reading
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'psalms-proverbs-v6';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './StPageFlip.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './audio/PSALM-023.mp3'
];

// Psalm markdown files to cache
const PSALM_FILES = [];
for (let i = 1; i <= 150; i++) {
  const num = String(i).padStart(3, '0');
  PSALM_FILES.push(`./psalms/PSALM-${num}.md`);
}

// Proverb markdown files to cache (when they exist)
const PROVERB_FILES = [];
for (let i = 1; i <= 31; i++) {
  const num = String(i).padStart(3, '0');
  PROVERB_FILES.push(`./proverbs/PROVERB-${num}.md`);
}

const ALL_ASSETS = [...CORE_ASSETS, ...PSALM_FILES];

// Install — cache core assets, attempt text files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache core assets first (critical)
      await cache.addAll(CORE_ASSETS).catch(err => {
        console.error('SW: Failed to cache core assets:', err);
      });
      // Cache psalm files (non-blocking if some fail)
      await Promise.allSettled(
        PSALM_FILES.map(url =>
          fetch(url).then(r => {
            if (r.ok) return cache.put(url, r);
          }).catch(err => {
            console.warn(`SW: Failed to cache ${url}:`, err);
          })
        )
      );
      // Attempt proverb files (non-blocking — they don't exist yet)
      await Promise.allSettled(
        PROVERB_FILES.map(url =>
          fetch(url).then(r => {
            if (r.ok) return cache.put(url, r);
          }).catch(() => {
            // Expected — proverb files don't exist yet
          })
        )
      );
      self.skipWaiting();
    })
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for assets, stale-while-revalidate for markdown
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cache-first for core assets
  if (CORE_ASSETS.some(a => url.pathname.endsWith(a.replace('./', '/')))) {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request);
      })
    );
    return;
  }

  // Stale-while-revalidate for psalm files
  if (url.pathname.includes('/psalms/PSALM-') && url.pathname.endsWith('.md')) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Stale-while-revalidate for proverb files
  if (url.pathname.includes('/proverbs/PROVERB-') && url.pathname.endsWith('.md')) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: try cache, then network
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(response => {
        return response;
      }).catch(() => {
        return cached;
      });
    })
  );
});