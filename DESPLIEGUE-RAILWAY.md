# 🚀 Guía de Despliegue en Railway - Bazar Abem

## Problema Identificado

El error `Connecting to 'http://localhost:3000/api/productos'` indica que el frontend está intentando conectarse a `localhost` en lugar del backend desplegado en Railway.

## Causa Raíz

1. El frontend fue compilado con una URL de API incorrecta apuntando a `localhost`
2. La base de datos no está sincronizada con el schema de Prisma
3. Las variables de entorno no están configuradas correctamente en Railway

---

## Pasos para Corregir

### 1. Configurar Variables de Entorno en Railway

Ve al panel de Railway de tu proyecto y configura estas variables:

```
DATABASE_URL=mysql://root:sytPXxnDsMtHkfRdiMHmQbnBwDQuJjsi@proxy.railway.internal:3306/railway
NODE_ENV=production
FRONTEND_URL=https://chic-wonder.up.railway.app
PORT=3000
```

### 2. Crear las Tablas en la Base de Datos

Railway MySQL está creado pero vacío. Tienes dos opciones:

**Opción A - Ejecutar SQL directamente (Recomendado):**

1. En Railway, ve a tu servicio MySQL
2. Click en "Database" > "Connect"
3. Copia la conexión externa
4. Ejecuta el SQL en el archivo `database-init.sql`

O mejor, usa Prisma para crear las tablas:

### 3. Ejecutar Migraciones de Prisma en Railway

Railway permite ejecutar comandos en el servicio desplegado. Crea un script de inicio que ejecute las migraciones:

```bash
# En tu terminal, conecta al servicio de Railway
railway run --service backend npx prisma migrate deploy
```

O agrega al `package.json` del backend:

```json
"scripts": {
  "postinstall": "prisma generate",
  "start": "node dist/server.js",
  "db:push": "prisma db push"
}
```

### 4. Rebuild del Frontend

El frontend actual está compilado con la URL incorrecta. Necesitas hacer rebuild:

```bash
# En tu proyecto local
npm run build
```

Esto regenerará los archivos en `frontend/dist` con la URL correcta del API.

### 5. Redeploy en Railway

```bash
railway up --detach
```

---

## Archivos Modificados

He realizado los siguientes cambios en tu proyecto:

1. **backend/.env** - Configurado para Railway con las credenciales de MySQL
2. **railway.toml** - Configuración de despliegue
3. **backend/src/server.ts** - CSP configurado para permitir conexiones del frontend
4. **frontend/vite.config.ts** - Preparado para build de producción

---

## Comandos Rápidos

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
cd backend && npx prisma generate

# Aplicar migraciones (desarrollo local)
cd backend && npx prisma migrate deploy

# Poblar base de datos con datos de prueba
cd backend && npx prisma db seed

# Build completo
npm run build

# Desplegar a Railway
railway up --detach

# Ver logs
railway logs
```

---

## Credenciales de Acceso ( después de desplegar )

- **Admin:** username: `admin`, password: `admin123`
- **Vendedor:** username: `trabajador`, password: `trabajador123`