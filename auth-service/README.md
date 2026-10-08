# auth-service

Microservicio de **autenticación y autorización** para Centavo.

## Responsabilidades
- Registro e inicio de sesión de usuarios (email/contraseña)
- Generación y validación de JWT (access token + refresh token)
- Gestión de sesiones y cierre de sesión seguro

## Stack
- Node.js · Express · bcrypt · jsonwebtoken · PostgreSQL

## Endpoints principales

| Método | Ruta              | Descripción                   |
|--------|-------------------|-------------------------------|
| POST   | `/auth/register`  | Registrar nuevo usuario       |
| POST   | `/auth/login`     | Iniciar sesión, retorna JWT   |
| POST   | `/auth/refresh`   | Renovar access token          |
| POST   | `/auth/logout`    | Invalidar refresh token       |
| GET    | `/auth/me`        | Perfil del usuario autenticado|

## Variables de entorno

```env
PORT=4001
DATABASE_URL=postgresql://user:password@localhost:5432/centavo_auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Desarrollo local

```bash
npm install
npm run dev
```
