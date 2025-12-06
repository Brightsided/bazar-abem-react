# 🛠️ Comandos Útiles - Bazar Abem

## 📦 Instalación

```bash
# Instalar todas las dependencias (backend + frontend)
cd backend && npm install && cd ../frontend && npm install && cd ..
```

## 🚀 Desarrollo

```bash
# Iniciar backend (Terminal 1)
cd backend
npm run dev

# Iniciar frontend (Terminal 2)
cd frontend
npm run dev
```

## 🗄️ Base de Datos (Prisma)

```bash
cd backend

# Generar cliente de Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Resetear base de datos (¡CUIDADO! Borra todos los datos)
npx prisma migrate reset

# Poblar base de datos con datos iniciales
npm run prisma:seed
# o
npx tsx prisma/seed.ts

# Abrir Prisma Studio (GUI para ver/editar datos)
npx prisma studio
```

## 🔐 Gestión de Usuarios

```bash
cd backend

# Hashear una contraseña
node scripts/hash-password.js mi_contraseña_segura

# Crear usuario manualmente en MySQL
mysql -u root -p bazar_abem
INSERT INTO usuarios (nombre, username, password, rol) 
VALUES ('Nuevo Usuario', 'nuevo_user', '$2b$10$...hash...', 'Vendedor');
```

## 🏗️ Build para Producción

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🧹 Limpieza

```bash
# Limpiar node_modules y reinstalar
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install

# Limpiar builds
cd backend
rm -rf dist

cd ../frontend
rm -rf dist
```

## 📊 Base de Datos MySQL

```bash
# Conectar a MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE bazar_abem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Usar base de datos
USE bazar_abem;

# Ver tablas
SHOW TABLES;

# Ver estructura de tabla
DESCRIBE ventas;

# Backup de base de datos
mysqldump -u root -p bazar_abem > backup_bazar_abem.sql

# Restaurar backup
mysql -u root -p bazar_abem < backup_bazar_abem.sql

# Eliminar base de datos (¡CUIDADO!)
DROP DATABASE bazar_abem;
```

## 🔍 Debugging

```bash
# Ver logs del backend en tiempo real
cd backend
npm run dev

# Ver logs de Prisma
cd backend
DEBUG=prisma:* npm run dev

# Verificar conexión a base de datos
cd backend
npx prisma db pull

# Ver estado de migraciones
npx prisma migrate status
```

## 📝 Git

```bash
# Inicializar repositorio
git init

# Agregar archivos
git add .

# Commit
git commit -m "Initial commit"

# Crear rama
git checkout -b feature/nueva-funcionalidad

# Ver cambios
git status
git diff

# Push a repositorio remoto
git remote add origin <url-repositorio>
git push -u origin main
```

## 🌐 Variables de Entorno

```bash
# Backend - Copiar ejemplo
cd backend
cp .env.example .env

# Frontend - Copiar ejemplo
cd frontend
cp .env.example .env

# Editar variables
# Windows:
notepad .env

# Linux/Mac:
nano .env
```

## 🔧 Solución de Problemas

```bash
# Puerto en uso (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Puerto en uso (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Verificar versión de Node
node --version

# Verificar versión de npm
npm --version

# Limpiar caché de npm
npm cache clean --force

# Verificar MySQL
mysql --version
mysql -u root -p -e "SELECT VERSION();"
```

## 📦 Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas las dependencias
npm update

# Actualizar una dependencia específica
npm install <paquete>@latest

# Actualizar dependencias de desarrollo
npm install --save-dev <paquete>@latest
```

## 🎨 Tailwind CSS

```bash
cd frontend

# Regenerar clases de Tailwind
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch

# Ver configuración de Tailwind
cat tailwind.config.js
```

## 📧 Configurar Gmail para SMTP

1. Ir a: https://myaccount.google.com/security
2. Activar verificación en 2 pasos
3. Ir a: https://myaccount.google.com/apppasswords
4. Crear contraseña de aplicación para "Correo"
5. Copiar la contraseña generada
6. Usar en `SMTP_PASSWORD` del archivo `.env`

## 🚀 Deploy

### Backend (Railway/Render)

```bash
# Build
npm run build

# Variables de entorno necesarias:
# - DATABASE_URL
# - JWT_SECRET
# - PORT
# - NODE_ENV=production
```

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Variables de entorno necesarias:
# - VITE_API_URL (URL del backend en producción)
```

## 📊 Monitoreo

```bash
# Ver uso de memoria
node --max-old-space-size=4096 dist/server.js

# Ver procesos de Node
ps aux | grep node

# Matar todos los procesos de Node (¡CUIDADO!)
pkill -f node
```

## 🔐 Seguridad

```bash
# Auditar dependencias
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix

# Corregir vulnerabilidades forzando actualizaciones
npm audit fix --force

# Verificar licencias de dependencias
npx license-checker
```

## 📚 Documentación

```bash
# Generar documentación de API (si tienes Swagger)
npm run docs

# Ver documentación de Prisma
npx prisma --help

# Ver documentación de un paquete
npm docs <nombre-paquete>
```

---

**💡 Tip**: Guarda este archivo como referencia rápida durante el desarrollo.
