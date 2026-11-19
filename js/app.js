// Une la página con los módulos: formulario de cotización, historial, "Mi negocio" y barra de secciones.

import { aCentavos, totalLinea, subtotal, impuesto, total, formatoDinero } from './calc.js';
import { crearStore } from './store.js';
import { textoCotizacion, enlaceWhatsApp } from './share.js';

const store = crearStore(localStorage);

// Datos de "Mi negocio"; su porcentaje de impuesto se usa en los totales.
let negocio = store.leerNegocio();

// La cotización del formulario: número 0 y sin fecha mientras no se guarde.
let abierta = { numero: 0, fecha: '' };

const formulario = document.getElementById('form-cotizacion');
const listaLineas = document.getElementById('lineas');
const plantillaLinea = document.getElementById('plantilla-linea');
const botonAnadir = document.getElementById('anadir-linea');
const salidaSubtotal = document.getElementById('total-subtotal');
const salidaImpuesto = document.getElementById('total-impuesto');
const salidaTotal = document.getElementById('total-total');
const numeroCotizacion = document.getElementById('cotizacion-numero');
const estadoCotizacion = document.getElementById('cotizacion-estado');
const botonGuardar = document.getElementById('guardar-cotizacion');
const botonNueva = document.getElementById('nueva-cotizacion');
const botonWhatsApp = document.getElementById('enviar-whatsapp');
const botonImprimir = document.getElementById('imprimir-cotizacion');
const hoja = document.getElementById('hoja-impresion');
const tablaHoja = document.getElementById('hoja-tabla');
const lineasHoja = document.getElementById('hoja-lineas');
const listaHistorial = document.getElementById('lista-historial');
const plantillaHistorial = document.getElementById('plantilla-historial');
const historialVacio = document.getElementById('historial-vacio');
const estadoHistorial = document.getElementById('historial-estado');
const botonesSeccion = document.querySelectorAll('.barra [data-seccion]');
const formularioNegocio = document.getElementById('form-negocio');
const estadoNegocio = document.getElementById('negocio-estado');
const dialogoBorrar = document.getElementById('confirmar-borrado');
const textoBorrar = document.getElementById('confirmar-texto');

// Para dar a cada campo de línea un id único, aunque se quiten líneas.
let siguienteLinea = 1;

function campo(fila, nombre) {
  return fila.querySelector(`[data-campo="${nombre}"]`);
}

function aTexto(valor) {
  return valor === null || valor === undefined ? '' : String(valor);
}

// 1050 -> "10.50". 0 queda vacío para que se vea el "0.00" de ejemplo.
function precioTexto(centavos) {
  const valor = Math.round(Number(centavos));
  if (!Number.isFinite(valor) || valor <= 0) return '';
  return `${Math.floor(valor / 100)}.${String(valor % 100).padStart(2, '0')}`;
}

