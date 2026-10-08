# AGENTS.md — budgets-service

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
budgets-service/
├── migrations/          ← SQL puro, numerado: 001_init.sql, 002_*.sql …
├── src/
│   ├── index.js         ← Punto de entrada (carga .env, arranca Express)
│   ├── app.js           ← Configuración Express (sin listen)
│   ├── config/
│   │   └── db.js        ← Pool de pg; expone query(text, params)
│   ├── routes/
│   │   └── budget.routes.js
│   ├── services/
│   │   └── budget.service.js   ← Lógica de negocio pura, sin Express
│   ├── middlewares/
│   │   ├── auth.middleware.js   ← Verifica Bearer JWT; adjunta req.user
│   │   └── error.middleware.js  ← Handler global de errores
│   └── validators/
│       └── budget.validator.js  ← Schemas Joi + helpers validate / validateQuery
└── tests/
    └── budget.test.js
```

## Reglas de código

1. **Separación de capas**: Las rutas sólo validan y delegan. La lógica va en `services/`.
2. **Errores con status**: Los servicios lanzan `Error` con `.status` (4xx/5xx). El `errorHandler` los captura.
3. **No `process.exit`** salvo en el pool de DB en caso de error irrecuperable.
4. **Autenticación**: Todas las rutas de presupuestos requieren autenticación Bearer JWT. `req.user.sub` representa el ID de usuario (`user_id`).
5. **Aislamiento por usuario**: Todas las consultas a presupuestos deben incluir el filtro `user_id = $userId`.
6. **Variables de entorno**: Leer desde `process.env`. Nunca hardcodear secretos ni URLs.
7. **SQL**: Queries parametrizadas (`$1, $2, …`). Nunca interpolar strings del usuario.
8. **Validación**: Todo body o query de entrada pasa por un schema Joi antes del handler.
9. **Tests**: Mockear `src/config/db` y `jsonwebtoken`. No depender de Postgres real.
10. **Estilo**: `async/await` + `try/catch` que llama a `next(err)`. No `.then()/.catch()` en handlers.

## Endpoints

| Método | Ruta                     | Auth requerida | Descripción                                                    |
|--------|--------------------------|:--------------:|----------------------------------------------------------------|
| GET    | `/api/budgets`           | ✓ Bearer JWT   | Listar presupuestos del usuario (filtros: category, period)   |
| POST   | `/api/budgets`           | ✓ Bearer JWT   | Crear nuevo presupuesto (category, limit_amount, period)       |
| GET    | `/api/budgets/:id`       | ✓ Bearer JWT   | Detalle de un presupuesto específico                           |
| PUT    | `/api/budgets/:id`       | ✓ Bearer JWT   | Actualizar presupuesto                                         |
| DELETE | `/api/budgets/:id`       | ✓ Bearer JWT   | Eliminar presupuesto                                           |
| GET    | `/health`                | ✗              | Health check del servicio                                      |

## Variables de entorno requeridas

```env
PORT=4003
DATABASE_URL=postgresql://centavo:centavo@localhost:5432/centavo_budgets
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
