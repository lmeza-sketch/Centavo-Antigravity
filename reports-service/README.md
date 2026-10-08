# reports-service

Microservicio de **generación automática de reportes** para Centavo.

## Responsabilidades
- Generación de reportes mensuales y semanales por categoría
- Exportación en PDF o CSV bajo demanda
- Análisis de tendencias de gasto (comparativa mes a mes)
- Suscripción a eventos para actualización incremental de reportes

## Stack
- Node.js · Express · pdfkit · exceljs · PostgreSQL · node-cron

## Endpoints principales

| Método | Ruta                           | Descripción                                  |
|--------|--------------------------------|----------------------------------------------|
| GET    | `/reports`                     | Listar reportes generados del usuario        |
| GET    | `/reports/monthly`             | Reporte del mes actual                       |
| GET    | `/reports/monthly/:year/:month`| Reporte de un mes específico                 |
| GET    | `/reports/:id/pdf`             | Descargar reporte en PDF                     |
| GET    | `/reports/:id/csv`             | Descargar reporte en CSV                     |
| GET    | `/reports/trends`              | Análisis de tendencias (últimos 6 meses)     |

## Variables de entorno

```env
PORT=4005
DATABASE_URL=postgresql://user:password@localhost:5432/centavo_reports
BROKER_URL=amqp://localhost
TRANSACTIONS_SERVICE_URL=http://transactions-service:4002
BUDGETS_SERVICE_URL=http://budgets-service:4003
AUTH_SERVICE_URL=http://auth-service:4001
REPORT_CRON_SCHEDULE="0 8 1 * *"
```

## Eventos consumidos

| Evento              | Acción                                        |
|---------------------|-----------------------------------------------|
| `gasto.registrado`  | Actualiza el borrador del reporte del mes     |

## Desarrollo local

```bash
npm install
npm run dev
```
