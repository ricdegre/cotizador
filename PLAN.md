# Cotizador — diseño

App web gratuita para que un plomero, jardinero, pintor o cualquier oficio arme una cotización en el teléfono y la mande por WhatsApp o en PDF. Hecha por IngenioTech. Nombre provisional: **Cotiza Rápido**.

## Reglas del proyecto

- HTML, CSS y JavaScript puros. Sin dependencias, sin paso de compilación.
- Todo se guarda en el teléfono (`localStorage`). No hay servidor, cuentas ni datos en la nube.
- Pensada primero para pantalla de teléfono.
- Textos en español. El inglés se añade al final.
- La lógica va en módulos sin acceso a la página, para poder probarla con `node --test`.
- Se publica como página web (GitHub Pages) y se instala desde el navegador.

## Archivos

| Archivo | Qué hace |
|---|---|
| `package.json` | `"type": "module"`, `npm test` (`node --test`) y `npm start` (`node server.js`). Sin dependencias. |
| `server.js` | Servidor local mínimo de archivos estáticos en `http://localhost:8080`, solo para probar. |
| `index.html` | La única página: tres secciones (Cotización, Historial, Mi negocio) y una barra para cambiar entre ellas. |
| `css/styles.css` | Estilos de pantalla. |
| `css/print.css` | Estilos de impresión: la cotización como hoja limpia para guardar en PDF. |
| `js/calc.js` | Cálculos: total por línea, subtotal, impuesto, total, formato de dinero. Sin acceso a la página. |
| `js/store.js` | Guardar y leer: datos del negocio, cotizaciones y lista de servicios. Recibe el almacenamiento como parámetro. |
| `js/share.js` | Arma el texto de la cotización y el enlace de WhatsApp. Sin acceso a la página. |
| `js/i18n.js` | Textos en español e inglés. |
| `js/app.js` | Une la página con los módulos: formularios, botones, listas. |
| `test/*.test.js` | Pruebas de `calc.js`, `store.js` y `share.js`. |
| `manifest.webmanifest`, `sw.js`, `icon.svg` | Para instalar la app y que funcione sin Internet. |

## Datos

- **Negocio:** nombre, teléfono, porcentaje de impuesto (0 si no cobra), nota al pie (por ejemplo "Válida por 15 días").
- **Cotización:** número consecutivo, fecha, cliente (nombre y teléfono), líneas (descripción, cantidad, precio), notas.
- **Servicio guardado:** descripción y precio, para no escribirlos cada vez.

El dinero se calcula en centavos enteros para no perder decimales.

## Pantallas

1. **Cotización:** cliente, líneas con botón para añadir y quitar, totales que se actualizan solos, y los botones **Guardar**, **WhatsApp** e **Imprimir / PDF**.
2. **Historial:** cotizaciones guardadas, de la más nueva a la más vieja; abrir, duplicar o borrar.
3. **Mi negocio:** datos del negocio y lista de servicios guardados.

Pie de página: "Hecho por IngenioTech" con enlace.
