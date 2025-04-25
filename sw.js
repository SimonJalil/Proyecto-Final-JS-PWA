const CACHE_NAME = 'mi-lista-v1';

const URLS_TO_CACHE = [
  '/Proyecto-Final-JS-PWA/',
  '/Proyecto-Final-JS-PWA/index.html',
  '/Proyecto-Final-JS-PWA/manifest.json',
  '/Proyecto-Final-JS-PWA/css/style.css',
  '/Proyecto-Final-JS-PWA/js/app.js',
  '/Proyecto-Final-JS-PWA/js/indexdb.js',
  '/Proyecto-Final-JS-PWA/assets/images/supermercado.png',
  '/Proyecto-Final-JS-PWA/assets/images/foto-perfil.jpeg',

  // Favicons
  '/Proyecto-Final-JS-PWA/assets/favicon/android-icon-192x192.png',
  '/Proyecto-Final-JS-PWA/assets/favicon/apple-icon-180x180.png',
  '/Proyecto-Final-JS-PWA/assets/favicon/favicon-96x96.png',
  '/Proyecto-Final-JS-PWA/assets/favicon/favicon.ico',

  // Material Design Lite
  'https://code.getmdl.io/1.3.0/material.min.js',
  'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',

  // Chart.js y SweetAlert2
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
