// Textos de la app en español e inglés, con las mismas claves en los dos.
// Sin acceso a la página, para poder probarlo con node --test.
// Las partes que cambian van entre llaves, como {numero}, y las pone t().

export const IDIOMAS = ['es', 'en'];

export const TEXTOS = {
  es: {
    'idioma.nombre': 'Español',
    'app.nombre': 'Cotiza Rápido',
    'app.titulo': 'Cotiza Rápido',
    'app.descripcion': 'Cotizaciones rápidas desde el teléfono. Hecho por IngenioTech.',
    'pie.texto': 'Hecho por IngenioTech',

    // Barra inferior
    'barra.etiqueta': 'Secciones',
    'barra.cotizacion': 'Cotización',
    'barra.historial': 'Historial',
    'barra.negocio': 'Mi negocio',

    // Cotización
    'cotizacion.titulo': 'Cotización',
    'cotizacion.cliente': 'Cliente',
    'cotizacion.clienteNombre': 'Nombre',
    'cotizacion.clienteTelefono': 'Teléfono',
    'cotizacion.lineas': 'Líneas',
    'cotizacion.anadirLinea': 'Añadir línea',
    'cotizacion.notas': 'Notas',
    'cotizacion.subtotal': 'Subtotal',
    'cotizacion.impuesto': 'Impuesto',
    'cotizacion.total': 'Total',
    'cotizacion.guardar': 'Guardar',
    'cotizacion.whatsapp': 'WhatsApp',
    'cotizacion.imprimir': 'Imprimir / PDF',
    'cotizacion.nueva': 'Nueva cotización',
    'cotizacion.numero': 'Cotización n.º {numero} · {fecha}',
    'cotizacion.sinGuardar': 'Cotización nueva, sin guardar',
    'cotizacion.guardada': 'Cotización n.º {numero} guardada.',
    'cotizacion.copia': 'Copia de la n.º {numero}. Pulsa "Guardar" para darle número.',

    // Cada línea de la cotización
    'linea.descripcion': 'Descripción',
    'linea.cantidad': 'Cantidad',
    'linea.precio': 'Precio',
    'linea.precioEjemplo': '0.00',
    'linea.quitar': 'Quitar línea',

    // Historial
    'historial.titulo': 'Historial',
    'historial.vacio': 'Todavía no hay cotizaciones guardadas.',
    'historial.numero': 'N.º {numero}',
    'historial.sinCliente': 'Sin nombre de cliente',
    'historial.total': 'Total: {total}',
    'historial.abrir': 'Abrir',
    'historial.duplicar': 'Duplicar',
    'historial.borrar': 'Borrar',
    'historial.accionEtiqueta': '{accion} cotización {numero}',
    'historial.noExiste': 'Esa cotización ya no existe.',
    'historial.borrada': 'Cotización n.º {numero} borrada.',
    'historial.noExistia': 'Esa cotización ya no existía.',

    // Mi negocio
    'negocio.titulo': 'Mi negocio',
    'negocio.nombre': 'Nombre del negocio',
    'negocio.telefono': 'Teléfono',
    'negocio.codigoPais': 'Código de país',
    'negocio.impuesto': 'Impuesto (%)',
    'negocio.impuestoEjemplo': '0',
    'negocio.nota': 'Nota al pie',
    'negocio.notaEjemplo': 'Válida por 15 días',
    'negocio.guardar': 'Guardar',
    'negocio.guardado': 'Datos guardados.',

    // Clientes guardados
    'clientes.titulo': 'Clientes',
    'clientes.vacio': 'Todavía no hay clientes guardados.',
    'clientes.sinTelefono': 'Sin teléfono',
    'clientes.borrar': 'Borrar',
    'clientes.borrarEtiqueta': 'Borrar cliente {nombre}',
    'clientes.borrado': 'Cliente "{nombre}" borrado.',
    'clientes.noExistia': 'Ese cliente ya no existía.',

    // Servicios guardados
    'servicios.titulo': 'Servicios guardados',
    'servicios.vacio': 'Todavía no hay servicios guardados.',
    'servicios.descripcion': 'Descripción del servicio',
    'servicios.precio': 'Precio',
    'servicios.precioEjemplo': '0.00',
    'servicios.anadir': 'Añadir servicio',
    'servicios.borrar': 'Borrar',
    'servicios.borrarEtiqueta': 'Borrar servicio {descripcion}',
    'servicios.faltaDescripcion': 'Escribe la descripción del servicio.',
    'servicios.guardado': 'Servicio "{descripcion}" guardado.',
    'servicios.borrado': 'Servicio "{descripcion}" borrado.',
    'servicios.noExistia': 'Ese servicio ya no existía.',

    // Errores al guardar o borrar
    'error.guardar': 'No se pudo guardar. Revisa que el navegador permita guardar datos.',
    'error.borrar': 'No se pudo borrar. Revisa que el navegador permita guardar datos.',

    // Cuadro de confirmación al borrar
    'confirmar.cancelar': 'Cancelar',
    'confirmar.borrar': 'Borrar',
    'confirmar.cotizacion': '¿Borrar la cotización n.º {numero}? No se puede deshacer.',
    'confirmar.cliente': '¿Borrar el cliente "{nombre}"?',
    'confirmar.servicio': '¿Borrar el servicio "{descripcion}"?',

    // Hoja de impresión
    'hoja.cotizacion': 'Cotización',
    'hoja.fecha': 'Fecha',
    'hoja.cliente': 'Cliente',
    'hoja.descripcion': 'Descripción',
    'hoja.cantidad': 'Cantidad',
    'hoja.precio': 'Precio',
    'hoja.importe': 'Importe',
    'hoja.subtotal': 'Subtotal',
    'hoja.impuesto': 'Impuesto',
    'hoja.total': 'Total',
    'hoja.telefono': 'Tel. {telefono}',
    'hoja.numero': 'N.º {numero}',
    'hoja.sinGuardar': 'Sin guardar',

    // Mensaje de WhatsApp
    'whatsapp.titulo': 'Cotización',
    'whatsapp.numero': 'Cotización n.º {numero}',
    'whatsapp.fecha': '{titulo} · {fecha}',
    'whatsapp.linea': '{cantidad} x {descripcion}: {importe}',
    'whatsapp.subtotal': 'Subtotal: {subtotal}',
    'whatsapp.impuesto': 'Impuesto: {impuesto}',
    'whatsapp.total': 'Total: {total}',

    // Selector de idioma en "Mi negocio"
    'idioma.etiqueta': 'Idioma / Language',
  },

  en: {
    'idioma.nombre': 'English',
    'idioma.etiqueta': 'Idioma / Language',
    'app.nombre': 'Quick Quote',
    'app.titulo': 'Quick Quote',
    'app.descripcion': 'Quick quotes from your phone. Made by IngenioTech.',
    'pie.texto': 'Made by IngenioTech',

    // Barra inferior
    'barra.etiqueta': 'Sections',
    'barra.cotizacion': 'Quote',
    'barra.historial': 'History',
    'barra.negocio': 'My business',

    // Cotización
    'cotizacion.titulo': 'Quote',
    'cotizacion.cliente': 'Customer',
    'cotizacion.clienteNombre': 'Name',
    'cotizacion.clienteTelefono': 'Phone',
    'cotizacion.lineas': 'Items',
    'cotizacion.anadirLinea': 'Add item',
    'cotizacion.notas': 'Notes',
    'cotizacion.subtotal': 'Subtotal',
    'cotizacion.impuesto': 'Tax',
    'cotizacion.total': 'Total',
    'cotizacion.guardar': 'Save',
    'cotizacion.whatsapp': 'WhatsApp',
    'cotizacion.imprimir': 'Print / PDF',
    'cotizacion.nueva': 'New quote',
    'cotizacion.numero': 'Quote no. {numero} · {fecha}',
    'cotizacion.sinGuardar': 'New quote, not saved',
    'cotizacion.guardada': 'Quote no. {numero} saved.',
    'cotizacion.copia': 'Copy of no. {numero}. Tap "Save" to give it a number.',

    // Cada línea de la cotización
    'linea.descripcion': 'Description',
    'linea.cantidad': 'Quantity',
    'linea.precio': 'Price',
    'linea.precioEjemplo': '0.00',
    'linea.quitar': 'Remove item',

    // Historial
    'historial.titulo': 'History',
    'historial.vacio': 'No saved quotes yet.',
    'historial.numero': 'No. {numero}',
    'historial.sinCliente': 'No customer name',
    'historial.total': 'Total: {total}',
    'historial.abrir': 'Open',
    'historial.duplicar': 'Duplicate',
    'historial.borrar': 'Delete',
    'historial.accionEtiqueta': '{accion} quote {numero}',
    'historial.noExiste': 'That quote no longer exists.',
    'historial.borrada': 'Quote no. {numero} deleted.',
    'historial.noExistia': 'That quote was already gone.',

    // Mi negocio
    'negocio.titulo': 'My business',
    'negocio.nombre': 'Business name',
    'negocio.telefono': 'Phone',
    'negocio.codigoPais': 'Country code',
    'negocio.impuesto': 'Tax (%)',
    'negocio.impuestoEjemplo': '0',
    'negocio.nota': 'Footer note',
    'negocio.notaEjemplo': 'Valid for 15 days',
    'negocio.guardar': 'Save',
    'negocio.guardado': 'Details saved.',

    // Clientes guardados
    'clientes.titulo': 'Customers',
    'clientes.vacio': 'No saved customers yet.',
    'clientes.sinTelefono': 'No phone',
    'clientes.borrar': 'Delete',
    'clientes.borrarEtiqueta': 'Delete customer {nombre}',
    'clientes.borrado': 'Customer "{nombre}" deleted.',
    'clientes.noExistia': 'That customer was already gone.',

    // Servicios guardados
    'servicios.titulo': 'Saved services',
    'servicios.vacio': 'No saved services yet.',
    'servicios.descripcion': 'Service description',
    'servicios.precio': 'Price',
    'servicios.precioEjemplo': '0.00',
    'servicios.anadir': 'Add service',
    'servicios.borrar': 'Delete',
    'servicios.borrarEtiqueta': 'Delete service {descripcion}',
    'servicios.faltaDescripcion': 'Enter the service description.',
    'servicios.guardado': 'Service "{descripcion}" saved.',
    'servicios.borrado': 'Service "{descripcion}" deleted.',
    'servicios.noExistia': 'That service was already gone.',

    // Errores al guardar o borrar
    'error.guardar': 'Could not save. Check that the browser allows saving data.',
    'error.borrar': 'Could not delete. Check that the browser allows saving data.',

    // Cuadro de confirmación al borrar
    'confirmar.cancelar': 'Cancel',
    'confirmar.borrar': 'Delete',
    'confirmar.cotizacion': 'Delete quote no. {numero}? This cannot be undone.',
    'confirmar.cliente': 'Delete customer "{nombre}"?',
    'confirmar.servicio': 'Delete service "{descripcion}"?',

    // Hoja de impresión
    'hoja.cotizacion': 'Quote',
    'hoja.fecha': 'Date',
    'hoja.cliente': 'Customer',
    'hoja.descripcion': 'Description',
    'hoja.cantidad': 'Quantity',
    'hoja.precio': 'Price',
    'hoja.importe': 'Amount',
    'hoja.subtotal': 'Subtotal',
    'hoja.impuesto': 'Tax',
    'hoja.total': 'Total',
    'hoja.telefono': 'Phone: {telefono}',
    'hoja.numero': 'No. {numero}',
    'hoja.sinGuardar': 'Not saved',

    // Mensaje de WhatsApp
    'whatsapp.titulo': 'Quote',
    'whatsapp.numero': 'Quote no. {numero}',
    'whatsapp.fecha': '{titulo} · {fecha}',
    'whatsapp.linea': '{cantidad} x {descripcion}: {importe}',
    'whatsapp.subtotal': 'Subtotal: {subtotal}',
    'whatsapp.impuesto': 'Tax: {impuesto}',
    'whatsapp.total': 'Total: {total}',
  },
};

// t('cotizacion.guardada', 'en', { numero: 3 }) -> "Quote no. 3 saved."
// Si el idioma no se conoce o le falta la clave, se usa el español; si
// tampoco está en español, se devuelve la clave. Una marca sin valor se deja.
export function t(clave, idioma, valores) {
  const textos = Object.hasOwn(TEXTOS, idioma) ? TEXTOS[idioma] : TEXTOS.es;
  let texto;
  if (Object.hasOwn(textos, clave)) texto = textos[clave];
  else if (Object.hasOwn(TEXTOS.es, clave)) texto = TEXTOS.es[clave];
  else return String(clave);
  const datos = valores ?? {};
  return texto.replace(/\{(\w+)\}/g, (marca, nombre) =>
    Object.hasOwn(datos, nombre) ? String(datos[nombre]) : marca,
  );
}
