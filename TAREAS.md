# Cotizador — tareas para AI Router

Cómo usar esta lista: una tarea a la vez. Copia el texto del recuadro, pégalo en **Instruction** del panel **AI Router** de VS Code y pulsa **Run Task**. Al terminar: revisa los cambios, ejecuta `npm.cmd test`, y si está bien, haz commit. Marca la tarea con una `x`.

Guía completa: `<workspace>\AI-Router\docs\GUIA-DE-USO.md`.

Para ver la app: `npm.cmd start` y abre `http://localhost:8080` (a partir de la tarea 3).

---

## 0. Revisión del diseño (opcional, no cambia archivos)

Marca **Read-only / no file changes** antes de pulsar **Run Task**.

```text
Lee PLAN.md y dime si ves algún problema en el diseño de esta app antes de empezar a programarla. No escribas código ni cambies archivos.
```

- [ ] Hecha

## 1. Cálculos

```text
Crea package.json, js/calc.js y test/calc.test.js siguiendo PLAN.md.

package.json: "type": "module", script "test" con "node --test" y script "start" con "node server.js". Sin dependencias.

js/calc.js exporta funciones puras, con el dinero en centavos enteros:
- aCentavos(texto): convierte "10.50" o "10,50" en 1050; vacío o inválido da 0.
- totalLinea(linea): cantidad por precio en centavos.
- subtotal(lineas), impuesto(subtotalCentavos, porcentaje) redondeado al centavo, y total(lineas, porcentaje).
- formatoDinero(centavos): devuelve "$1,234.50".

test/calc.test.js prueba cada función con node:test, incluido 10.50 + 2.25 = 12.75 y un impuesto de 10.1% redondeado.
```

- [ ] Hecha · `npm.cmd test` pasa · commit

## 2. Guardado

```text
Crea js/store.js y test/store.test.js siguiendo PLAN.md.

js/store.js exporta crearStore(almacen), donde almacen tiene getItem y setItem como localStorage. Devuelve un objeto con:
- leerNegocio() y guardarNegocio(negocio): nombre, telefono, impuesto, nota.
- listarCotizaciones() de la más nueva a la más vieja, guardarCotizacion(cotizacion) que asigna número consecutivo y fecha si no los tiene, leerCotizacion(numero) y borrarCotizacion(numero).
- listarServicios(), guardarServicio(servicio) y borrarServicio(descripcion).
Si lo guardado está dañado o vacío, devuelve valores por defecto sin lanzar error.

test/store.test.js usa un almacén falso en memoria y prueba cada función, incluido el número consecutivo y datos dañados.
```

- [ ] Hecha · `npm.cmd test` pasa · commit

## 3. Página y servidor local

```text
Crea server.js, index.html y css/styles.css siguiendo PLAN.md. No añadas lógica de la app todavía.

server.js: servidor de archivos estáticos con node:http, sin dependencias, en el puerto 8080, que sirve la carpeta del proyecto con el tipo correcto para html, css, js, svg, json y webmanifest, y no deja salir de la carpeta.

index.html: en español, con meta viewport, enlace a css/styles.css y <script type="module" src="js/app.js">. Tres secciones con id "cotizacion", "historial" y "negocio", una barra inferior con tres botones para cambiar entre ellas, y un pie "Hecho por IngenioTech".

css/styles.css: diseño para teléfono primero, botones grandes, colores sobrios con un azul oscuro como color principal.
```

- [ ] Hecha · se ve en `http://localhost:8080` · commit

## 4. Formulario de cotización

```text
Crea js/app.js y completa la sección "cotizacion" de index.html.

La sección tiene: nombre y teléfono del cliente, una lista de líneas (descripción, cantidad, precio) con un botón "Añadir línea" y un botón para quitar cada línea, un campo de notas, y el subtotal, impuesto y total.

js/app.js importa js/calc.js, empieza con una línea vacía, y recalcula subtotal, impuesto y total cada vez que cambia un campo. También hace que los tres botones de la barra inferior muestren una sección y oculten las otras. El porcentaje de impuesto es 0 por ahora.
```

- [ ] Hecha · los totales cambian al escribir · commit

## 5. Mi negocio

```text
Completa la sección "negocio" de index.html y su lógica en js/app.js.

Formulario con nombre del negocio, teléfono, porcentaje de impuesto y nota al pie, con un botón "Guardar". Usa crearStore(localStorage) de js/store.js para guardar y para cargar los datos al abrir la app. El porcentaje de impuesto guardado se usa en los totales de la cotización.
```

- [ ] Hecha · los datos siguen ahí al recargar · commit

