import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearStore } from '../js/store.js';

// Almacén falso en memoria con getItem y setItem como localStorage.
function almacenFalso() {
  const datos = new Map();
  return {
    datos,
    getItem(clave) {
      return datos.has(clave) ? datos.get(clave) : null;
    },
    setItem(clave, valor) {
      datos.set(clave, String(valor));
    },
  };
}

// Guarda algo en cada clave para luego poder estropearlas.
function llenar(store) {
  store.guardarNegocio({ nombre: 'Plomería Ruiz', telefono: '555', impuesto: 16, nota: 'Hola' });
  store.guardarCotizacion({ cliente: { nombre: 'Ana', telefono: '' }, lineas: [], notas: '' });
  store.guardarServicio({ descripcion: 'Cambio de llave', precio: 35000 });
}

// Reemplaza todo lo guardado con el mismo texto.
function estropear(almacen, texto) {
  for (const clave of almacen.datos.keys()) almacen.datos.set(clave, texto);
}

const negocioVacio = { nombre: '', telefono: '', codigoPais: '1', impuesto: 0, nota: '' };

test('leerNegocio sin datos da valores por defecto', () => {
  const store = crearStore(almacenFalso());
  assert.deepEqual(store.leerNegocio(), negocioVacio);
});

test('guardarNegocio guarda y leerNegocio lo recupera', () => {
  const almacen = almacenFalso();
  const negocio = {
    nombre: 'Plomería Ruiz',
    telefono: '555 123 4567',
    codigoPais: '52',
    impuesto: 16,
    nota: 'Válida por 15 días',
  };
  crearStore(almacen).guardarNegocio(negocio);
  assert.deepEqual(crearStore(almacen).leerNegocio(), negocio);
});

test('guardarNegocio limpia campos inválidos y extra', () => {
  const store = crearStore(almacenFalso());
  store.guardarNegocio({ nombre: 'Jardines', impuesto: 'abc', extra: 1 });
  assert.deepEqual(store.leerNegocio(), { ...negocioVacio, nombre: 'Jardines' });
  store.guardarNegocio({ impuesto: '10,5' });
  assert.equal(store.leerNegocio().impuesto, 10.5);
  store.guardarNegocio({ impuesto: -3 });
  assert.equal(store.leerNegocio().impuesto, 0);
  store.guardarNegocio({ codigoPais: '+52 abc' });
  assert.equal(store.leerNegocio().codigoPais, '52');
  store.guardarNegocio({ codigoPais: '' });
  assert.equal(store.leerNegocio().codigoPais, '1');
});

test('sin cotizaciones: lista vacía y leerCotizacion da null', () => {
  const store = crearStore(almacenFalso());
  assert.deepEqual(store.listarCotizaciones(), []);
  assert.equal(store.leerCotizacion(1), null);
});

test('guardarCotizacion asigna números consecutivos', () => {
  const store = crearStore(almacenFalso());
  assert.equal(store.guardarCotizacion({ notas: 'a' }).numero, 1);
  assert.equal(store.guardarCotizacion({ notas: 'b' }).numero, 2);
  assert.equal(store.guardarCotizacion({ notas: 'c' }).numero, 3);
});

test('el número consecutivo no se reutiliza después de borrar', () => {
  const almacen = almacenFalso();
  const store = crearStore(almacen);
  store.guardarCotizacion({});
  store.guardarCotizacion({});
  store.guardarCotizacion({});
  assert.equal(store.borrarCotizacion(3), true);
  assert.equal(store.guardarCotizacion({}).numero, 4);
  for (const { numero } of store.listarCotizaciones()) store.borrarCotizacion(numero);
  assert.equal(crearStore(almacen).guardarCotizacion({}).numero, 5);
});

test('guardarCotizacion respeta número y fecha si ya los tiene', () => {
  const store = crearStore(almacenFalso());
  const guardada = store.guardarCotizacion({ numero: 10, fecha: '2026-01-15' });
  assert.equal(guardada.numero, 10);
  assert.equal(guardada.fecha, '2026-01-15');
  assert.equal(store.guardarCotizacion({}).numero, 11);
});

test('guardarCotizacion pone la fecha si no la tiene', () => {
  const store = crearStore(almacenFalso());
  const guardada = store.guardarCotizacion({});
  assert.equal(typeof guardada.fecha, 'string');
  assert.ok(!Number.isNaN(Date.parse(guardada.fecha)));
  assert.equal(store.leerCotizacion(guardada.numero).fecha, guardada.fecha);
});

