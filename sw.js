const CACHE_NAME = 'mi-lista-v5'; // 👈 cambia versión si actualizas archivos

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

  // CDNs
  'https://code.getmdl.io/1.3.0/material.min.js',
  'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js'
];

// INSTALACIÓN
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    }).catch((err) => {
      console.error('❌ Error al almacenar en caché:', err);
    })
  );
  self.skipWaiting();
});

// ACTIVACIÓN
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
             .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// FETCH: caché primero, luego red si no está
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((respuesta) => {
      return respuesta || fetch(event.request).catch(() => {
        console.warn('🌐 Sin conexión y recurso no está en caché:', event.request.url);
      });
    })
  );
});
