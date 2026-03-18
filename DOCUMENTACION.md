# servientrega-webhook

Microservicio receptor de notificaciones Webhook de Servientrega para la plataforma Goloba.

## Responsabilidades

- Recibir y autenticar notificaciones push de Servientrega
- Persistir el historial de eventos por guía en MySQL
- Exponer endpoints de consulta para consumo interno de Bagisto

## Arquitectura

```
Servientrega ──POST /webhook──► microservicio ──► MySQL (servientrega_tracking)
Bagisto      ──POST /tracking──► microservicio ──► MySQL ──► respuesta JSON
```

## Estructura del proyecto

```
src/
  index.js                  ← Arranque del servidor y registro de rutas
  config.js                 ← Variables de entorno centralizadas
  stateMap.js               ← Catálogo ID_PROCESO → estado Goloba
  routes/
    webhook.js              ← POST /webhook (con auth middleware)
    tracking.js             ← POST /tracking y POST /tracking/history
  handlers/
    webhookHandler.js       ← Parseo del payload y persistencia
    trackingHandler.js      ← Consulta de estado e historial
  db/
    connection.js           ← Pool MySQL
    migrations.js           ← Creación automática de tablas
    shipmentRepo.js         ← Queries (upsert, find)
```

## Base de datos

Base de datos: `servientrega_tracking`

| Tabla | Descripción |
|---|---|
| `shipments` | Una fila por guía. Se actualiza (upsert) con cada webhook recibido. |
| `shipment_events` | Una fila por evento. Registro inmutable del historial. |

## Endpoints

### `POST /webhook`
Receptor de notificaciones de Servientrega. Requiere header de autenticación.

**Header requerido:**
```
x-servientrega-auth: <token>
```

### `POST /tracking`
Devuelve el estado actual de una guía.

**Body:**
```json
{ "numeroGuia": "2271129990" }
```

**Respuesta:**
```json
{
  "numeroGuia": "2271129990",
  "idEstadoActual": 9,
  "nombreEstadoActual": "EN ALISTAMIENTO DEL CLIENTE",
  "idEstadoGoloba": 9,
  "nombreEstadoGoloba": "EN ALISTAMIENTO DEL CLIENTE",
  "fechaEnvio": "2026-03-17 12:48:00",
  "fechaProbableEntrega": null,
  "fechaEntrega": null
}
```

### `POST /tracking/history`
Devuelve el historial completo de movimientos de una guía.

**Body:**
```json
{ "numeroGuia": "2271129990" }
```

**Respuesta:**
```json
{
  "numeroGuia": "2271129990",
  "eventos": [
    {
      "idProcesoLogistico": 1,
      "nombreProceso": "ALISTAMIENTO CLIENTE CORPORATIVO",
      "ciudadOrigen": "BOGOTA",
      "ciudadDestino": "BOGOTA",
      "fechaProceso": "2026-03-17 12:48:09"
    }
  ]
}
```

## Instalación y configuración

### Requisitos
- Node.js 18+
- MySQL 8+

### Variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
PORT=3001
SERVIENTREGA_AUTH_TOKEN=<token proporcionado por Servientrega>

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=servientrega_tracking
```

### Crear base de datos

```sql
CREATE DATABASE servientrega_tracking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Instalar dependencias

```bash
npm install
```

### Iniciar servidor

```bash
# Producción
npm start

# Desarrollo (hot reload)
npm run dev
```

Las tablas se crean automáticamente al arrancar si no existen.

## Notas de implementación

- El campo `fecha_entrega` en `shipments` se llena automáticamente cuando el `IDProcesoLogistico` corresponde a un estado de entrega (IDs 11 o 24). Este campo es la fuente para el cálculo del plazo de Derecho de Retracto.
- Estados desconocidos (fuera del catálogo) se persisten como `DESCONOCIDO` sin interrumpir el flujo. El microservicio responde `200 OK` siempre para evitar reintentos de Servientrega.
- El catálogo de estados (`stateMap.js`) es mantenido por Silcon. Servientrega notificará si se agregan nuevos estados.