// Fecha ISO -> "19 nov 2026". Si no es una fecha, se muestra tal cual.
function formatoFecha(fecha) {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return aTexto(fecha);
  return valor.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
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
  campos.codigoPais.value = negocio.codigoPais;
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
      codigoPais: campos.codigoPais.value,
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

function mostrarNumero() {
  numeroCotizacion.textContent = abierta.numero
    ? `Cotización n.º ${abierta.numero} · ${formatoFecha(abierta.fecha)}`
    : 'Cotización nueva, sin guardar';
}

// La cotización escrita en el formulario; las líneas vacías no se guardan.
function leerFormulario() {
  const campos = formulario.elements;
  return {
    cliente: {
      nombre: campos.clienteNombre.value.trim(),
      telefono: campos.clienteTelefono.value.trim(),
    },
    lineas: leerLineas().filter((linea) => linea.descripcion || linea.precio),
    notas: campos.notas.value.trim(),
  };
}

// Pone una cotización guardada en el formulario. Lo guardado puede venir
// incompleto, así que cada dato se lee con cuidado.
function llenarFormulario(cotizacion) {
  const campos = formulario.elements;
  const cliente = cotizacion.cliente ?? {};
  campos.clienteNombre.value = aTexto(cliente.nombre);
  campos.clienteTelefono.value = aTexto(cliente.telefono);
  campos.notas.value = aTexto(cotizacion.notas);

  listaLineas.replaceChildren();
  const lineas = Array.isArray(cotizacion.lineas) ? cotizacion.lineas : [];
  for (const linea of lineas) {
    const fila = anadirLinea();
    campo(fila, 'descripcion').value = aTexto(linea?.descripcion);
    campo(fila, 'cantidad').value = aTexto(linea?.cantidad);
    campo(fila, 'precio').value = precioTexto(linea?.precio);
  }
  if (!lineas.length) anadirLinea();
  recalcular();
}

// Se envían el número y la fecha de la abierta para que store.js la
// reemplace sin cambiarle la fecha; si es nueva, store.js le da número.
function guardarCotizacion() {
  let guardada;
  try {
    guardada = store.guardarCotizacion({ ...leerFormulario(), ...abierta });
  } catch {
    estadoCotizacion.textContent = 'No se pudo guardar. Revisa que el navegador permita guardar datos.';
    return;
  }
  abierta = { numero: guardada.numero, fecha: guardada.fecha };
  mostrarNumero();
  estadoCotizacion.textContent = `Cotización n.º ${guardada.numero} guardada.`;
}

function nuevaCotizacion() {
  formulario.reset();
  listaLineas.replaceChildren();
  anadirLinea();
  abierta = { numero: 0, fecha: '' };
  mostrarNumero();
  estadoCotizacion.textContent = '';
  formulario.elements.clienteNombre.focus();
}

// Abre WhatsApp en una pestaña nueva con la cotización del formulario,
// dirigida al teléfono del cliente (si no hay, WhatsApp deja elegir).
function enviarWhatsApp() {
  const cotizacion = { ...leerFormulario(), ...abierta };
  const texto = textoCotizacion(cotizacion, negocio);
  window.open(
    enlaceWhatsApp(cotizacion.cliente.telefono, texto, negocio.codigoPais),
    '_blank',
    'noopener',
  );
}

// Pone un texto en la hoja de impresión; si queda vacío, no se imprime.
function ponerHoja(nombre, texto) {
  const elemento = hoja.querySelector(`[data-hoja="${nombre}"]`);
  elemento.textContent = texto;
  (elemento.closest('[data-hoja-fila]') ?? elemento).hidden = !texto;
}

// Llena la hoja que se ve al imprimir con la cotización del formulario.
// Sin guardar no tiene número, y lleva la fecha de hoy.
function llenarHoja() {
  const cotizacion = leerFormulario();
  const base = subtotal(cotizacion.lineas);
  const cargo = impuesto(base, negocio.impuesto);
  const cliente = [cotizacion.cliente.nombre, cotizacion.cliente.telefono].filter(Boolean).join(' · ');

  ponerHoja('negocio-nombre', negocio.nombre);
  ponerHoja('negocio-telefono', negocio.telefono ? `Tel. ${negocio.telefono}` : '');
  ponerHoja('numero', abierta.numero ? `N.º ${abierta.numero}` : 'Sin guardar');
  ponerHoja('fecha', formatoFecha(abierta.fecha || new Date().toISOString()));
  ponerHoja('cliente', cliente);

  const filas = cotizacion.lineas.map((linea) => {
    const fila = document.createElement('tr');
    const textos = [
      linea.descripcion,
      aTexto(linea.cantidad).trim(),
      formatoDinero(linea.precio),
      formatoDinero(totalLinea(linea)),
    ];
    for (const texto of textos) {
      const celda = document.createElement('td');
      celda.textContent = texto;
      fila.append(celda);
    }
    return fila;
  });
  lineasHoja.replaceChildren(...filas);
  tablaHoja.hidden = !filas.length;

  ponerHoja('subtotal', formatoDinero(base));
  ponerHoja('impuesto', cargo > 0 ? formatoDinero(cargo) : '');
  ponerHoja('total', formatoDinero(base + cargo));
  ponerHoja('notas', cotizacion.notas);
  ponerHoja('nota', negocio.nota);
}

function imprimirCotizacion() {
  llenarHoja();
  window.print();
}

function dato(fila, nombre) {
  return fila.querySelector(`[data-dato="${nombre}"]`);
}

// De la más nueva a la más vieja, como las da store.js.
function mostrarHistorial() {
  const filas = store.listarCotizaciones().map((cotizacion) => {
    const fila = plantillaHistorial.content.firstElementChild.cloneNode(true);
    fila.dataset.numero = String(cotizacion.numero);
    dato(fila, 'numero').textContent = `N.º ${cotizacion.numero}`;
    dato(fila, 'fecha').textContent = formatoFecha(cotizacion.fecha);
    dato(fila, 'cliente').textContent = aTexto(cotizacion.cliente?.nombre).trim() || 'Sin nombre de cliente';
    dato(fila, 'total').textContent = `Total: ${formatoDinero(total(cotizacion.lineas, negocio.impuesto))}`;
    // Cada botón dice a qué cotización se refiere, para lectores de pantalla.
    for (const boton of fila.querySelectorAll('[data-accion]')) {
      boton.setAttribute('aria-label', `${boton.textContent} cotización ${cotizacion.numero}`);
    }
    return fila;
  });
  listaHistorial.replaceChildren(...filas);
  historialVacio.hidden = filas.length > 0;
}

// "Abrir" sigue editando esa cotización; "Duplicar" la copia como nueva, sin número.
function cargarCotizacion(numero, comoNueva) {
  const cotizacion = store.leerCotizacion(numero);
  if (!cotizacion) {
    mostrarHistorial();
    estadoHistorial.textContent = 'Esa cotización ya no existe.';
    return;
  }
  llenarFormulario(cotizacion);
  abierta = comoNueva
    ? { numero: 0, fecha: '' }
    : { numero: cotizacion.numero, fecha: aTexto(cotizacion.fecha) };
  mostrarNumero();
  estadoCotizacion.textContent = comoNueva
    ? `Copia de la n.º ${numero}. Pulsa "Guardar" para darle número.`
    : '';
  mostrarSeccion('cotizacion');
  formulario.elements.clienteNombre.focus();
}

// Muestra el cuadro de confirmación; da true solo si se pulsa "Borrar".
// Escape lo cierra sin cambiar returnValue, así que cuenta como "Cancelar".
function confirmarBorrado(texto) {
  textoBorrar.textContent = texto;
  dialogoBorrar.returnValue = '';
  dialogoBorrar.showModal();
  return new Promise((resolver) => {
    dialogoBorrar.addEventListener('close', () => resolver(dialogoBorrar.returnValue === 'borrar'), {
      once: true,
    });
  });
}

async function borrarCotizacion(numero) {
  if (!(await confirmarBorrado(`¿Borrar la cotización n.º ${numero}? No se puede deshacer.`))) return;
  let borrada;
  try {
    borrada = store.borrarCotizacion(numero);
  } catch {
    estadoHistorial.textContent = 'No se pudo borrar. Revisa que el navegador permita guardar datos.';
    return;
  }
  // Si estaba abierta, lo que queda en el formulario pasa a ser una nueva.
  if (abierta.numero === numero) {
    abierta = { numero: 0, fecha: '' };
    mostrarNumero();
  }
  mostrarHistorial();
  estadoHistorial.textContent = borrada
    ? `Cotización n.º ${numero} borrada.`
    : 'Esa cotización ya no existía.';
}

// Muestra la sección elegida, oculta las otras y marca su botón.
// El historial se vuelve a armar cada vez, con el impuesto actual.
function mostrarSeccion(id) {
  if (id === 'historial') {
    mostrarHistorial();
    estadoHistorial.textContent = '';
  }
  for (const boton of botonesSeccion) {
    const activa = boton.dataset.seccion === id;
    document.getElementById(boton.dataset.seccion).hidden = !activa;
    if (activa) boton.setAttribute('aria-current', 'page');
    else boton.removeAttribute('aria-current');
  }
  window.scrollTo(0, 0);
}

formulario.addEventListener('input', recalcular);

// Al cambiar algo, el aviso de "guardada" ya no vale.
formulario.addEventListener('input', () => {
  estadoCotizacion.textContent = '';
});

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

botonGuardar.addEventListener('click', guardarCotizacion);
botonNueva.addEventListener('click', nuevaCotizacion);
botonWhatsApp.addEventListener('click', enviarWhatsApp);
botonImprimir.addEventListener('click', imprimirCotizacion);

// También al imprimir desde el menú del navegador (Ctrl+P).
window.addEventListener('beforeprint', llenarHoja);

listaHistorial.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) return;
  const numero = Number(boton.closest('.cotizacion-guardada').dataset.numero);
  const accion = boton.dataset.accion;
  if (accion === 'abrir') cargarCotizacion(numero, false);
  else if (accion === 'duplicar') cargarCotizacion(numero, true);
  else if (accion === 'borrar') borrarCotizacion(numero);
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

