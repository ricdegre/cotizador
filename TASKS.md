# Cotizador — tasks for AI Router

How to use this list: one task at a time. Copy the text in the box, paste it into **Instruction** in the **AI Router** panel in VS Code and press **Run Task**. When it finishes: review the changes, run `npm.cmd test`, and if it is fine, commit. Mark the task with an `x`.

This list was written in Spanish before the build and is translated here. During the build, from task 10 onward, the prompts were given to the router in English, and task 11 (languages) was split into smaller tasks; the full record of what was run is in the [case study](https://github.com/ricdegre/AI-Router/blob/main/docs/CASE_STUDY_QUICK_QUOTE.md).

Full guide: [AI Router user guide](https://github.com/ricdegre/AI-Router/blob/main/docs/USER_GUIDE.md).

To see the app: `npm.cmd start` and open `http://localhost:8080` (from task 3 onward).

---

## 0. Design review (optional, changes no files)

Check **Read-only / no file changes** before pressing **Run Task**.

```text
Read PLAN.md and tell me if you see any problem in the design of this app before starting to program it. Do not write code or change files.
```

- [ ] Done

## 1. Calculations

```text
Create package.json, js/calc.js and test/calc.test.js following PLAN.md.

package.json: "type": "module", a "test" script with "node --test" and a "start" script with "node server.js". No dependencies.

js/calc.js exports pure functions, with money in whole cents:
- aCentavos(texto): converts "10.50" or "10,50" into 1050; empty or invalid gives 0.
- totalLinea(linea): quantity times price in cents.
- subtotal(lineas), impuesto(subtotalCentavos, porcentaje) rounded to the cent, and total(lineas, porcentaje).
- formatoDinero(centavos): returns "$1,234.50".

test/calc.test.js tests each function with node:test, including 10.50 + 2.25 = 12.75 and a tax of 10.1% rounded.
```

- [ ] Done · `npm.cmd test` passes · commit

## 2. Storage

```text
Create js/store.js and test/store.test.js following PLAN.md.

js/store.js exports crearStore(almacen), where almacen has getItem and setItem like localStorage. It returns an object with:
- leerNegocio() and guardarNegocio(negocio): nombre, telefono, impuesto, nota.
- listarCotizaciones() from newest to oldest, guardarCotizacion(cotizacion) which assigns a consecutive number and a date if it doesn't have them, leerCotizacion(numero) and borrarCotizacion(numero).
- listarServicios(), guardarServicio(servicio) and borrarServicio(descripcion).
If what is stored is damaged or empty, it returns default values without throwing an error.

test/store.test.js uses a fake in-memory storage and tests each function, including the consecutive number and damaged data.
```

- [ ] Done · `npm.cmd test` passes · commit

## 3. Page and local server

```text
Create server.js, index.html and css/styles.css following PLAN.md. Do not add app logic yet.

server.js: static file server with node:http, no dependencies, on port 8080, which serves the project folder with the correct type for html, css, js, svg, json and webmanifest, and does not let requests leave the folder.

index.html: in Spanish, with meta viewport, a link to css/styles.css and <script type="module" src="js/app.js">. Three sections with id "cotizacion", "historial" and "negocio", a bottom bar with three buttons to switch between them, and a footer "Hecho por IngenioTech".

css/styles.css: phone-first design, large buttons, sober colors with a dark blue as the main color.
```

- [ ] Done · it shows at `http://localhost:8080` · commit

## 4. Quote form

```text
Create js/app.js and complete the "cotizacion" section of index.html.

The section has: the customer's name and phone, a list of lines (description, quantity, price) with an "Añadir línea" button and a button to remove each line, a notes field, and the subtotal, tax and total.

js/app.js imports js/calc.js, starts with one empty line, and recalculates subtotal, tax and total every time a field changes. It also makes the three buttons of the bottom bar show one section and hide the others. The tax percentage is 0 for now.
```

- [ ] Done · the totals change as you type · commit

## 5. My business

```text
Complete the "negocio" section of index.html and its logic in js/app.js.

A form with business name, phone, tax percentage and footer note, with a "Guardar" button. Use crearStore(localStorage) from js/store.js to save and to load the data when the app opens. The saved tax percentage is used in the quote totals.
```

- [ ] Done · the data is still there after reloading · commit

## 6. Saving and history

```text
Add the "Guardar" button to the "cotizacion" section and complete the "historial" section in index.html and js/app.js.

"Guardar" saves the quote with js/store.js and shows its number. The "historial" section lists the saved quotes, from newest to oldest, with number, date, customer and total. Each one has three buttons: "Abrir" loads it into the form, "Duplicar" loads it as a new quote without a number, and "Borrar" deletes it after confirming. Also add a "Nueva cotización" button that clears the form.
```

- [ ] Done · saving, opening, duplicating and deleting work · commit

## 7. Sending by WhatsApp

```text
Create js/share.js and test/share.test.js, and add a "WhatsApp" button to the "cotizacion" section in index.html and js/app.js.

js/share.js exports pure functions:
- textoCotizacion(cotizacion, negocio): text with the business name, number and date, each line with quantity, description and total, then subtotal, tax if it is greater than 0, total, the notes and the footer note. It uses js/calc.js.
- enlaceWhatsApp(telefono, texto): returns "https://wa.me/<only the digits of the phone>?text=<encoded text>"; with no phone, "https://wa.me/?text=<encoded text>".

test/share.test.js tests both functions, including a phone with spaces and hyphens and a text with accents.

The "WhatsApp" button opens that link in a new tab with the quote from the form and the customer's phone.
```

- [ ] Done · `npm.cmd test` passes · the link opens WhatsApp · commit

## 8. Printing or saving as PDF

```text
Create css/print.css, link it in index.html with media="print", and add an "Imprimir / PDF" button to the "cotizacion" section that calls window.print() from js/app.js.

When printing, only the quote is shown, as a clean sheet: at the top the business name and phone, then number, date and customer, a table with the lines, the totals aligned to the right, the notes and the footer note. The buttons, the bottom bar and the other sections are not printed.
```

- [ ] Done · the print preview looks good · commit

## 9. Saved services

```text
Add a list of saved services to the "negocio" section in index.html and js/app.js.

In "negocio": a list of services with description and price, a form to add one and a button to delete each one, saved with js/store.js. In the quote form, the description field of each line suggests the saved services with a <datalist>, and choosing one fills in its price.
```

- [ ] Done · choosing a service fills in the price · commit

## 10. Installing and using without Internet

```text
Create manifest.webmanifest, icon.svg and sw.js, and register them in index.html and js/app.js.

manifest.webmanifest: name "Cotiza Rápido", language es, display standalone, main color the same as in css/styles.css, and the icon icon.svg.
icon.svg: simple square icon, a sheet with the $ sign on a dark blue background.
sw.js: caches index.html, the css and js files, the manifest and the icon on install, and responds from the cache when there is no network. It includes a cache version number and deletes the old caches on activation.
js/app.js registers sw.js if the browser allows it.
```

- [ ] Done · Chrome offers **Install** and the app opens with no network · commit

## 11. English and Spanish

```text
Create js/i18n.js and use it in index.html and js/app.js so that the app is in Spanish and English.

js/i18n.js exports an object with all the visible texts in "es" and "en", and a function t(clave, idioma). Add to the "negocio" section a language selector that is saved with js/store.js. The texts of index.html, of the buttons and of the quote sent by WhatsApp use the chosen language. The default language is Spanish.
```

- [ ] Done · changing the language changes all the texts · commit

## 12. Readme

```text
Create README.md in Spanish: what the app is, who it is for, how to try it locally with npm start, how to run the tests with npm test, that all the data stays on the phone, and "Hecho por IngenioTech".
```

- [ ] Done · commit

## Appearance tweaks (whenever you want, they go to the local model)

Examples, one per task:

```text
In css/styles.css, make the buttons of the bottom bar a little taller.
```

```text
In index.html, change the text of the quote's "Guardar" button to "Guardar cotización".
```
