# servientrega-webhook

Lightweight Node.js/Express microservice that receives Servientrega shipping webhook notifications, persists shipment events to MySQL, and exposes internal query endpoints for consumption by Bagisto (Laravel).

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/webhook` | `X-Servientrega-Auth` | Receives Servientrega push notifications |
| `POST` | `/tracking` | None | Returns current shipment status |
| `POST` | `/tracking/history` | None | Returns full event history for a shipment |

## Setup

**Requirements:** Node.js 18+, MySQL 8+

```bash
cp .env.example .env   # configure environment variables
npm install
```

Create the database:
```sql
CREATE DATABASE servientrega_tracking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Start the server (tables are created automatically on startup):
```bash
npm start        # production
npm run dev      # development (hot reload)
```

## Project structure

```
src/
  index.js                  ← Server entry point
  config.js                 ← Environment variables
  stateMap.js               ← IDProcesoLogistico → Goloba state catalog
  routes/
    webhook.js              ← POST /webhook + auth middleware
    tracking.js             ← POST /tracking, POST /tracking/history
  handlers/
    webhookHandler.js       ← Payload parsing and persistence logic
    trackingHandler.js      ← Query logic
  db/
    connection.js           ← MySQL connection pool
    migrations.js           ← Auto table creation
    shipmentRepo.js         ← Database queries
```

## Documentation

See [DOCUMENTACION.md](./DOCUMENTACION.md) for full Spanish documentation including detailed endpoint specs, database schema, and implementation notes.