// Servicios guardados en "Mi negocio". Se sugieren en la descripción de
// cada línea y, al elegir uno, se pone su precio.

const listaServicios = document.getElementById('lista-servicios');
const plantillaServicio = document.getElementById('plantilla-servicio');
const serviciosVacio = document.getElementById('servicios-vacio');
const estadoServicios = document.getElementById('servicios-estado');
const formularioServicio = document.getElementById('form-servicio');
const sugerencias = document.getElementById('servicios-sugeridos');

// Los servicios como los da store.js, para buscar el precio al escribir.
let servicios = [];

// Arma la lista de "Mi negocio" y las sugerencias de las líneas.
function mostrarServicios() {
  servicios = store.listarServicios();
  const filas = servicios.map((servicio) => {
    const fila = plantillaServicio.content.firstElementChild.cloneNode(true);
    fila.dataset.descripcion = servicio.descripcion;
    dato(fila, 'descripcion').textContent = servicio.descripcion;
    dato(fila, 'precio').textContent = formatoDinero(servicio.precio);
    const boton = fila.querySelector('[data-accion="borrar"]');
    boton.setAttribute('aria-label', `Borrar servicio ${servicio.descripcion}`);
    return fila;
  });
  listaServicios.replaceChildren(...filas);
  serviciosVacio.hidden = filas.length > 0;

  const opciones = servicios.map((servicio) => {
    const opcion = document.createElement('option');
    opcion.value = servicio.descripcion;
    return opcion;
  });
  sugerencias.replaceChildren(...opciones);
}

