import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textoCotizacion, enlaceWhatsApp } from '../js/share.js';

const negocio = {
  nombre: 'Plomería Ruiz',
  telefono: '555 123 4567',
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

test('enlaceWhatsApp deja solo los dígitos del teléfono', () => {
  assert.equal(enlaceWhatsApp('+52 55-1234-5678', 'Hola'), 'https://wa.me/525512345678?text=Hola');
  assert.equal(enlaceWhatsApp('(555) 123 - 4567', 'Hola'), 'https://wa.me/5551234567?text=Hola');
});

test('enlaceWhatsApp sin teléfono no pone número', () => {
  assert.equal(enlaceWhatsApp('', 'Hola mundo'), 'https://wa.me/?text=Hola%20mundo');
  assert.equal(enlaceWhatsApp(undefined, 'Hola mundo'), 'https://wa.me/?text=Hola%20mundo');
  assert.equal(enlaceWhatsApp(' - ', 'Hola mundo'), 'https://wa.me/?text=Hola%20mundo');
});

test('enlaceWhatsApp codifica acentos, saltos de línea y símbolos', () => {
  assert.equal(
    enlaceWhatsApp('555', 'Cotización n.º 1\nVálida'),
    'https://wa.me/555?text=Cotizaci%C3%B3n%20n.%C2%BA%201%0AV%C3%A1lida',
  );
  assert.equal(enlaceWhatsApp('555', 'A & B = $5'), 'https://wa.me/555?text=A%20%26%20B%20%3D%20%245');
});

test('el texto de la cotización llega igual dentro del enlace', () => {
  const texto = textoCotizacion(cotizacion, negocio);
  const enlace = enlaceWhatsApp(cotizacion.cliente.telefono, texto);
  assert.ok(enlace.startsWith('https://wa.me/5512345678?text='));
  assert.equal(new URL(enlace).searchParams.get('text'), texto);
});
