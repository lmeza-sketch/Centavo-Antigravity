# frontend

Dashboard web de **Centavo** — App de Finanzas Personales.

## Responsabilidades
- Autenticación de usuario (login / registro)
- Visualización y registro de gastos por categoría
- Creación y monitoreo de presupuestos
- Reportes de gasto mensuales e históricos
- Notificaciones de sobregasto en tiempo real

## Stack
- React 18 · Vite · TailwindCSS · React Query · React Router v6 · Recharts

## Páginas principales

| Ruta               | Descripción                              |
|--------------------|------------------------------------------|
| `/login`           | Inicio de sesión                         |
| `/register`        | Registro de nuevo usuario                |
| `/`                | Dashboard — resumen general              |
| `/transactions`    | Listado y registro de gastos             |
| `/budgets`         | Gestión de presupuestos                  |
| `/reports`         | Reportes y tendencias                    |
| `/settings`        | Preferencias de notificación y perfil    |

## Variables de entorno

```env
VITE_AUTH_SERVICE_URL=http://localhost:4001
VITE_TRANSACTIONS_SERVICE_URL=http://localhost:4002
VITE_BUDGETS_SERVICE_URL=http://localhost:4003
VITE_NOTIFICATIONS_SERVICE_URL=http://localhost:4004
VITE_REPORTS_SERVICE_URL=http://localhost:4005
```

## Desarrollo local

```bash
npm install
npm run dev
# Abre http://localhost:3000
```
