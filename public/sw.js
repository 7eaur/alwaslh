/**
 * sw.js - النسخة المستقرة للوسيلة الذكية v656
 * استراتيجية: Network First للبيانات، Cache First للصور
 */

const VERSION = 'v730';
const CACHE_NAME = 'al-waseela-' + VERSION;
const IMAGE_CACHE = 'al-waseela-images-v1';

const APP_SHELL = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

function isImageRequest(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
    url.hostname.includes('s3cdn') ||
    url.hostname.includes('supabase');
}

// استراتيجية Cache First للصور (للعمل بدون إنترنت)
async function cacheFirst(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 404 });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // الصور من أي مصدر: Cache First (للعمل بدون إنترنت)
  if (isImageRequest(url) || request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // تجاهل الطلبات الخارجية غير الصور
  if (url.origin !== location.origin) {
    return;
  }

  // ⬇️ طلبات التنقل (فتح التطبيق أو التنقل بين صفحات SPA) تُرجع دائماً index.html
  const isNavigation =
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.searchParams.has('pwa');

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200 && request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put('/index.html', clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || new Response('', { status: 503 })))
    );
    return;
  }

  // باقي الملفات (JS/CSS/Assets): Network First مع رجوع إلى الكاش
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || new Response('غير متاح أوفلاين', { status: 503 }))
      )
  );
});


