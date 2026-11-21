/* Parking Julius Pro — Service Worker con caché offline real.
   Después de la primera carga con wifi, la app abre sin datos
   ni GitHub Pages: el HTML, el manifiesto, el icono y Leaflet
   quedan guardados en el celular. Las teselas del mapa y Google
   Maps sí siguen necesitando internet cuando se usan. */

const CACHE_NAME = 'parking-julius-v1';

const ARCHIVOS_OFFLINE = [
  './',
  './index.html',
  './manifest.json',
  './icon-parking.png',
  './leaflet/leaflet.css',
  './leaflet/leaflet.js',
  './leaflet/images/marker-icon.png',
  './leaflet/images/marker-icon-2x.png',
  './leaflet/images/marker-shadow.png',
  './leaflet/images/layers.png',
  './leaflet/images/layers-2x.png'
];

// Guardar todo en caché al instalar (primera carga con wifi).
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARCHIVOS_OFFLINE))
      .then(() => self.skipWaiting())
  );
});

// Borrar cachés viejos y tomar el control de la página.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(
        nombres.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => clients.claim())
  );
});

// Cache-first con fallback a red.
// - Misma app: si está en caché, se sirve de ahí aunque no haya datos.
// - Si no está en caché, se pide a la red y, si es del mismo origen,
//   se guarda para la próxima vez.
// - Si no hay red ni caché y es una navegación, se sirve index.html.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((enCache) => {
      if (enCache) return enCache;
      return fetch(e.request).then((respuesta) => {
        // Guardar solo respuestas válidas del mismo origen.
        if (respuesta && respuesta.ok && new URL(e.request.url).origin === self.location.origin) {
          const copia = respuesta.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copia));
        }
        return respuesta;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return caches.match(e.request, { ignoreSearch: true });
      });
    })
  );
});

// Abrir la app al tocar una notificación.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      if (ventanas.length) return ventanas[0].focus();
      return clients.openWindow('./index.html');
    })
  );
});

// --- Alarmas programadas desde index.html (PROGRAMAR_ALERTAS) ---
// Se conservan los textos y tiempos originales: aviso a 5 min antes
// y alarma final al vencerse el tiempo. Si se programa una nueva
// alarma, se cancelan los temporizadores anteriores.
let temporizadores = [];

self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Cancelar las alarmas pendientes al limpiar el parquímetro.
  if (event.data.type === 'LIMPIAR_ALERTAS') {
    temporizadores.forEach((id) => clearTimeout(id));
    temporizadores = [];
    return;
  }

  if (event.data.type !== 'PROGRAMAR_ALERTAS') return;

  const msTotales = event.data.msTotales;
  const msAviso = msTotales - (5 * 60000);

  temporizadores.forEach((id) => clearTimeout(id));
  temporizadores = [];

  // 1. Aviso de 5 minutos
  if (msAviso > 0) {
    temporizadores.push(setTimeout(() => {
      self.registration.showNotification('⚠️ QUEDAN 5 MINUTOS', {
        body: 'Julius, el tiempo casi termina. ¡Regresa!',
        icon: 'icon-parking.png',
        vibrate: [500, 200, 500],
        requireInteraction: true,
        tag: 'aviso-urgente'
      });
    }, msAviso));
  }

  // 2. Alarma final
  temporizadores.push(setTimeout(() => {
    self.registration.showNotification('🚨 ¡TIEMPO AGOTADO!', {
      body: 'El parquímetro ha finalizado.',
      icon: 'icon-parking.png',
      vibrate: [1000, 500, 1000, 500, 1000],
      requireInteraction: true,
      tag: 'alarma-final'
    });
  }, msTotales));
});
