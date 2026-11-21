/* Juliu's Special 5 - Service Worker offline
   Guarda la app en el celular en la primera visita (con wifi)
   y después la sirve desde la caché, sin GitHub Pages ni datos. */

const CACHE_NAME = 'juliu-special-5-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  './icon-j5.png',
  './success.mp3'
];

// Install: guardar todos los archivos de la app en caché.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: borrar cachés de versiones anteriores.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// Fetch: cache-first. Si está en caché, se sirve desde ahí;
// si no, se intenta la red y, si responde, se guarda en caché.
// Solo se cachean peticiones GET del mismo origen.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (
          response &&
          response.ok &&
          event.request.url.startsWith(self.location.origin)
        ) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        // Sin red y sin caché: para la página principal, servir index.html.
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 504, statusText: 'Sin conexión' });
      });
    })
  );
});