test('guardarCotizacion no cambia el objeto recibido', () => {
  const store = crearStore(almacenFalso());
  const original = { notas: 'x' };
  store.guardarCotizacion(original);
  assert.deepEqual(original, { notas: 'x' });
});

test('guardar con un número existente actualiza en vez de duplicar', () => {
  const store = crearStore(almacenFalso());
  const guardada = store.guardarCotizacion({ notas: 'antes' });
  store.guardarCotizacion({ ...guardada, notas: 'después' });
  const lista = store.listarCotizaciones();
  assert.equal(lista.length, 1);
  assert.equal(lista[0].notas, 'después');
  assert.equal(lista[0].fecha, guardada.fecha);
});

test('listarCotizaciones va de la más nueva a la más vieja', () => {
  const store = crearStore(almacenFalso());
  store.guardarCotizacion({});
  store.guardarCotizacion({});
  store.guardarCotizacion({});
  assert.deepEqual(
    store.listarCotizaciones().map((cotizacion) => cotizacion.numero),
    [3, 2, 1],
  );
});

test('leerCotizacion devuelve la cotización con ese número', () => {
  const store = crearStore(almacenFalso());
  store.guardarCotizacion({ notas: 'primera' });
  store.guardarCotizacion({
    cliente: { nombre: 'Luis', telefono: '555' },
    lineas: [{ descripcion: 'Pintura', cantidad: 2, precio: 15000 }],
    notas: 'segunda',
  });
  const leida = store.leerCotizacion(2);
  assert.equal(leida.notas, 'segunda');
  assert.deepEqual(leida.cliente, { nombre: 'Luis', telefono: '555' });
  assert.deepEqual(leida.lineas, [{ descripcion: 'Pintura', cantidad: 2, precio: 15000 }]);
  assert.equal(store.leerCotizacion('1').notas, 'primera');
  assert.equal(store.leerCotizacion(99), null);
  assert.equal(store.leerCotizacion('abc'), null);
});

test('borrarCotizacion borra solo esa y avisa si no existía', () => {
  const store = crearStore(almacenFalso());
  store.guardarCotizacion({});
  store.guardarCotizacion({});
  assert.equal(store.borrarCotizacion(1), true);
  assert.equal(store.leerCotizacion(1), null);
  assert.deepEqual(store.listarCotizaciones().map((c) => c.numero), [2]);
  assert.equal(store.borrarCotizacion(1), false);
  assert.equal(store.borrarCotizacion(99), false);
});

test('listarServicios sin datos da una lista vacía', () => {
  const store = crearStore(almacenFalso());
  assert.deepEqual(store.listarServicios(), []);
});

test('guardarServicio añade y reemplaza por descripción', () => {
  const almacen = almacenFalso();
  const store = crearStore(almacen);
  store.guardarServicio({ descripcion: 'Cambio de llave', precio: 35000 });
  store.guardarServicio({ descripcion: 'Destapar drenaje', precio: 50000 });
  store.guardarServicio({ descripcion: '  cambio de LLAVE ', precio: 40000 });
  assert.deepEqual(crearStore(almacen).listarServicios(), [
    { descripcion: 'cambio de LLAVE', precio: 40000 },
    { descripcion: 'Destapar drenaje', precio: 50000 },
  ]);
});

test('guardarServicio sin descripción no guarda nada', () => {
  const store = crearStore(almacenFalso());
  assert.equal(store.guardarServicio({ descripcion: '   ', precio: 100 }), null);
  assert.equal(store.guardarServicio(undefined), null);
  assert.deepEqual(store.listarServicios(), []);
});

test('guardarServicio deja el precio en centavos enteros', () => {
  const store = crearStore(almacenFalso());
  store.guardarServicio({ descripcion: 'Poda', precio: 'abc' });
  store.guardarServicio({ descripcion: 'Riego', precio: 1050.4 });
  assert.deepEqual(store.listarServicios(), [
    { descripcion: 'Poda', precio: 0 },
    { descripcion: 'Riego', precio: 1050 },
  ]);
});

test('borrarServicio borra por descripción y avisa si no existía', () => {
  const store = crearStore(almacenFalso());
  store.guardarServicio({ descripcion: 'Cambio de llave', precio: 35000 });
  store.guardarServicio({ descripcion: 'Poda', precio: 20000 });
  assert.equal(store.borrarServicio(' cambio de llave '), true);
  assert.deepEqual(store.listarServicios(), [{ descripcion: 'Poda', precio: 20000 }]);
  assert.equal(store.borrarServicio('Cambio de llave'), false);
  assert.equal(store.borrarServicio(''), false);
});

