# Cotizador — design

A free web app that lets a plumber, gardener, painter or any other tradesperson put together a quote on their phone and send it by WhatsApp or as a PDF. Made by IngenioTech. Working name: **Cotiza Rápido**.

## Project rules

- Plain HTML, CSS and JavaScript. No dependencies, no build step.
- Everything is stored on the phone (`localStorage`). There is no server, no accounts and no data in the cloud.
- Designed for a phone screen first.
- Texts in Spanish. English is added at the end.
- The logic goes in modules with no access to the page, so it can be tested with `node --test`.
- It is published as a web page (GitHub Pages) and installed from the browser.

## Files

| File | What it does |
|---|---|
| `package.json` | `"type": "module"`, `npm test` (`node --test`) and `npm start` (`node server.js`). No dependencies. |
| `server.js` | Minimal local static file server at `http://localhost:8080`, for testing only. |
| `index.html` | The only page: three sections (Cotización, Historial, Mi negocio) and a bar to switch between them. |
| `css/styles.css` | Screen styles. |
| `css/print.css` | Print styles: the quote as a clean sheet to save as PDF. |
| `js/calc.js` | Calculations: line total, subtotal, tax, total, money format. No access to the page. |
| `js/store.js` | Saving and reading: business details, quotes and the list of services. It receives the storage as a parameter. |
| `js/share.js` | Builds the quote text and the WhatsApp link. No access to the page. |
| `js/i18n.js` | Texts in Spanish and English. |
| `js/app.js` | Connects the page to the modules: forms, buttons, lists. |
| `test/*.test.js` | Tests for `calc.js`, `store.js` and `share.js`. |
| `manifest.webmanifest`, `sw.js`, `icon.svg` | For installing the app and making it work without Internet. |

## Data

- **Business:** name, phone, tax percentage (0 if it charges none), footer note (for example "Válida por 15 días").
- **Quote:** consecutive number, date, customer (name and phone), lines (description, quantity, price), notes.
- **Saved service:** description and price, so they don't have to be typed each time.

Money is calculated in whole cents so no decimals are lost.

## Screens

1. **Cotización:** customer, lines with a button to add and remove them, totals that update on their own, and the buttons **Guardar**, **WhatsApp** and **Imprimir / PDF**.
2. **Historial:** saved quotes, from newest to oldest; open, duplicate or delete.
3. **Mi negocio:** business details and the list of saved services.

Footer: "Hecho por IngenioTech" with a link.
