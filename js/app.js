// Une la página con los módulos: formulario de cotización, historial, "Mi negocio" y barra de secciones.

import { aCentavos, totalLinea, subtotal, impuesto, total, formatoDinero } from './calc.js';
import { crearStore } from './store.js';
import { textoCotizacion, enlaceWhatsApp } from './share.js';
import { t } from './i18n.js';

const store = crearStore(localStorage);

// Datos de "Mi negocio"; su porcentaje de impuesto se usa en los totales.
let negocio = store.leerNegocio();

// Idioma de la página; se guarda con los datos de "Mi negocio".
let idioma = negocio.idioma;

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
const nombreCliente = formulario.elements.clienteNombre;
const telefonoCliente = formulario.elements.clienteTelefono;
const sugerenciasClientes = document.getElementById('clientes-sugeridos');
const listaClientes = document.getElementById('lista-clientes');
const plantillaCliente = document.getElementById('plantilla-cliente');
const clientesVacio = document.getElementById('clientes-vacio');
const estadoClientes = document.getElementById('clientes-estado');
const selectorIdioma = document.getElementById('negocio-idioma');

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

// Fecha ISO -> formato del idioma elegido. Si no es una fecha, se muestra tal cual.
function formatoFecha(fecha) {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return aTexto(fecha);
  const locale = idioma === 'en' ? 'en-US' : 'es';
  return valor.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
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
      // El selector está fuera del formulario; sin esto se volvería a "es".
      idioma,
    });
  } catch {
    estadoNegocio.textContent = t('error.guardar', idioma);
    return;
  }
  mostrarNegocio();
  recalcular();
  estadoNegocio.textContent = t('negocio.guardado', idioma);
}

// Pone los textos del idioma en lo marcado con data-i18n (el texto),
// data-i18n-placeholder (el ejemplo) y data-i18n-aria (aria-label).
function traducir(raiz, lengua) {
  for (const elemento of raiz.querySelectorAll('[data-i18n]')) {
    elemento.textContent = t(elemento.dataset.i18n, lengua);
  }
  for (const elemento of raiz.querySelectorAll('[data-i18n-placeholder]')) {
    elemento.placeholder = t(elemento.dataset.i18nPlaceholder, lengua);
  }
  for (const elemento of raiz.querySelectorAll('[data-i18n-aria]')) {
    elemento.setAttribute('aria-label', t(elemento.dataset.i18nAria, lengua));
  }
}

// querySelectorAll no entra en las <template>, así que su contenido se
// traduce aparte; las filas que se creen después ya salen en el idioma.
function aplicarIdioma(nuevoIdioma) {
  document.documentElement.lang = nuevoIdioma;
  traducir(document, nuevoIdioma);
  document.title = t('app.nombre', nuevoIdioma);
  for (const plantilla of document.querySelectorAll('template')) {
    traducir(plantilla.content, nuevoIdioma);
  }
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
    ? t('cotizacion.numero', idioma, {
        numero: abierta.numero,
        fecha: formatoFecha(abierta.fecha),
      })
    : t('cotizacion.sinGuardar', idioma);
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
    const cotizacion = leerFormulario();
    store.guardarCliente(cotizacion.cliente);
    guardada = store.guardarCotizacion({ ...cotizacion, ...abierta });
  } catch {
    estadoCotizacion.textContent = t('error.guardar', idioma);
    return;
  }
  mostrarClientes();
  abierta = { numero: guardada.numero, fecha: guardada.fecha };
  mostrarNumero();
  estadoCotizacion.textContent = t('cotizacion.guardada', idioma, { numero: guardada.numero });
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
  const texto = textoCotizacion(cotizacion, negocio, idioma);
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
  ponerHoja(
    'negocio-telefono',
    negocio.telefono ? t('hoja.telefono', idioma, { telefono: negocio.telefono }) : '',
  );
  ponerHoja(
    'numero',
    abierta.numero
      ? t('hoja.numero', idioma, { numero: abierta.numero })
      : t('hoja.sinGuardar', idioma),
  );
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
    dato(fila, 'numero').textContent = t('historial.numero', idioma, { numero: cotizacion.numero });
    dato(fila, 'fecha').textContent = formatoFecha(cotizacion.fecha);
    dato(fila, 'cliente').textContent =
      aTexto(cotizacion.cliente?.nombre).trim() || t('historial.sinCliente', idioma);
    dato(fila, 'total').textContent = t('historial.total', idioma, {
      total: formatoDinero(total(cotizacion.lineas, negocio.impuesto)),
    });
    // Cada botón dice a qué cotización se refiere, para lectores de pantalla.
    for (const boton of fila.querySelectorAll('[data-accion]')) {
      boton.setAttribute(
        'aria-label',
        t('historial.accionEtiqueta', idioma, { accion: boton.textContent, numero: cotizacion.numero }),
      );
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
    estadoHistorial.textContent = t('historial.noExiste', idioma);
    return;
  }
  llenarFormulario(cotizacion);
  abierta = comoNueva
    ? { numero: 0, fecha: '' }
    : { numero: cotizacion.numero, fecha: aTexto(cotizacion.fecha) };
  mostrarNumero();
  estadoCotizacion.textContent = comoNueva
    ? t('cotizacion.copia', idioma, { numero })
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
  if (!(await confirmarBorrado(t('confirmar.cotizacion', idioma, { numero })))) return;
  let borrada;
  try {
    borrada = store.borrarCotizacion(numero);
  } catch {
    estadoHistorial.textContent = t('error.borrar', idioma);
    return;
  }
  // Si estaba abierta, lo que queda en el formulario pasa a ser una nueva.
  if (abierta.numero === numero) {
    abierta = { numero: 0, fecha: '' };
    mostrarNumero();
  }
  mostrarHistorial();
  estadoHistorial.textContent = borrada
    ? t('historial.borrada', idioma, { numero })
    : t('historial.noExistia', idioma);
}

