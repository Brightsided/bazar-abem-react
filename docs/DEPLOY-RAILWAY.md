# Despliegue en Railway (Frontend + Backend + MySQL)

Este proyecto queda desplegado como un solo servicio web en Railway:
- Backend Express en Node.js
- Frontend React/Vite servido como archivos estaticos por el backend en produccion
- Base de datos MySQL en Railway

## 1) Crear servicios en Railway

1. Crea un proyecto nuevo.
2. Agrega servicio de base de datos `MySQL`.
3. Agrega servicio `Web` conectado a este repositorio.
4. En el servicio Web, usa el raiz del repo como `Root Directory` (`/`).

## 2) Build y Start

Railway detectara desde `package.json` raiz:
- Build: `npm run build`
- Start: `npm run start`

## 3) Variables de entorno (Servicio Web)

Configura en Railway estas variables:

- `NODE_ENV=production`
- `TZ=America/Lima`
- `DATABASE_URL=<URL MySQL de Railway>`
- `JWT_SECRET=<secreto-fuerte>`
- `JWT_EXPIRES_IN=7d`
- `JWT_REFRESH_SECRET=<secreto-fuerte-diferente>`
- `JWT_REFRESH_EXPIRES_IN=30d`
- `FRONTEND_URL=https://<tu-dominio-railway>`

Opcionales (si usaras correo):
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_ENCRYPTION`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

## 4) Inicializar esquema y cargar solo usuarios

Opcion recomendada:

1. Ejecuta migraciones Prisma (crea tablas):
   - En shell del servicio Web: `npm --prefix backend exec prisma migrate deploy`
2. Inserta solo usuarios iniciales (`admin` y `trabajador`) con:
   - Contenido de `database-users-only.sql`
   - O usando la seccion de consultas SQL del servicio MySQL en Railway.

Credenciales iniciales:
- admin / admin123
- trabajador / trabajador123

## 5) Notas importantes

- El frontend usa por defecto `'/api'`, por eso funciona en el mismo dominio del backend.
- El backend expone healthcheck en `/health`.
- Si cambias dominio, actualiza `FRONTEND_URL`.
