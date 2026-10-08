# budgets-service

Microservicio de **definición y seguimiento de presupuestos** para Centavo.

## Responsabilidades
- CRUD de presupuestos por categoría y período (diario/semanal/quincenal/mensual/anual)
- Consulta y filtrado de presupuestos por usuario
- Validación de datos de entrada y aislamiento multi-tenant por usuario autenticado

## Stack
- Node.js ≥ 20 · Express 4 · PostgreSQL (`pg` puro) · Joi · Jest

## Endpoints principales

| Método | Ruta                 | Auth Requerida | Descripción                                                   |
|--------|----------------------|:--------------:|---------------------------------------------------------------|
| GET    | `/api/budgets`       | ✓ Bearer JWT   | Listar presupuestos del usuario (filtros: category, period)   |
| POST   | `/api/budgets`       | ✓ Bearer JWT   | Crear nuevo presupuesto (category, limit_amount, period)       |
| GET    | `/api/budgets/:id`   | ✓ Bearer JWT   | Detalle de un presupuesto                                     |
| PUT    | `/api/budgets/:id`   | ✓ Bearer JWT   | Actualizar presupuesto                                         |
| DELETE | `/api/budgets/:id`   | ✓ Bearer JWT   | Eliminar presupuesto                                           |
| GET    | `/health`            | ✗              | Health check                                                  |

## Variables de entorno

```env
PORT=4003
DATABASE_URL=postgresql://centavo:centavo@localhost:5432/centavo_budgets
JWT_SECRET=cambia-este-secreto-en-produccion
NODE_ENV=development
```

## Desarrollo local y Tests

```bash
npm install
npm run dev
npm test
```
