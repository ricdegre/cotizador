# Quick Quote (Cotiza Rápido)

A free web app for tradespeople (plumbers, painters, gardeners and similar) to write a quote on their phone and send it by WhatsApp or as a PDF.

## What it does

- **Quotes with line items and tax.** Add and remove lines with a description, quantity and price. The subtotal, tax and total update as you type. You set the tax percentage once in the business section.
- **Saved services and customers.** Saved services are suggested in each line's description, and choosing one fills in its price. Customers are saved with each quote and suggested by name, and choosing one fills in their phone number.
- **History.** Saved quotes get a consecutive number and a date and are listed newest first. You can open, duplicate or delete each one.
- **WhatsApp message.** One button opens WhatsApp with the quote written out as a message, addressed to the customer's phone.
- **Print or save as PDF.** The quote prints as a clean sheet with the business name and phone, quote number, date, customer, a table of lines, totals, notes and the footer note.
- **Spanish and English.** Choose the language in the business section. Spanish is the default.
- **Installable and usable offline.** The app can be installed from the browser, and a service worker keeps its files so it opens without an Internet connection.

## Privacy

Everything is stored on the device with `localStorage`. There is no server, no account and no tracking.

## Run it locally

You need Node.js 22 or newer. There are no dependencies to install.

```sh
npm start
```

Then open http://localhost:8080.

To run the tests:

```sh
npm test
```

## How it was built

Every file was written through AI Router, a local tool that sends each task to the cheapest AI resource able to do it. It uses flat-rate subscriptions and a local model instead of pay-per-use APIs.

The task list is in [TAREAS.md](TAREAS.md) and the design is in [PLAN.md](PLAN.md).

## Author

Made by Richard R Degregorio (IngenioTech). I am not a software developer. I solve the problems that come up in my work with the tools I have, and look for new tools when those are not enough. I directed this project, tested every step by hand, and the code was written by AI models.

## License

MIT.
