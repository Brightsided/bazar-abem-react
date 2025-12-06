# 🚀 Inicio Rápido - Bazar Abem

## Pasos para ejecutar el proyecto

### 1️⃣ Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

### 2️⃣ Configurar variables de entorno

**Backend** - Crear `backend/.env`:
```env
DATABASE_URL="mysql://root:@localhost:3306/bazar_abem"
JWT_SECRET=mi_secreto_super_seguro_123
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
TZ=America/Lima

# SMTP (opcional, para envío de emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USERNAME=tu_email@gmail.com
SMTP_PASSWORD=tu_password_app
SMTP_FROM_EMAIL=tu_email@gmail.com
SMTP_FROM_NAME=Bazar Abem
```

**Frontend** - Crear `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Bazar Abem
```

### 3️⃣ Configurar base de datos

```bash
# Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE bazar_abem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Ejecutar migraciones de Prisma
cd backend
npx prisma generate
npx prisma migrate dev --name init

# Poblar con datos iniciales
npx tsx prisma/seed.ts
```

### 4️⃣ Ejecutar el proyecto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5️⃣ Acceder a la aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 6️⃣ Credenciales de acceso

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Vendedor:**
- Usuario: `vendedor`
- Contraseña: `vendedor123`

---

## ⚠️ Solución de problemas comunes

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error de conexión a MySQL
```bash
# Verificar que MySQL esté corriendo
mysql --version

# Verificar credenciales en DATABASE_URL
```

### Puerto en uso
```bash
# Cambiar puerto en backend/.env
PORT=3001

# O matar el proceso que usa el puerto
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

### Error de Prisma
```bash
cd backend
npx prisma generate
npx prisma migrate reset  # ¡Cuidado! Borra todos los datos
npx tsx prisma/seed.ts
```

---

## 📦 Estructura de carpetas importante

```
bazar-abem-react/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Servicios (PDF, Email, QR)
│   │   └── server.ts       # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma   # Esquema de BD
│   │   └── seed.ts         # Datos iniciales
│   └── .env                # Variables de entorno
│
└── frontend/
    ├── src/
    │   ├── pages/          # Páginas principales
    │   ├── components/     # Componentes reutilizables
    │   ├── services/       # Llamadas a la API
    │   └── store/          # Estado global
    └── .env                # Variables de entorno
```

---

## 🎯 Próximos pasos

1. ✅ Cambiar las contraseñas por defecto
2. ✅ Configurar SMTP para envío de emails
3. ✅ Personalizar logo y datos de la empresa
4. ✅ Agregar más productos y clientes
5. ✅ Configurar backup de base de datos

---

**¡Listo! Tu sistema de ventas está funcionando 🎉**
