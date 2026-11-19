// Servidor local mínimo de archivos estáticos, solo para probar la app.
// Sin dependencias: npm start y abre http://localhost:8080
// Sirve la carpeta del proyecto y no deja salir de ella.

import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUERTO = 8080;
const RAIZ = await realpath(fileURLToPath(new URL('.', import.meta.url)));

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function dentroDeRaiz(ruta) {
  return ruta === RAIZ || ruta.startsWith(RAIZ + sep);
}

// "/css/styles.css?v=1" -> ruta completa dentro de la carpeta.
// null si la dirección está mal formada, apunta fuera de la carpeta o a un
// archivo oculto (.env, .git…).
function rutaPedida(url) {
  let ruta;
  try {
    ruta = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  } catch {
    return null;
  }
  if (ruta.includes('\0')) return null;
  if (ruta.split(/[\\/]/).some((parte) => parte.startsWith('.'))) return null;
  const completa = resolve(RAIZ, '.' + ruta);
  return dentroDeRaiz(completa) ? completa : null;
}

// El archivo pedido y su contenido, o null si no existe o no se puede servir.
// Una carpeta sirve su index.html. realpath evita salir por enlaces simbólicos.
async function leerArchivo(url) {
  const ruta = rutaPedida(url);
  if (!ruta) return null;
  try {
    let archivo = await realpath(ruta);
    if ((await stat(archivo)).isDirectory()) archivo = await realpath(join(archivo, 'index.html'));
    if (!dentroDeRaiz(archivo)) return null;
    return { archivo, contenido: await readFile(archivo) };
  } catch {
    return null;
  }
}

function responder(respuesta, codigo, texto, cabeceras = {}) {
  respuesta.writeHead(codigo, { 'Content-Type': 'text/plain; charset=utf-8', ...cabeceras });
  respuesta.end(texto);
}

const servidor = createServer(async (peticion, respuesta) => {
  if (peticion.method !== 'GET' && peticion.method !== 'HEAD') {
    responder(respuesta, 405, 'Método no permitido', { Allow: 'GET, HEAD' });
    return;
  }

  const encontrado = await leerArchivo(peticion.url);
  if (!encontrado) {
    responder(respuesta, 404, 'No encontrado');
    return;
  }

  respuesta.writeHead(200, {
    'Content-Type': TIPOS[extname(encontrado.archivo).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': encontrado.contenido.length,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  respuesta.end(encontrado.contenido);
});

servidor.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PUERTO} ya está en uso. Cierra el otro servidor y vuelve a intentar.`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});

servidor.listen(PUERTO, () => {
  console.log(`Cotiza Rápido en http://localhost:${PUERTO} (Ctrl+C para salir)`);
});
