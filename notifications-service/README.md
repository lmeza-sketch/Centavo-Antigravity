# notifications-service

Microservicio de **alertas y notificaciones** para Centavo.

## Responsabilidades
- Evaluación de sobregasto contra límites de presupuesto ante nuevas transacciones.
- Suscripción y procesamiento de eventos (`gasto.registrado`, `presupuesto.alerta80`, `presupuesto.excedido`).
- Registro y consulta del historial de alertas y notificaciones enviadas.
- Gestión de preferencias de notificación y umbrales por usuario.

## Stack
- Node.js · Express · Joi · PostgreSQL (con fallback `pg-mem`) · Jest · Supertest

## Endpoints principales

| Método | Ruta                                      | Descripción                                                       |
|--------|-------------------------------------------|-------------------------------------------------------------------|
| POST   | `/api/notifications/evaluate-transaction`| Evalúa una transacción vs presupuesto y genera alertas si aplica |
| POST   | `/api/notifications/check-alert`          | Alias para chequeo y generación de alertas de sobregasto         |
| GET    | `/api/notifications`                     | Historial de notificaciones del usuario (con filtros)             |
| GET    | `/api/notifications/:id`                 | Detalle de una notificación específica                            |
| PATCH  | `/api/notifications/:id/read`            | Marcar notificación como leída                                    |
| DELETE | `/api/notifications/:id`                 | Eliminar una notificación del historial                           |
| GET    | `/api/notifications/preferences`         | Obtener preferencias de notificación y umbral del usuario         |
| PUT    | `/api/notifications/preferences`         | Actualizar canales activos y umbral de alerta (%)                 |
| GET    | `/health`                                 | Health check del microservicio                                    |

### Ejemplo: Evaluar transacción contra presupuesto

`POST /api/notifications/evaluate-transaction`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 150.0,
  "category": "Alimentación",
  "budgetLimit": 500.0,
  "currentSpent": 400.0,
  "date": "2026-10-08",
  "description": "Supermercado mensual"
}
```

**Respuesta cuando se supera el presupuesto (`presupuesto.excedido`):**
```json
{
  "message": "Evaluación completada: Se ha generado una alerta de presupuesto.",
  "evaluation": {
    "shouldAlert": true,
    "alertType": "presupuesto.excedido",
    "percentage": 110,
    "previousSpent": 400,
    "transactionAmount": 150,
    "newTotalSpent": 550,
    "budgetLimit": 500,
    "message": "Has superado tu presupuesto de Alimentación. Gasto acumulado: $550.00 de un límite de $500.00 (110%).",
    "notification": {
      "id": "c1f7b880-...",
      "user_id": "...",
      "type": "presupuesto.excedido",
      "title": "¡Presupuesto superado!",
      "message": "...",
      "category": "Alimentación",
      "read": false,
      "created_at": "2026-10-08T..."
    }
  }
}
```

## Variables de entorno

```env
PORT=4004
DATABASE_URL=postgresql://centavo:centavo@localhost:5432/centavo_notifications
JWT_SECRET=cambia-este-secreto-en-produccion
BROKER_URL=amqp://localhost:5672
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@centavo.app
SMTP_PASS=your-smtp-password
FCM_SERVER_KEY=your-fcm-server-key
```

## Desarrollo y Tests

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Ejecutar tests
npm test
```
