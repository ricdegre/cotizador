import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textoCotizacion, enlaceWhatsApp } from '../js/share.js';

const negocio = {
  nombre: 'Plomería Ruiz',
  telefono: '555 123 4567',
  codigoPais: '1',
  impuesto: 16,
  nota: 'Válida por 15 días',
};

// Sin "Z" la fecha se lee en hora local, así el día no cambia con la zona horaria.
const cotizacion = {
  numero: 3,
  fecha: '2026-01-15T12:00:00',
  cliente: { nombre: 'Ana', telefono: '55 1234-5678' },
  lineas: [
    { descripcion: 'Cambio de llave', cantidad: '2', precio: 35000 },
    { descripcion: 'Material', cantidad: 1, precio: 1050 },
  ],
  notas: 'Incluye limpieza',
};

test('textoCotizacion arma el texto completo', () => {
  assert.equal(
    textoCotizacion(cotizacion, negocio),
    [
      'Plomería Ruiz',
      'Cotización n.º 3 · 15/01/2026',
      '',
      '2 x Cambio de llave: $700.00',
      '1 x Material: $10.50',
      '',
      'Subtotal: $710.50',
      'Impuesto: $113.68',
      'Total: $824.18',
      '',
      'Incluye limpieza',
      '',
      'Válida por 15 días',
    ].join('\n'),
  );
});

test('textoCotizacion omite el impuesto si es 0 y lo que está vacío', () => {
  const sinGuardar = {
    numero: 0,
    fecha: '',
    lineas: [{ descripcion: 'Poda', cantidad: 1, precio: 20000 }],
    notas: '  ',
  };
  assert.equal(
    textoCotizacion(sinGuardar, { nombre: '', impuesto: 0, nota: '' }),
    'Cotización\n\n1 x Poda: $200.00\n\nSubtotal: $200.00\nTotal: $200.00',
  );
});

test('textoCotizacion no falla con datos incompletos', () => {
  assert.equal(textoCotizacion(undefined, undefined), 'Cotización\n\nSubtotal: $0.00\nTotal: $0.00');
  assert.equal(
    textoCotizacion({ numero: 7, fecha: 'ayer', lineas: 'x' }, {}),
    'Cotización n.º 7 · ayer\n\nSubtotal: $0.00\nTotal: $0.00',
  );
});

test('enlaceWhatsApp conserva los dígitos si el teléfono empieza con +', () => {
  assert.equal(
    enlaceWhatsApp('+52 55-1234-5678', 'Hola', '1'),
    'https://wa.me/525512345678?text=Hola',
  );
});

test('enlaceWhatsApp antepone el código de país a teléfonos de hasta 10 dígitos', () => {
  assert.equal(
    enlaceWhatsApp('(555) 010-2430', 'Hola', '1'),
    'https://wa.me/15550102430?text=Hola',
  );
});

test('enlaceWhatsApp no antepone el código a teléfonos con más de 10 dígitos', () => {
  assert.equal(
    enlaceWhatsApp('52 55-1234-5678', 'Hola', '1'),
    'https://wa.me/525512345678?text=Hola',
  );
});

test('enlaceWhatsApp sin teléfono no pone número', () => {
  assert.equal(enlaceWhatsApp('', 'Hola mundo', '1'), 'https://wa.me/?text=Hola%20mundo');
  assert.equal(enlaceWhatsApp(undefined, 'Hola mundo', '1'), 'https://wa.me/?text=Hola%20mundo');
  assert.equal(enlaceWhatsApp(' - ', 'Hola mundo', '1'), 'https://wa.me/?text=Hola%20mundo');
});

test('enlaceWhatsApp codifica acentos, saltos de línea y símbolos', () => {
  assert.equal(
    enlaceWhatsApp('555', 'Cotización n.º 1\nVálida', '1'),
    'https://wa.me/1555?text=Cotizaci%C3%B3n%20n.%C2%BA%201%0AV%C3%A1lida',
  );
  assert.equal(
    enlaceWhatsApp('555', 'A & B = $5', '1'),
    'https://wa.me/1555?text=A%20%26%20B%20%3D%20%245',
  );
});

test('el texto de la cotización llega igual dentro del enlace', () => {
  const texto = textoCotizacion(cotizacion, negocio);
  const enlace = enlaceWhatsApp(cotizacion.cliente.telefono, texto, negocio.codigoPais);
  assert.ok(enlace.startsWith('https://wa.me/15512345678?text='));
  assert.equal(new URL(enlace).searchParams.get('text'), texto);
});

const textoEspanol = [
  'Plomería Ruiz',
  'Cotización n.º 3 · 15/01/2026',
  '',
  '2 x Cambio de llave: $700.00',
  '1 x Material: $10.50',
  '',
  'Subtotal: $710.50',
  'Impuesto: $113.68',
  'Total: $824.18',
  '',
  'Incluye limpieza',
  '',
  'Válida por 15 días',
].join('\n');

test('textoCotizacion en español, también si falta el idioma', () => {
  assert.equal(textoCotizacion(cotizacion, negocio, 'es'), textoEspanol);
  assert.equal(textoCotizacion(cotizacion, negocio), textoEspanol);
  assert.equal(textoCotizacion(cotizacion, negocio, undefined), textoEspanol);
  assert.equal(textoCotizacion(cotizacion, negocio, null), textoEspanol);
});

test('textoCotizacion en inglés, con la fecha en inglés', () => {
  assert.equal(
    textoCotizacion(cotizacion, negocio, 'en'),
    [
      'Plomería Ruiz',
      'Quote no. 3 · 01/15/2026',
      '',
      '2 x Cambio de llave: $700.00',
      '1 x Material: $10.50',
      '',
      'Subtotal: $710.50',
      'Tax: $113.68',
      'Total: $824.18',
      '',
      'Incluye limpieza',
      '',
      'Válida por 15 días',
    ].join('\n'),
  );
});

test('textoCotizacion en inglés omite el impuesto si es 0 y no falla con datos incompletos', () => {
  const sinGuardar = {
    numero: 0,
    fecha: '',
    lineas: [{ descripcion: 'Poda', cantidad: 1, precio: 20000 }],
  };
  assert.equal(
    textoCotizacion(sinGuardar, { nombre: '', impuesto: 0, nota: '' }, 'en'),
    'Quote\n\n1 x Poda: $200.00\n\nSubtotal: $200.00\nTotal: $200.00',
  );
  assert.equal(textoCotizacion(undefined, undefined, 'en'), 'Quote\n\nSubtotal: $0.00\nTotal: $0.00');
  assert.equal(
    textoCotizacion({ numero: 7, fecha: 'ayer', lineas: 'x' }, {}, 'en'),
    'Quote no. 7 · ayer\n\nSubtotal: $0.00\nTotal: $0.00',
  );
});

test('el dinero queda como "$1,234.50" en los dos idiomas', () => {
  const grande = { numero: 0, fecha: '', lineas: [{ descripcion: 'Techo', cantidad: 1, precio: 123450 }] };
  assert.equal(
    textoCotizacion(grande, { impuesto: 0 }, 'es'),
    'Cotización\n\n1 x Techo: $1,234.50\n\nSubtotal: $1,234.50\nTotal: $1,234.50',
  );
  assert.equal(
    textoCotizacion(grande, { impuesto: 0 }, 'en'),
    'Quote\n\n1 x Techo: $1,234.50\n\nSubtotal: $1,234.50\nTotal: $1,234.50',
  );
});
