// Cálculos de la cotización. El dinero siempre va en centavos enteros.
// Sin acceso a la página, para poder probarlo con node --test.

function aNumero(valor) {
  const numero = Number(String(valor ?? '').trim().replace(',', '.'));
  return Number.isFinite(numero) ? numero : 0;
}

// "10.50" o "10,50" -> 1050. Vacío o inválido -> 0.
// Se lee como texto para no perder centavos con decimales flotantes.
export function aCentavos(texto) {
  const limpio = String(texto ?? '').trim().replace(',', '.');
  const partes = /^(\d*)(?:\.(\d*))?$/.exec(limpio);
  if (!partes || !/\d/.test(limpio)) return 0;
  const entero = Number(partes[1] || '0');
  const decimales = ((partes[2] || '') + '000').slice(0, 3);
  const centavos = entero * 100 + Number(decimales.slice(0, 2));
  return decimales[2] >= '5' ? centavos + 1 : centavos;
}

// Cantidad por precio (en centavos), redondeado al centavo.
export function totalLinea(linea) {
  if (!linea) return 0;
  return Math.round(aNumero(linea.cantidad) * aNumero(linea.precio));
}

export function subtotal(lineas) {
  if (!Array.isArray(lineas)) return 0;
  return lineas.reduce((suma, linea) => suma + totalLinea(linea), 0);
}

// Impuesto redondeado al centavo.
export function impuesto(subtotalCentavos, porcentaje) {
  const bruto = (aNumero(subtotalCentavos) * aNumero(porcentaje)) / 100;
  // toFixed corrige errores como 12877.499999… antes de redondear.
  return Math.round(Number(bruto.toFixed(6)));
}

export function total(lineas, porcentaje) {
  const base = subtotal(lineas);
  return base + impuesto(base, porcentaje);
}

// 123450 -> "$1,234.50"
export function formatoDinero(centavos) {
  const redondeado = Math.round(aNumero(centavos));
  const signo = redondeado < 0 ? '-' : '';
  const absoluto = Math.abs(redondeado);
  const enteros = String(Math.floor(absoluto / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const resto = String(absoluto % 100).padStart(2, '0');
  return `${signo}$${enteros}.${resto}`;
}
