# AGENTS.md — transactions-service

Guía de convenciones y reglas para agentes de IA que trabajen en este microservicio.

## Stack

- **Runtime:** Node.js ≥ 20 · CommonJS (`require`)
- **Framework:** Express 4
- **Seguridad:** jsonwebtoken · helmet · express-rate-limit
- **Base de datos:** PostgreSQL vía `pg` (driver puro, sin ORM)
- **Validación:** Joi (schemas en `src/validators/`)
- **Tests:** Jest + Supertest

## Estructura de carpetas

```
transactions-service/
├── migrations/          ← SQL puro, numerado: 001_init.sql, 002_*.sql …
├── src/
│   ├── index.js         ← Punto de entrada (carga .env, arranca Express)
│   ├── app.js           ← Configuración Express (sin listen)
│   ├── config/
│   │   └── db.js        ← Pool de pg; expone query(text, params)
│   ├── routes/
│   │   └── transaction.routes.js
│   ├── services/
│   │   └── transaction.service.js  ← Lógica de negocio pura, sin Express
│   ├── middlewares/
│   │   ├── auth.middleware.js      ← Verifica Bearer JWT; adjunta req.user
│   │   └── error.middleware.js     ← Handler global de errores
│   └── validators/
│       └── transaction.validator.js ← Schemas Joi + helpers validate / validateQuery
└── tests/
    └── transaction.test.js
```

## Reglas de código

1. **Separación de capas**: Las rutas sólo validan y delegan. La lógica va en `services/`.
2. **Errores con status**: Los servicios lanzan `Error` con `.status` (4xx/5xx). El `errorHandler` los captura.
3. **No `process.exit`** salvo en el pool de DB en caso de error irrecuperable.
4. **Autenticación**: Todas las rutas de transacciones requieren autenticación Bearer JWT. `req.user.sub` representa el ID de usuario (`user_id`).
5. **Aislamiento por usuario**: Todas las consultas a transacciones deben incluir el filtro `user_id = $userId`.
6. **Variables de entorno**: Leer desde `process.env`. Nunca hardcodear secretos ni URLs.
7. **SQL**: Queries parametrizadas (`$1, $2, …`). Nunca interpolar strings del usuario.
8. **Validación**: Todo body o query de entrada pasa por un schema Joi antes del handler.
9. **Tests**: Mockear `src/config/db` y `jsonwebtoken`. No depender de Postgres real.
10. **Estilo**: `async/await` + `try/catch` que llama a `next(err)`. No `.then()/.catch()` en handlers.

## Endpoints

| Método | Ruta                         | Auth requerida | Descripción                              |
|--------|------------------------------|:--------------:|------------------------------------------|
| GET    | `/api/transactions`          | ✓ Bearer JWT   | Listar transacciones del usuario         |
| POST   | `/api/transactions`          | ✓ Bearer JWT   | Registrar nueva transacción (monto, cat) |
| GET    | `/api/transactions/summary`  | ✓ Bearer JWT   | Resumen de gastos por categoría          |
| GET    | `/api/transactions/:id`      | ✓ Bearer JWT   | Detalle de una transacción               |
| PUT    | `/api/transactions/:id`      | ✓ Bearer JWT   | Actualizar transacción                   |
| DELETE | `/api/transactions/:id`      | ✓ Bearer JWT   | Eliminar transacción                     |
| GET    | `/health`                    | ✗              | Health check del servicio                |

## Variables de entorno requeridas

```env
PORT=4002
DATABASE_URL=postgresql://user:pass@host:5432/centavo_transactions
JWT_SECRET=<secreto-compartido-con-auth-service>
NODE_ENV=development|production
```

## Comandos

```bash
npm install       # instalar dependencias
npm run dev       # nodemon (desarrollo)
npm start         # producción
npm test          # jest (sin necesitar Postgres)
```

## Migraciones

Aplicar manualmente con psql antes de levantar el servicio:

```bash
psql $DATABASE_URL -f migrations/001_init.sql
```