// Como en store.js: "  Cambio de Llave " y "cambio de llave" son el mismo.
function buscarServicio(descripcion) {
  const clave = aTexto(descripcion).trim().toLowerCase();
  if (!clave) return undefined;
  return servicios.find((servicio) => servicio.descripcion.toLowerCase() === clave);
}

function anadirServicio() {
  const campos = formularioServicio.elements;
  let guardado;
  try {
    guardado = store.guardarServicio({
      descripcion: campos.descripcion.value,
      precio: aCentavos(campos.precio.value),
    });
  } catch {
    estadoServicios.textContent = 'No se pudo guardar. Revisa que el navegador permita guardar datos.';
    return;
  }
  if (!guardado) {
    estadoServicios.textContent = 'Escribe la descripción del servicio.';
    campos.descripcion.focus();
    return;
  }
  mostrarServicios();
  formularioServicio.reset();
  campos.descripcion.focus();
  estadoServicios.textContent = `Servicio "${guardado.descripcion}" guardado.`;
}

async function borrarServicio(descripcion) {
  if (!(await confirmarBorrado(`¿Borrar el servicio "${descripcion}"?`))) return;
  let borrado;
  try {
    borrado = store.borrarServicio(descripcion);
  } catch {
    estadoServicios.textContent = 'No se pudo borrar. Revisa que el navegador permita guardar datos.';
    return;
  }
  mostrarServicios();
  formularioServicio.elements.descripcion.focus();
  estadoServicios.textContent = borrado
    ? `Servicio "${descripcion}" borrado.`
    : 'Ese servicio ya no existía.';
}

// Al elegir (o escribir) un servicio guardado en la descripción, se pone su
// precio y se marca como puesto solo. Si luego se vacía la descripción y el
// precio sigue sin tocar, se quita. Va en la lista de líneas para que ocurra
// antes de recalcular.
listaLineas.addEventListener('input', (evento) => {
  const entrada = evento.target;
  const nombre = entrada.dataset?.campo;
  // Un precio escrito a mano ya no se quita al vaciar la descripción.
  if (nombre === 'precio') {
    delete entrada.dataset.automatico;
    return;
  }
  if (nombre !== 'descripcion') return;
  const precio = campo(entrada.closest('.linea'), 'precio');
  const servicio = buscarServicio(entrada.value);
  if (servicio) {
    precio.value = precioTexto(servicio.precio);
    precio.dataset.automatico = '';
  } else if (!entrada.value.trim() && 'automatico' in precio.dataset) {
    precio.value = '';
    delete precio.dataset.automatico;
  }
});

formularioServicio.addEventListener('submit', (evento) => {
  evento.preventDefault();
  anadirServicio();
});

formularioServicio.addEventListener('input', () => {
  estadoServicios.textContent = '';
});

listaServicios.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-accion="borrar"]');
  if (!boton) return;
  borrarServicio(boton.closest('.servicio-guardado').dataset.descripcion);
});

mostrarNegocio();
mostrarServicios();
mostrarNumero();
anadirLinea();
