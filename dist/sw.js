const CACHE_NAME = 'healthy-brain-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/entrenar.html',
  '/nutricion-ia.html',
  '/comunidad.html',
  '/descanso.html',
  '/ejercicios.html',
  '/assets/css/design-system.css',
  '/assets/images/icon.png'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});