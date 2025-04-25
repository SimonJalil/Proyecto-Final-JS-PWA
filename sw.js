const CACHE_NAME = 'mi-lista-v1';

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/app.js',
  '/js/indexdb.js',
  '/assets/images/supermercado.png',

  // Favicons (agrega aquí las que uses)
  '/assets/favicon/android-icon-192x192.png',
  '/assets/favicon/apple-icon-180x180.png',
  '/assets/favicon/favicon-96x96.png',
  '/assets/favicon/favicon.ico',

  // Material Design Lite
  'https://code.getmdl.io/1.3.0/material.min.js',
  'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',

  // Chart.js y SweetAlert2 (si los estás cargando por CDN)
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

// INSTALACIÓN: Caching de archivos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE).catch((error) => {
      console.error('Error al almacenar en caché:', error);
    }
    ))
  );
  self.skipWaiting();
});

// ACTIVACIÓN: Limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH: Responder desde cache, si no, desde la red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(respuesta =>
      respuesta || fetch(event.request)
    )
  );
});
