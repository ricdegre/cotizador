// Une la página con los módulos: formulario de cotización y barra de secciones.

import { aCentavos, subtotal, impuesto, formatoDinero } from './calc.js';

// Por ahora no se cobra impuesto; luego vendrá de "Mi negocio".
const PORCENTAJE_IMPUESTO = 0;

const formulario = document.getElementById('form-cotizacion');
const listaLineas = document.getElementById('lineas');
const plantillaLinea = document.getElementById('plantilla-linea');
const botonAnadir = document.getElementById('anadir-linea');
const salidaSubtotal = document.getElementById('total-subtotal');
const salidaImpuesto = document.getElementById('total-impuesto');
const salidaTotal = document.getElementById('total-total');
const botonesSeccion = document.querySelectorAll('.barra [data-seccion]');

// Para dar a cada campo de línea un id único, aunque se quiten líneas.
let siguienteLinea = 1;

function campo(fila, nombre) {
  return fila.querySelector(`[data-campo="${nombre}"]`);
}

// Las líneas del formulario, con el precio en centavos.
function leerLineas() {
  return [...listaLineas.querySelectorAll('.linea')].map((fila) => ({
    descripcion: campo(fila, 'descripcion').value.trim(),
    cantidad: campo(fila, 'cantidad').value,
    precio: aCentavos(campo(fila, 'precio').value),
  }));
}

function recalcular() {
  const base = subtotal(leerLineas());
  const cargo = impuesto(base, PORCENTAJE_IMPUESTO);
  salidaSubtotal.textContent = formatoDinero(base);
  salidaImpuesto.textContent = formatoDinero(cargo);
  salidaTotal.textContent = formatoDinero(base + cargo);
}

// Copia la plantilla y une cada etiqueta con su campo por id.
function anadirLinea() {
  const fila = plantillaLinea.content.firstElementChild.cloneNode(true);
  const numero = siguienteLinea++;
  for (const entrada of fila.querySelectorAll('[data-campo]')) {
    const nombre = entrada.dataset.campo;
    entrada.id = `linea-${numero}-${nombre}`;
    fila.querySelector(`label[data-para="${nombre}"]`).htmlFor = entrada.id;
  }
  listaLineas.append(fila);
  recalcular();
  return fila;
}

// Siempre queda al menos una línea para escribir.
function quitarLinea(fila) {
  fila.remove();
  if (!listaLineas.querySelector('.linea')) anadirLinea();
  recalcular();
}

// Muestra la sección elegida, oculta las otras y marca su botón.
function mostrarSeccion(id) {
  for (const boton of botonesSeccion) {
    const activa = boton.dataset.seccion === id;
    document.getElementById(boton.dataset.seccion).hidden = !activa;
    if (activa) boton.setAttribute('aria-current', 'page');
    else boton.removeAttribute('aria-current');
  }
  window.scrollTo(0, 0);
}

formulario.addEventListener('input', recalcular);

// Enter en un campo no debe recargar la página.
formulario.addEventListener('submit', (evento) => evento.preventDefault());

botonAnadir.addEventListener('click', () => {
  campo(anadirLinea(), 'descripcion').focus();
});

listaLineas.addEventListener('click', (evento) => {
  const boton = evento.target.closest('.quitar-linea');
  if (!boton) return;
  quitarLinea(boton.closest('.linea'));
  botonAnadir.focus();
});

for (const boton of botonesSeccion) {
  boton.addEventListener('click', () => mostrarSeccion(boton.dataset.seccion));
}

anadirLinea();
