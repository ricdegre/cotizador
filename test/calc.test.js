import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  aCentavos,
  totalLinea,
  subtotal,
  impuesto,
  total,
  formatoDinero,
} from '../js/calc.js';

const lineas = [
  { descripcion: 'Material', cantidad: 1, precio: aCentavos('10.50') },
  { descripcion: 'Mano de obra', cantidad: 1, precio: aCentavos('2.25') },
];

test('aCentavos acepta punto o coma decimal', () => {
  assert.equal(aCentavos('10.50'), 1050);
  assert.equal(aCentavos('10,50'), 1050);
  assert.equal(aCentavos('10.5'), 1050);
  assert.equal(aCentavos('10'), 1000);
  assert.equal(aCentavos(' 3.99 '), 399);
  assert.equal(aCentavos('.75'), 75);
});

test('aCentavos redondea al centavo', () => {
  assert.equal(aCentavos('0.005'), 1);
  assert.equal(aCentavos('0.004'), 0);
  assert.equal(aCentavos('1.005'), 101);
});

test('aCentavos da 0 si está vacío o es inválido', () => {
  assert.equal(aCentavos(''), 0);
  assert.equal(aCentavos('   '), 0);
  assert.equal(aCentavos(undefined), 0);
  assert.equal(aCentavos(null), 0);
  assert.equal(aCentavos('abc'), 0);
  assert.equal(aCentavos('1.2.3'), 0);
  assert.equal(aCentavos('.'), 0);
  assert.equal(aCentavos('-5'), 0);
});

test('totalLinea multiplica cantidad por precio', () => {
  assert.equal(totalLinea({ cantidad: 3, precio: 1050 }), 3150);
  assert.equal(totalLinea({ cantidad: '2,5', precio: 400 }), 1000);
  assert.equal(totalLinea({ cantidad: 0.333, precio: 100 }), 33);
});

test('totalLinea da 0 con datos vacíos', () => {
  assert.equal(totalLinea({ cantidad: '', precio: 1000 }), 0);
  assert.equal(totalLinea({ cantidad: 'x', precio: 1000 }), 0);
  assert.equal(totalLinea(undefined), 0);
});

test('subtotal: 10.50 + 2.25 = 12.75', () => {
  assert.equal(subtotal(lineas), 1275);
  assert.equal(formatoDinero(subtotal(lineas)), '$12.75');
});

test('subtotal de una lista vacía es 0', () => {
  assert.equal(subtotal([]), 0);
  assert.equal(subtotal(undefined), 0);
});

test('impuesto de 10.1% se redondea al centavo', () => {
  // 1275 * 10.1% = 128.775 -> 129
  assert.equal(impuesto(1275, 10.1), 129);
  // 1050 * 10.1% = 106.05 -> 106
  assert.equal(impuesto(1050, 10.1), 106);
});

test('impuesto con porcentajes comunes', () => {
  assert.equal(impuesto(1000, 16), 160);
  assert.equal(impuesto(1000, 0), 0);
  assert.equal(impuesto(0, 16), 0);
});

test('total suma subtotal e impuesto', () => {
  assert.equal(total(lineas, 0), 1275);
  assert.equal(total(lineas, 10.1), 1404);
  assert.equal(total([], 16), 0);
});

test('formatoDinero usa $, comas de miles y dos decimales', () => {
  assert.equal(formatoDinero(123450), '$1,234.50');
  assert.equal(formatoDinero(1275), '$12.75');
  assert.equal(formatoDinero(0), '$0.00');
  assert.equal(formatoDinero(5), '$0.05');
  assert.equal(formatoDinero(100000), '$1,000.00');
  assert.equal(formatoDinero(123456789), '$1,234,567.89');
  assert.equal(formatoDinero(-1050), '-$10.50');
});
