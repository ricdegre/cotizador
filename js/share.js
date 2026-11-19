// Arma el texto de la cotización y el enlace de WhatsApp.
// Sin acceso a la página, para poder probarlo con node --test.

import { totalLinea, subtotal, impuesto, formatoDinero } from './calc.js';

function aTexto(valor) {
  return valor === null || valor === undefined ? '' : String(valor).trim();
}

// Fecha ISO -> "19/11/2026", en la hora local. Si no es una fecha, se deja tal cual.
function formatoFecha(fecha) {
  const texto = aTexto(fecha);
  const valor = new Date(texto);
  if (!texto || Number.isNaN(valor.getTime())) return texto;
  const dia = String(valor.getDate()).padStart(2, '0');
  const mes = String(valor.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${valor.getFullYear()}`;
}

// "Cotización n.º 3 · 19/11/2026". Sin guardar no tiene número ni fecha.
function encabezado(cotizacion) {
  let titulo = 'Cotización';
  if (Number(cotizacion.numero) > 0) titulo += ` n.º ${cotizacion.numero}`;
  const fecha = formatoFecha(cotizacion.fecha);
  return fecha ? `${titulo} · ${fecha}` : titulo;
}

// "2 x Cambio de llave: $700.00"
function textoLinea(linea) {
  return `${aTexto(linea?.cantidad)} x ${aTexto(linea?.descripcion)}: ${formatoDinero(totalLinea(linea))}`;
}

// Texto para enviar: negocio, número y fecha, líneas, totales, notas y nota al pie.
// El impuesto solo aparece si es mayor que 0. Los bloques van separados por una línea en blanco.
export function textoCotizacion(cotizacion, negocio) {
  const datos = cotizacion ?? {};
  const lineas = Array.isArray(datos.lineas) ? datos.lineas : [];
  const base = subtotal(lineas);
  const cargo = impuesto(base, negocio?.impuesto ?? 0);

  const nombre = aTexto(negocio?.nombre);
  const partes = [nombre ? `${nombre}\n${encabezado(datos)}` : encabezado(datos)];
  if (lineas.length) partes.push(lineas.map(textoLinea).join('\n'));

  const totales = [`Subtotal: ${formatoDinero(base)}`];
  if (cargo > 0) totales.push(`Impuesto: ${formatoDinero(cargo)}`);
  totales.push(`Total: ${formatoDinero(base + cargo)}`);
  partes.push(totales.join('\n'));

  const notas = aTexto(datos.notas);
  if (notas) partes.push(notas);
  const nota = aTexto(negocio?.nota);
  if (nota) partes.push(nota);
  return partes.join('\n\n');
}

// "+52 55-1234-5678" -> "https://wa.me/525512345678?text=...".
// Sin teléfono, WhatsApp deja elegir a quién enviarlo.
export function enlaceWhatsApp(telefono, texto) {
  const digitos = String(telefono ?? '').replace(/\D/g, '');
  return `https://wa.me/${digitos}?text=${encodeURIComponent(String(texto ?? ''))}`;
}
