# Shipping Calculator

Simple shipping cost calculator built with Node.js, Express, and a small browser UI.

## What it does

The app calculates a shipping price using:

- a base fee
- a weight fee
- a distance fee
- an optional fragile surcharge

It exposes a JSON API and also serves a basic front-end from the `public/` folder.

## Setup

1. Install Node.js.
2. Install dependencies:

```bash
npm install
```

## Run

Start the app:

```bash
npm start
```

Then open the app in your browser at:

```text
http://localhost:3000
```

## Test

Run the automated tests with:

```bash
npm test
```

## API

`POST /api/shipping/calculate`

Request body:

```json
{
	"weight_kg": 2,
	"distance_km": 300,
	"is_fragile": true
}
```

Successful responses return a cost breakdown, total, and `USD` currency.

## Project Structure

- `src/` contains the server, calculator, and validation logic.
- `public/` contains the browser UI.
- `tests/` contains Jest and API tests.