## 6. Guardar e historial

```text
Añade el botón "Guardar" a la sección "cotizacion" y completa la sección "historial" en index.html y js/app.js.

"Guardar" guarda la cotización con js/store.js y muestra su número. La sección "historial" lista las cotizaciones guardadas, de la más nueva a la más vieja, con número, fecha, cliente y total. Cada una tiene tres botones: "Abrir" la carga en el formulario, "Duplicar" la carga como cotización nueva sin número, y "Borrar" la elimina después de confirmar. Añade también un botón "Nueva cotización" que limpia el formulario.
```

- [ ] Hecha · guardar, abrir, duplicar y borrar funcionan · commit

## 7. Enviar por WhatsApp

```text
Crea js/share.js y test/share.test.js, y añade un botón "WhatsApp" a la sección "cotizacion" en index.html y js/app.js.

js/share.js exporta funciones puras:
- textoCotizacion(cotizacion, negocio): texto con el nombre del negocio, número y fecha, cada línea con cantidad, descripción y total, luego subtotal, impuesto si es mayor que 0, total, las notas y la nota al pie. Usa js/calc.js.
- enlaceWhatsApp(telefono, texto): devuelve "https://wa.me/<solo dígitos del teléfono>?text=<texto codificado>"; sin teléfono, "https://wa.me/?text=<texto codificado>".

test/share.test.js prueba las dos funciones, incluido un teléfono con espacios y guiones y un texto con acentos.

El botón "WhatsApp" abre ese enlace en una pestaña nueva con la cotización del formulario y el teléfono del cliente.
```

- [ ] Hecha · `npm.cmd test` pasa · el enlace abre WhatsApp · commit

## 8. Imprimir o guardar en PDF

```text
Crea css/print.css, enlázalo en index.html con media="print", y añade un botón "Imprimir / PDF" a la sección "cotizacion" que llama a window.print() desde js/app.js.

Al imprimir solo se ve la cotización como una hoja limpia: arriba el nombre y teléfono del negocio, luego número, fecha y cliente, una tabla con las líneas, los totales alineados a la derecha, las notas y la nota al pie. No se imprimen los botones, la barra inferior ni las otras secciones.
```

- [ ] Hecha · la vista previa de impresión se ve bien · commit

## 9. Servicios guardados

```text
Añade una lista de servicios guardados a la sección "negocio" en index.html y js/app.js.

En "negocio": una lista de servicios con descripción y precio, un formulario para añadir uno y un botón para borrar cada uno, guardados con js/store.js. En el formulario de cotización, el campo de descripción de cada línea sugiere los servicios guardados con un <datalist>, y al elegir uno se rellena su precio.
```

- [ ] Hecha · elegir un servicio rellena el precio · commit

## 10. Instalar y usar sin Internet

```text
Crea manifest.webmanifest, icon.svg y sw.js, y regístralos en index.html y js/app.js.

manifest.webmanifest: nombre "Cotiza Rápido", idioma es, display standalone, color principal igual al de css/styles.css, y el icono icon.svg.
icon.svg: icono cuadrado sencillo, una hoja con el signo $ sobre fondo azul oscuro.
sw.js: guarda en caché index.html, los archivos de css y js, el manifest y el icono al instalar, y responde desde la caché cuando no hay red. Incluye un número de versión de caché y borra las cachés viejas al activarse.
js/app.js registra sw.js si el navegador lo permite.
```

- [ ] Hecha · Chrome ofrece **Install** y la app abre sin red · commit

## 11. Inglés y español

```text
Crea js/i18n.js y úsalo en index.html y js/app.js para que la app esté en español e inglés.

js/i18n.js exporta un objeto con todos los textos visibles en "es" y "en", y una función t(clave, idioma). Añade a la sección "negocio" un selector de idioma que se guarda con js/store.js. Los textos de index.html, de los botones y de la cotización enviada por WhatsApp usan el idioma elegido. El idioma por defecto es español.
```

- [ ] Hecha · cambiar de idioma cambia todos los textos · commit

## 12. Léeme

```text
Crea README.md en español: qué es la app, para quién, cómo probarla en local con npm start, cómo ejecutar las pruebas con npm test, que todos los datos se quedan en el teléfono, y "Hecho por IngenioTech".
```

- [ ] Hecha · commit

## Ajustes de aspecto (cuando quieras, van al modelo local)

Ejemplos, uno por tarea:

```text
En css/styles.css, haz los botones de la barra inferior un poco más altos.
```

```text
En index.html, cambia el texto del botón "Guardar" de la cotización a "Guardar cotización".
```