test('datos con JSON dañado dan valores por defecto', () => {
  const almacen = almacenFalso();
  llenar(crearStore(almacen));
  estropear(almacen, '{no es json');
  const store = crearStore(almacen);
  assert.deepEqual(store.leerNegocio(), negocioVacio);
  assert.deepEqual(store.listarCotizaciones(), []);
  assert.equal(store.leerCotizacion(1), null);
  assert.equal(store.borrarCotizacion(1), false);
  assert.deepEqual(store.listarServicios(), []);
  assert.equal(store.borrarServicio('Cambio de llave'), false);
  assert.equal(store.guardarCotizacion({}).numero, 1);
});

test('datos vacíos o de otro tipo dan valores por defecto', () => {
  for (const texto of ['', 'null', '"hola"', '42', 'true', '{}', '[1,null,"x",{"numero":"a"}]']) {
    const almacen = almacenFalso();
    llenar(crearStore(almacen));
    estropear(almacen, texto);
    const store = crearStore(almacen);
    assert.deepEqual(store.leerNegocio(), negocioVacio, texto);
    assert.deepEqual(store.listarCotizaciones(), [], texto);
    assert.deepEqual(store.listarServicios(), [], texto);
  }
});

test('ignora entradas dañadas dentro de las listas', () => {
  const almacen = almacenFalso();
  const store = crearStore(almacen);
  llenar(store);
  for (const [clave, valor] of almacen.datos) {
    const datos = JSON.parse(valor);
    if (Array.isArray(datos)) almacen.datos.set(clave, JSON.stringify([null, 'x', 7, ...datos]));
  }
  assert.deepEqual(store.listarCotizaciones().map((c) => c.numero), [1]);
  assert.deepEqual(store.listarServicios(), [{ descripcion: 'Cambio de llave', precio: 35000 }]);
  assert.equal(store.guardarCotizacion({}).numero, 2);
});

test('si getItem lanza un error, da valores por defecto', () => {
  const store = crearStore({
    getItem() {
      throw new Error('sin acceso');
    },
    setItem() {},
  });
  assert.deepEqual(store.leerNegocio(), negocioVacio);
  assert.deepEqual(store.listarCotizaciones(), []);
  assert.equal(store.leerCotizacion(1), null);
  assert.deepEqual(store.listarServicios(), []);
});


test('guardarCliente guarda nombre y teléfono', () => {
  const store = crearStore(almacenFalso());
  assert.deepEqual(store.guardarCliente({ nombre: 'Ana', telefono: '555' }), {
    nombre: 'Ana',
    telefono: '555',
  });
  assert.deepEqual(store.listarClientes(), [{ nombre: 'Ana', telefono: '555' }]);
});

test('guardarCliente actualiza el teléfono si el nombre ya existe', () => {
  const store = crearStore(almacenFalso());
  store.guardarCliente({ nombre: 'Ana', telefono: '111' });
  store.guardarCliente({ nombre: '  ANA ', telefono: '222' });
  assert.deepEqual(store.listarClientes(), [{ nombre: 'ANA', telefono: '222' }]);
});

test('guardarCliente sin nombre no guarda nada', () => {
  const store = crearStore(almacenFalso());
  assert.equal(store.guardarCliente({ nombre: '   ', telefono: '555' }), null);
  assert.equal(store.guardarCliente(undefined), null);
  assert.deepEqual(store.listarClientes(), []);
});

test('listarClientes ordena por nombre', () => {
  const store = crearStore(almacenFalso());
  store.guardarCliente({ nombre: 'Zoe', telefono: '3' });
  store.guardarCliente({ nombre: 'ana', telefono: '1' });
  store.guardarCliente({ nombre: 'Luis', telefono: '2' });
  assert.deepEqual(
    store.listarClientes().map((cliente) => cliente.nombre),
    ['ana', 'Luis', 'Zoe'],
  );
});

test('borrarCliente borra por nombre y avisa si no existía', () => {
  const store = crearStore(almacenFalso());
  store.guardarCliente({ nombre: 'Ana', telefono: '111' });
  store.guardarCliente({ nombre: 'Luis', telefono: '222' });
  assert.equal(store.borrarCliente('  ANA '), true);
  assert.deepEqual(store.listarClientes(), [{ nombre: 'Luis', telefono: '222' }]);
  assert.equal(store.borrarCliente('Ana'), false);
  assert.equal(store.borrarCliente(''), false);
});
