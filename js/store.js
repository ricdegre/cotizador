// Guardar y leer: datos del negocio, cotizaciones y lista de servicios.
// Recibe el almacenamiento como parámetro (localStorage en la página, uno
// falso en las pruebas), así no toca la página y se prueba con node --test.
// Si lo guardado está dañado o vacío, se devuelven valores por defecto.

import { IDIOMAS } from './i18n.js';

const CLAVES = {
  negocio: 'cotiza.negocio',
  cotizaciones: 'cotiza.cotizaciones',
  clientes: 'cotiza.clientes',
  servicios: 'cotiza.servicios',
  ultimoNumero: 'cotiza.ultimoNumero',
};

function esObjeto(valor) {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function texto(valor) {
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number' && Number.isFinite(valor)) return String(valor);
  return '';
}

// Entero positivo, o 0 si no lo es.
function numeroValido(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : 0;
}

// Número no negativo; acepta "16" o "10,5". Inválido -> 0.
function noNegativo(valor) {
  const numero = Number(String(valor ?? '').trim().replace(',', '.'));
  return Number.isFinite(numero) && numero >= 0 ? numero : 0;
}

// Uno de IDIOMAS; cualquier otro valor, o ninguno, -> "es".
function idiomaValido(valor) {
  return IDIOMAS.includes(valor) ? valor : 'es';
}

function normalizarNegocio(negocio) {
  const origen = esObjeto(negocio) ? negocio : {};
  const codigoPais = texto(origen.codigoPais).replace(/\D/g, '') || '1';
  return {
    nombre: texto(origen.nombre),
    telefono: texto(origen.telefono),
    direccion: texto(origen.direccion),
    ciudad: texto(origen.ciudad),
    estado: texto(origen.estado),
    codigoPostal: texto(origen.codigoPostal),
    email: texto(origen.email),
    codigoPais,
    impuesto: noNegativo(origen.impuesto),
    nota: texto(origen.nota),
    idioma: idiomaValido(origen.idioma),
  };
}

// El precio va en centavos enteros.
function normalizarServicio(servicio) {
  const origen = esObjeto(servicio) ? servicio : {};
  return {
    descripcion: texto(origen.descripcion).trim(),
    precio: Math.round(noNegativo(origen.precio)),
  };
}

// "  Cambio de Llave " y "cambio de llave" son el mismo servicio.
function claveServicio(descripcion) {
  return texto(descripcion).trim().toLowerCase();
}

function normalizarCliente(cliente) {
  const origen = esObjeto(cliente) ? cliente : {};
  return {
    nombre: texto(origen.nombre).trim(),
    telefono: texto(origen.telefono).trim(),
    direccion: texto(origen.direccion).trim(),
    ciudad: texto(origen.ciudad).trim(),
    estado: texto(origen.estado).trim(),
    codigoPostal: texto(origen.codigoPostal).trim(),
    email: texto(origen.email).trim(),
  };
}

// "  Ana " y "ana" son el mismo cliente.
function claveCliente(nombre) {
  return texto(nombre).trim().toLowerCase();
}

export function crearStore(almacen) {
  function leer(clave, porDefecto) {
    try {
      const guardado = almacen.getItem(clave);
      if (guardado === null || guardado === undefined || guardado === '') return porDefecto;
      return JSON.parse(guardado);
    } catch {
      return porDefecto;
    }
  }

  function escribir(clave, valor) {
    almacen.setItem(clave, JSON.stringify(valor));
  }

  // Solo las cotizaciones con un número válido.
  function leerCotizaciones() {
    const lista = leer(CLAVES.cotizaciones, []);
    if (!Array.isArray(lista)) return [];
    return lista
      .filter((cotizacion) => esObjeto(cotizacion) && numeroValido(cotizacion.numero))
      .map((cotizacion) => ({
        ...cotizacion,
        numero: numeroValido(cotizacion.numero),
        cliente: normalizarCliente(cotizacion.cliente),
      }));
  }

  function leerClientes() {
    const lista = leer(CLAVES.clientes, []);
    if (!Array.isArray(lista)) return [];
    return lista.map(normalizarCliente).filter((cliente) => cliente.nombre);
  }

  function leerServicios() {
    const lista = leer(CLAVES.servicios, []);
    if (!Array.isArray(lista)) return [];
    return lista.map(normalizarServicio).filter((servicio) => servicio.descripcion);
  }

  function ultimoNumero(lista) {
    const guardado = numeroValido(leer(CLAVES.ultimoNumero, 0));
    return lista.reduce((mayor, cotizacion) => Math.max(mayor, cotizacion.numero), guardado);
  }

  return {
    leerNegocio() {
      return normalizarNegocio(leer(CLAVES.negocio, {}));
    },

    guardarNegocio(negocio) {
      const limpio = normalizarNegocio(negocio);
      escribir(CLAVES.negocio, limpio);
      return limpio;
    },

    // De la más nueva a la más vieja (número mayor primero).
    listarCotizaciones() {
      return leerCotizaciones().sort((a, b) => b.numero - a.numero);
    },

    // Asigna número consecutivo y fecha si no los tiene. Si el número ya
    // existe, reemplaza esa cotización. Los números borrados no se reutilizan.
    guardarCotizacion(cotizacion) {
      const lista = leerCotizaciones();
      const ultimo = ultimoNumero(lista);
      const nueva = { ...(esObjeto(cotizacion) ? cotizacion : {}) };
      nueva.numero = numeroValido(nueva.numero) || ultimo + 1;
      if (!texto(nueva.fecha)) nueva.fecha = new Date().toISOString();
      nueva.cliente = normalizarCliente(nueva.cliente);

      const resto = lista.filter((guardada) => guardada.numero !== nueva.numero);
      resto.push(nueva);
      escribir(CLAVES.cotizaciones, resto);
      escribir(CLAVES.ultimoNumero, Math.max(ultimo, nueva.numero));
      return { ...nueva };
    },

    // La cotización con ese número, o null.
    leerCotizacion(numero) {
      const buscado = numeroValido(numero);
      return leerCotizaciones().find((cotizacion) => cotizacion.numero === buscado) ?? null;
    },

    // true si se borró, false si no existía.
    borrarCotizacion(numero) {
      const buscado = numeroValido(numero);
      const lista = leerCotizaciones();
      const resto = lista.filter((cotizacion) => cotizacion.numero !== buscado);
      if (resto.length === lista.length) return false;
      escribir(CLAVES.cotizaciones, resto);
      return true;
    },

    // Por nombre, sin distinguir mayúsculas al ordenar.
    listarClientes() {
      return leerClientes().sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }),
      );
    },

    // Reemplaza el cliente con el nombre anterior o el mismo nombre. Sin nombre -> null.
    guardarCliente(cliente, nombreAnterior) {
      const limpio = normalizarCliente(cliente);
      if (!limpio.nombre) return null;
      const lista = leerClientes();
      const anterior = claveCliente(nombreAnterior);
      let indice = anterior
        ? lista.findIndex((guardado) => claveCliente(guardado.nombre) === anterior)
        : -1;
      if (indice < 0) {
        indice = lista.findIndex(
          (guardado) => claveCliente(guardado.nombre) === claveCliente(limpio.nombre),
        );
      }
      if (indice >= 0) lista[indice] = limpio;
      else lista.push(limpio);
      escribir(CLAVES.clientes, lista);
      return { ...limpio };
    },

    // true si se borró, false si no existía.
    borrarCliente(nombre) {
      const buscado = claveCliente(nombre);
      const lista = leerClientes();
      const resto = lista.filter((cliente) => claveCliente(cliente.nombre) !== buscado);
      if (!buscado || resto.length === lista.length) return false;
      escribir(CLAVES.clientes, resto);
      return true;
    },

    listarServicios() {
      return leerServicios();
    },

    // Reemplaza el servicio con la descripción anterior o la misma descripción.
    guardarServicio(servicio, descripcionAnterior) {
      const limpio = normalizarServicio(servicio);
      if (!limpio.descripcion) return null;
      const lista = leerServicios();
      const anterior = claveServicio(descripcionAnterior);
      let indice = anterior
        ? lista.findIndex((guardado) => claveServicio(guardado.descripcion) === anterior)
        : -1;
      if (indice < 0) {
        indice = lista.findIndex(
          (guardado) => claveServicio(guardado.descripcion) === claveServicio(limpio.descripcion),
        );
      }
      if (indice >= 0) lista[indice] = limpio;
      else lista.push(limpio);
      escribir(CLAVES.servicios, lista);
      return { ...limpio };
    },

    // true si se borró, false si no existía.
    borrarServicio(descripcion) {
      const buscada = claveServicio(descripcion);
      const lista = leerServicios();
      const resto = lista.filter((servicio) => claveServicio(servicio.descripcion) !== buscada);
      if (!buscada || resto.length === lista.length) return false;
      escribir(CLAVES.servicios, resto);
      return true;
    },
  };
}
