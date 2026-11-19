import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEXTOS, IDIOMAS, t } from '../js/i18n.js';

test('IDIOMAS son español e inglés y TEXTOS tiene los dos', () => {
  assert.deepEqual(IDIOMAS, ['es', 'en']);
  assert.deepEqual(Object.keys(TEXTOS).sort(), ['en', 'es']);
});

test('cada clave en español existe en inglés y al revés', () => {
  const faltanEnIngles = Object.keys(TEXTOS.es).filter((clave) => !Object.hasOwn(TEXTOS.en, clave));
  const faltanEnEspanol = Object.keys(TEXTOS.en).filter((clave) => !Object.hasOwn(TEXTOS.es, clave));
  assert.deepEqual(faltanEnIngles, []);
  assert.deepEqual(faltanEnEspanol, []);
});

test('ningún texto está vacío', () => {
  for (const idioma of IDIOMAS) {
    for (const [clave, texto] of Object.entries(TEXTOS[idioma])) {
      assert.equal(typeof texto, 'string', `${idioma} ${clave}`);
      assert.ok(texto.trim(), `${idioma} ${clave}`);
    }
  }
});

// Si una marca como {numero} falta en un idioma, ese dato no se vería.
test('los dos idiomas usan las mismas marcas', () => {
  const marcas = (texto) => (String(texto ?? '').match(/\{\w+\}/g) ?? []).sort();
  for (const clave of Object.keys(TEXTOS.es)) {
    assert.deepEqual(marcas(TEXTOS.en[clave]), marcas(TEXTOS.es[clave]), clave);
  }
});

test('t da el texto en el idioma elegido', () => {
  assert.equal(t('historial.titulo', 'es'), 'Historial');
  assert.equal(t('historial.titulo', 'en'), 'History');
});

test('t reemplaza las marcas con los valores', () => {
  assert.equal(t('cotizacion.guardada', 'es', { numero: 3 }), 'Cotización n.º 3 guardada.');
  assert.equal(t('cotizacion.guardada', 'en', { numero: 3 }), 'Quote no. 3 saved.');
  assert.equal(
    t('cotizacion.numero', 'es', { numero: 3, fecha: '19 nov 2026' }),
    'Cotización n.º 3 · 19 nov 2026',
  );
  assert.equal(t('servicios.guardado', 'en', { descripcion: 'Poda' }), 'Service "Poda" saved.');
});

test('t deja la marca si falta su valor', () => {
  assert.equal(t('cotizacion.guardada', 'es'), 'Cotización n.º {numero} guardada.');
  assert.equal(t('cotizacion.guardada', 'es', { otro: 1 }), 'Cotización n.º {numero} guardada.');
});

test('t usa español si el idioma no se conoce', () => {
  assert.equal(t('historial.titulo', 'fr'), 'Historial');
  assert.equal(t('historial.titulo', undefined), 'Historial');
  assert.equal(t('cotizacion.guardada', 'fr', { numero: 5 }), 'Cotización n.º 5 guardada.');
});

test('t usa español si falta la clave en el idioma elegido', () => {
  const original = TEXTOS.en['historial.titulo'];
  delete TEXTOS.en['historial.titulo'];
  try {
    assert.equal(t('historial.titulo', 'en'), 'Historial');
  } finally {
    TEXTOS.en['historial.titulo'] = original;
  }
});

test('t devuelve la clave si no existe', () => {
  assert.equal(t('no.existe', 'es'), 'no.existe');
  assert.equal(t('no.existe', 'en'), 'no.existe');
  assert.equal(t('no.existe', 'fr'), 'no.existe');
  assert.equal(t('toString', 'es'), 'toString');
});
