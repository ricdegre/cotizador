// Une la página con los módulos: formulario de cotización, "Mi negocio" y barra de secciones.

import { aCentavos, subtotal, impuesto, formatoDinero } from './calc.js';
import { crearStore } from './store.js';

const store = crearStore(localStorage);

// Datos de "Mi negocio"; su porcentaje de impuesto se usa en los totales.
let negocio = store.leerNegocio();

const formulario = document.getElementById('form-cotizacion');
const listaLineas = document.getElementById('lineas');
const plantillaLinea = document.getElementById('plantilla-linea');
const botonAnadir = document.getElementById('anadir-linea');
const salidaSubtotal = document.getElementById('total-subtotal');
const salidaImpuesto = document.getElementById('total-impuesto');
const salidaTotal = document.getElementById('total-total');
const botonesSeccion = document.querySelectorAll('.barra [data-seccion]');
const formularioNegocio = document.getElementById('form-negocio');
const estadoNegocio = document.getElementById('negocio-estado');

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
  const cargo = impuesto(base, negocio.impuesto);
  salidaSubtotal.textContent = formatoDinero(base);
  salidaImpuesto.textContent = formatoDinero(cargo);
  salidaTotal.textContent = formatoDinero(base + cargo);
}

// Pone en el formulario de "Mi negocio" los datos guardados.
function mostrarNegocio() {
  const campos = formularioNegocio.elements;
  campos.nombre.value = negocio.nombre;
  campos.telefono.value = negocio.telefono;
  campos.impuesto.value = String(negocio.impuesto);
  campos.nota.value = negocio.nota;
}

// store.js limpia los datos (impuesto inválido -> 0); se muestran ya limpios.
function guardarNegocio() {
  const campos = formularioNegocio.elements;
  try {
    negocio = store.guardarNegocio({
      nombre: campos.nombre.value.trim(),
      telefono: campos.telefono.value.trim(),
      impuesto: campos.impuesto.value,
      nota: campos.nota.value.trim(),
    });
  } catch {
    estadoNegocio.textContent = 'No se pudo guardar. Revisa que el navegador permita guardar datos.';
    return;
  }
  mostrarNegocio();
  recalcular();
  estadoNegocio.textContent = 'Datos guardados.';
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

formularioNegocio.addEventListener('submit', (evento) => {
  evento.preventDefault();
  guardarNegocio();
});

// Al cambiar algo, el aviso de "guardados" ya no vale.
formularioNegocio.addEventListener('input', () => {
  estadoNegocio.textContent = '';
});

mostrarNegocio();
anadirLinea();
