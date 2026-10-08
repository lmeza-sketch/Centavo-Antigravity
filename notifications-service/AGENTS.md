# AGENTS.md — notifications-service

Guía de convenciones y reglas para agentes de IA que trabajen en este microservicio.

## Stack

- **Runtime:** Node.js ≥ 20 · CommonJS (`require`)
- **Framework:** Express 4
- **Seguridad:** jsonwebtoken · helmet · express-rate-limit
- **Base de datos:** PostgreSQL vía `pg` (driver puro, sin ORM, con fallback en memoria `pg-mem`)
- **Validación:** Joi (schemas en `src/validators/`)
- **Tests:** Jest + Supertest

## Estructura de carpetas

```
notifications-service/
├── migrations/          ← SQL puro, numerado: 001_init.sql, 002_*.sql …
├── src/
│   ├── index.js         ← Punto de entrada (carga .env, arranca Express)
│   ├── app.js           ← Configuración Express (sin listen)
│   ├── config/
│   │   └── db.js        ← Pool de pg; expone query(text, params)
│   ├── routes/
│   │   └── notification.routes.js
│   ├── services/
│   │   └── notification.service.js   ← Lógica de negocio pura de evaluación de sobregasto y notificaciones
│   ├── middlewares/
│   │   ├── auth.middleware.js   ← Verifica Bearer JWT; adjunta req.user
│   │   └── error.middleware.js  ← Handler global de errores
│   └── validators/
│       └── notification.validator.js  ← Schemas Joi + helpers validate / validateQuery
└── tests/
    └── notification.test.js
```

## Reglas de código

1. **Separación de capas**: Las rutas sólo validan y delegan. La lógica va en `services/`.
2. **Evaluación de sobregasto**:
   - Compara `newTotalSpent = currentSpent + amount` contra el `budgetLimit`.
   - Si `newTotalSpent / budgetLimit >= 1.0` (100%), genera alerta `presupuesto.excedido`.
   - Si `newTotalSpent / budgetLimit >= (threshold_percent / 100)` (por defecto 80%), genera alerta `presupuesto.alerta80`.
   - Si aplica alerta, persiste la notificación en la tabla `notifications`.
3. **Errores con status**: Los servicios lanzan `Error` con `.status` (4xx/5xx). El `errorHandler` los captura.
4. **Autenticación**: Todas las rutas de notificaciones requieren autenticación Bearer JWT. `req.user.sub` representa el ID de usuario (`user_id`).
5. **Aislamiento por usuario**: Todas las consultas a notificaciones deben incluir el filtro `user_id = $userId`.
6. **Variables de entorno**: Leer desde `process.env`. Nunca hardcodear secretos ni URLs.
7. **SQL**: Queries parametrizadas (`$1, $2, …`). Nunca interpolar strings del usuario.
8. **Validación**: Todo body o query de entrada pasa por un schema Joi antes del handler.
9. **Tests**: Mockear `src/config/db` y `jsonwebtoken`. No depender de Postgres real.
10. **Estilo**: `async/await` + `try/catch` que llama a `next(err)`. No `.then()/.catch()` en handlers.

## Endpoints

| Método | Ruta                                      | Auth requerida | Descripción                                                       |
|--------|-------------------------------------------|:--------------:|-------------------------------------------------------------------|
| POST   | `/api/notifications/evaluate-transaction`| ✓ Bearer JWT   | Evalúa una transacción vs presupuesto y genera alertas si aplica |
| POST   | `/api/notifications/check-alert`          | ✓ Bearer JWT   | Alias para chequeo y generación de alertas de sobregasto         |
| GET    | `/api/notifications`                     | ✓ Bearer JWT   | Historial de notificaciones del usuario (filtros: read, type, cat)|
| GET    | `/api/notifications/:id`                 | ✓ Bearer JWT   | Detalle de una notificación específica                            |
| PATCH  | `/api/notifications/:id/read`            | ✓ Bearer JWT   | Marcar notificación como leída                                    |
| DELETE | `/api/notifications/:id`                 | ✓ Bearer JWT   | Eliminar notificación del historial                               |
| GET    | `/api/notifications/preferences`         | ✓ Bearer JWT   | Obtener preferencias de notificación del usuario                  |
| PUT    | `/api/notifications/preferences`         | ✓ Bearer JWT   | Actualizar canales y umbral de alerta (%)                         |
| GET    | `/health`                                 | ✗              | Health check del microservicio                                    |

## Variables de entorno requeridas

```env
PORT=4004
DATABASE_URL=postgresql://centavo:centavo@localhost:5432/centavo_notifications
JWT_SECRET=<secreto-compartido-con-auth-service>
NODE_ENV=development|production
```

## Comandos

```bash
npm install       # instalar dependencias
npm run dev       # nodemon (desarrollo)
npm start         # producción
npm test          # jest (sin depender de Postgres externo gracias a mocks/pg-mem)
```
