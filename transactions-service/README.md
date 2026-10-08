# transactions-service

Microservicio de **registro y categorización de gastos** para Centavo.

## Responsabilidades
- CRUD de transacciones (monto, fecha, categoría, descripción)
- Filtrado e historial de gastos por fecha y categoría
- Resumen y agregación de gastos por categoría
- Aislamiento de datos multiusuario vía JWT

## Stack
- Node.js · Express · PostgreSQL (`pg`) · Joi · jsonwebtoken · Helmet · Jest

## Endpoints principales

| Método | Ruta                      | Auth requerida | Descripción                         |
|--------|---------------------------|:--------------:|-------------------------------------|
| GET    | `/api/transactions`         | ✓ Bearer JWT   | Listar transacciones del usuario    |
| POST   | `/api/transactions`         | ✓ Bearer JWT   | Registrar nueva transacción         |
| GET    | `/api/transactions/summary` | ✓ Bearer JWT   | Resumen de gastos por categoría     |
| GET    | `/api/transactions/:id`     | ✓ Bearer JWT   | Detalle de una transacción          |
| PUT    | `/api/transactions/:id`     | ✓ Bearer JWT   | Actualizar transacción              |
| DELETE | `/api/transactions/:id`     | ✓ Bearer JWT   | Eliminar transacción                |
| GET    | `/health`                   | ✗              | Health check del servicio           |

## Variables de entorno

```env
PORT=4002
DATABASE_URL=postgresql://centavo:centavo@localhost:5432/centavo_transactions
JWT_SECRET=cambia-este-secreto-en-produccion
NODE_ENV=development
```

## Desarrollo local

```bash
npm install
psql $DATABASE_URL -f migrations/001_init.sql
npm run dev
```