// Muestra la sección elegida, oculta las otras y marca su botón.
// El historial se vuelve a armar cada vez, con el impuesto actual.
function mostrarSeccion(id) {
  if (id === 'historial') {
    mostrarHistorial();
    estadoHistorial.textContent = '';
  }
  if (id === 'negocio') {
    mostrarClientes();
    estadoClientes.textContent = '';
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

// El idioma se guarda solo, con los datos ya guardados de "Mi negocio"
// (no con lo que esté a medio escribir en el formulario). Se aplica al
// momento y se vuelven a armar las filas que ya están en pantalla; las
// líneas de la cotización se traducen en su sitio, sin perder lo escrito.
selectorIdioma.addEventListener('change', () => {
  try {
    negocio = store.guardarNegocio({ ...negocio, idioma: selectorIdioma.value });
  } catch {
    selectorIdioma.value = idioma;
    estadoNegocio.textContent = t('error.guardar', idioma);
    return;
  }
  idioma = negocio.idioma;
  selectorIdioma.value = idioma;
  aplicarIdioma(idioma);
  mostrarNumero();
  mostrarHistorial();
  mostrarClientes();
  mostrarServicios();
  textoBorrar.textContent = '';
  for (const estado of [
    estadoCotizacion,
    estadoHistorial,
    estadoNegocio,
    estadoClientes,
    estadoServicios,
  ]) {
    estado.textContent = '';
  }
});

// Clientes guardados. Se sugieren en la cotización y, al elegir uno,
// se rellena su teléfono.

let clientes = [];

function mostrarClientes() {
  clientes = store.listarClientes();
  const filas = clientes.map((cliente) => {
    const fila = plantillaCliente.content.firstElementChild.cloneNode(true);
    fila.dataset.nombre = cliente.nombre;
    dato(fila, 'nombre').textContent = cliente.nombre;
    dato(fila, 'telefono').textContent = cliente.telefono || t('clientes.sinTelefono', idioma);
    const boton = fila.querySelector('[data-accion="borrar"]');
    boton.setAttribute('aria-label', t('clientes.borrarEtiqueta', idioma, { nombre: cliente.nombre }));
    return fila;
  });
  listaClientes.replaceChildren(...filas);
  clientesVacio.hidden = filas.length > 0;

  const opciones = clientes.map((cliente) => {
    const opcion = document.createElement('option');
    opcion.value = cliente.nombre;
    return opcion;
  });
  sugerenciasClientes.replaceChildren(...opciones);
}

function buscarCliente(nombre) {
  const clave = aTexto(nombre).trim().toLowerCase();
  if (!clave) return undefined;
  return clientes.find((cliente) => cliente.nombre.toLowerCase() === clave);
}

async function borrarCliente(nombre) {
  if (!(await confirmarBorrado(t('confirmar.cliente', idioma, { nombre })))) return;
  let borrado;
  try {
    borrado = store.borrarCliente(nombre);
  } catch {
    estadoClientes.textContent = t('error.borrar', idioma);
    return;
  }
  mostrarClientes();
  estadoClientes.textContent = borrado
    ? t('clientes.borrado', idioma, { nombre })
    : t('clientes.noExistia', idioma);
}

nombreCliente.addEventListener('input', () => {
  const cliente = buscarCliente(nombreCliente.value);
  if (cliente) telefonoCliente.value = cliente.telefono;
});

listaClientes.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-accion="borrar"]');
  if (!boton) return;
  borrarCliente(boton.closest('.cliente-guardado').dataset.nombre);
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
    boton.setAttribute(
      'aria-label',
      t('servicios.borrarEtiqueta', idioma, { descripcion: servicio.descripcion }),
    );
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
    estadoServicios.textContent = t('error.guardar', idioma);
    return;
  }
  if (!guardado) {
    estadoServicios.textContent = t('servicios.faltaDescripcion', idioma);
    campos.descripcion.focus();
    return;
  }
  mostrarServicios();
  formularioServicio.reset();
  campos.descripcion.focus();
  estadoServicios.textContent = t('servicios.guardado', idioma, {
    descripcion: guardado.descripcion,
  });
}

async function borrarServicio(descripcion) {
  if (!(await confirmarBorrado(t('confirmar.servicio', idioma, { descripcion })))) return;
  let borrado;
  try {
    borrado = store.borrarServicio(descripcion);
  } catch {
    estadoServicios.textContent = t('error.borrar', idioma);
    return;
  }
  mostrarServicios();
  formularioServicio.elements.descripcion.focus();
  estadoServicios.textContent = borrado
    ? t('servicios.borrado', idioma, { descripcion })
    : t('servicios.noExistia', idioma);
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

aplicarIdioma(idioma);
selectorIdioma.value = idioma;
mostrarNegocio();
mostrarClientes();
mostrarServicios();
mostrarNumero();
anadirLinea();

// Para instalar la app y usarla sin Internet. sw.js se busca junto a
// index.html, así funciona también publicada en una subcarpeta.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('../sw.js', import.meta.url)).catch(() => {
      // Sin service worker la app sigue funcionando, solo que necesita red.
    });
  });
}
