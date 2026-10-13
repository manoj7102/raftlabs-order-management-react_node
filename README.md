# RaftLabs Order Management

A small food delivery order app for the RaftLabs full-stack assessment. The repository contains a React frontend and an Express REST API. Orders are stored in memory, so restarting the API clears them.

The `frontend/` folder holds the React/Vite app and the `backend/` folder holds the Express API.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The API runs on `http://localhost:4000`; Vite proxies `/api` requests to it.
Vite updates the frontend while you edit it; restart the backend process after changing backend source files.

For a separate hosted frontend, set `VITE_API_BASE_URL` to the public HTTPS origin of the deployed API (see `frontend/.env.example`). Set the backend's `FRONTEND_ORIGIN` to the deployed frontend origin. The backend uses the hosting provider's `PORT` environment variable. Step-by-step hosting instructions are in [DEPLOY.md](DEPLOY.md).

## Checks

```bash
npm test
npm run build
```

## Scope

- Browse a food menu with names, descriptions, prices and images.
- Adjust cart quantities and place an order with name, address and a 10-digit phone number.
- Track the order through Received, Preparing and Out for Delivery. The browser polls for status changes; the API simulates progress.
- Validate input on the API and cover key API/UI flows with tests.

## How the feature is split up

1. **Menu:** the API provides named items with descriptions, server-owned prices, and images; the React UI renders and filters them.
2. **Ordering:** the cart manages quantities, checkout collects delivery details, and the API validates the request before calculating the total.
3. **Tracking:** an in-memory order store owns the status sequence. Timers simulate preparation and dispatch, while the UI polls for updates.
4. **Verification:** API tests exercise order operations, validation and status transitions; UI tests exercise menu, cart, checkout and restored tracking flows.

The menu, HTTP client, validation rules, and order store are separate modules so each part can be changed and tested independently. The in-memory store keeps the assessment simple; a production version would replace it with persistent storage and a durable background worker.

## API

| Method | Route                    | Purpose                          |
| ------ | ------------------------ | -------------------------------- |
| GET    | `/api/menu`              | List menu items                  |
| POST   | `/api/orders`            | Place an order                   |
| GET    | `/api/orders`            | List orders (admin token)        |
| GET    | `/api/orders/:id`        | Retrieve an order and its status |
| PATCH  | `/api/orders/:id/status` | Advance an order status          |
| DELETE | `/api/orders/:id`        | Delete an order                  |

Example order request:

```json
{
  "customer": {
    "name": "Aarav Sharma",
    "address": "123 Sample Street, Jaipur",
    "phone": "9876543210"
  },
  "items": [{ "menuItemId": "margherita-pizza", "quantity": 2 }]
}
```

The create response includes a random `accessToken`. Send it in the `X-Order-Token` header when reading, advancing, or deleting that order. Treat it as a secret and use HTTPS outside local development. The browser saves this token with the order ID so tracking survives a reload. The token is not included in later order responses.

`GET /api/orders` is for administrators. Set `ORDER_ADMIN_TOKEN` on the backend and send its value in the `X-Admin-Token` header. If no admin token is configured, the list route is unavailable. Do not put either token in frontend environment variables or source code. `FRONTEND_ORIGIN` limits which hosted browser origin can call the API; local Vite origins are allowed for development.

## Design notes

The API owns prices and item details; clients submit item IDs and quantities only. This prevents a browser from choosing its own total. Input lengths, quantities, menu IDs, status transitions, and JSON size are checked at the API boundary. In-memory storage keeps the exercise easy to run and is permitted by the brief. A production version would use a database, user accounts/roles, rate limiting, and a durable background job or queue for delivery progress.

## AI assistance

Codex assisted with implementation, validation, tests, debugging, and the security/UX review. The checks above and manual desktop/mobile exploration were used to verify its output. In the Loom walkthrough, explain the AI-assisted parts honestly alongside the design decisions, trade-offs, and any changes you reviewed yourself.

## Assessment handoff

Before submitting, create a public GitHub repository, deploy the web app and API using [DEPLOY.md](DEPLOY.md), and record the required 12–15 minute Loom walkthrough. Show the app, tests, architecture, design choices, challenges, and explain how AI assistance was used. Those external deliverables are separate from this local setup.
