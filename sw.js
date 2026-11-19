// Service worker: guarda la app en caché para que abra sin Internet.
// Las rutas son relativas a sw.js, así funciona también publicada en una subcarpeta.
// Al cambiar archivos, sube VERSION para que se vuelvan a guardar.

const VERSION = 1;
const PREFIJO = 'cotiza-rapido-';
const CACHE = `${PREFIJO}v${VERSION}`;

const ARCHIVOS = [
  './',
  'index.html',
  'css/styles.css',
  'css/print.css',
  'js/app.js',
  'js/calc.js',
  'js/share.js',
  'js/store.js',
  'manifest.webmanifest',
  'icon.svg',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting()),
  );
});

// Borra solo las cachés viejas de esta app; otras apps del mismo sitio no se tocan.
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((nombre) => nombre.startsWith(PREFIJO) && nombre !== CACHE)
            .map((nombre) => caches.delete(nombre)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Primero la red, y se actualiza la caché. Sin red, lo guardado; si es una
// página que no está guardada, index.html.
async function responder(peticion) {
  const cache = await caches.open(CACHE);
  try {
    const respuesta = await fetch(peticion);
    if (respuesta.ok) await cache.put(peticion, respuesta.clone());
    return respuesta;
  } catch (error) {
    const guardada = await cache.match(peticion, { ignoreSearch: true });
    if (guardada) return guardada;
    if (peticion.mode === 'navigate') {
      const pagina = await cache.match('index.html');
      if (pagina) return pagina;
    }
    throw error;
  }
}

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;
  if (new URL(peticion.url).origin !== self.location.origin) return;
  evento.respondWith(responder(peticion));
});
