# 🛒 Bazar Abem - Sistema de Ventas

Sistema de gestión de ventas moderno desarrollado con React, TypeScript, Node.js y MySQL.

## 📋 Características

- ✅ Registro de ventas con múltiples productos
- 📊 Dashboard con estadísticas en tiempo real
- 📈 Reportes dinámicos con gráficos interactivos
- 🧾 Generación de boletas y facturas en PDF
- 📧 Envío de comprobantes por email
- 💰 Cálculo automático de RUC
- 🔐 Sistema de autenticación con JWT
- 🌓 Tema claro/oscuro
- 📱 Diseño responsive
- 🧮 Calculadora integrada

## 🛠️ Tecnologías

### Frontend
- React 18 + TypeScript
- Vite
- React Router v6
- TanStack Query (React Query)
- Zustand (Estado global)
- Tailwind CSS
- ApexCharts
- SweetAlert2
- React Hook Form + Zod

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- MySQL
- JWT (Autenticación)
- bcrypt (Hash de contraseñas)
- PDFKit (Generación de PDFs)
- QRCode (Códigos QR)
- Nodemailer (Envío de emails)

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- MySQL 8+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd bazar-abem-react
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:

```env
# Database
DATABASE_URL="mysql://root:@localhost:3306/bazar_abem"

# JWT
JWT_SECRET=tu_secret_key_super_segura_aqui
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=tu_refresh_secret_aqui
JWT_REFRESH_EXPIRES_IN=30d

# Server
PORT=3000
NODE_ENV=development

# SMTP (Gmail ejemplo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USERNAME=tu_email@gmail.com
SMTP_PASSWORD=tu_password_de_aplicacion
SMTP_FROM_EMAIL=tu_email@gmail.com
SMTP_FROM_NAME=Bazar Abem

# Timezone
TZ=America/Lima
```

### 3. Configurar Base de Datos

Crear la base de datos:

```bash
mysql -u root -p
CREATE DATABASE bazar_abem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

O usar el script SQL incluido:

```bash
mysql -u root -p < database-init.sql
```

Ejecutar migraciones de Prisma:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Poblar la base de datos con datos iniciales:

```bash
npx tsx prisma/seed.ts
```

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Bazar Abem
```

## 🚀 Ejecución

### Modo Desarrollo

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

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Health: http://localhost:3000/health

### Modo Producción

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 👤 Credenciales de Acceso

Después de ejecutar el seed, puedes acceder con:

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Vendedor:**
- Usuario: `vendedor`
- Contraseña: `vendedor123`

## 📁 Estructura del Proyecto

```
bazar-abem-react/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   └── seed.ts            # Datos iniciales
│   ├── scripts/
│   │   └── hash-password.js   # Utilidad para hashear contraseñas
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts    # Configuración de Prisma
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── middleware/        # Middleware (auth, errors)
│   │   ├── routes/            # Definición de rutas
│   │   ├── services/          # Servicios (PDF, Email, QR)
│   │   └── server.ts          # Servidor Express
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Componentes reutilizables
│   │   │   ├── forms/         # Formularios
│   │   │   └── layout/        # Layout (Sidebar, Header)
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # Servicios API
│   │   ├── store/             # Estado global (Zustand)
│   │   ├── types/             # Tipos TypeScript
│   │   ├── utils/             # Utilidades
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── .gitignore
├── database-init.sql
├── prompt.md
└── README.md
```

## 🔧 Scripts Disponibles

### Backend

```bash
npm run dev          # Modo desarrollo con hot reload
npm run build        # Compilar TypeScript
npm start            # Ejecutar versión compilada
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio
```

### Frontend

```bash
npm run dev          # Modo desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
```

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Ventas
- `GET /api/ventas` - Listar ventas
- `GET /api/ventas/:id` - Obtener venta por ID
- `POST /api/ventas` - Crear venta
- `PUT /api/ventas/:id` - Actualizar venta
- `DELETE /api/ventas/:id` - Eliminar venta

### Reportes
- `GET /api/reportes/dashboard` - Estadísticas del dashboard
- `GET /api/reportes/ventas` - Reportes con filtros
- `GET /api/reportes/metodos-pago` - Estadísticas de métodos de pago
- `GET /api/reportes/ranking-usuarios` - Ranking de vendedores

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/search?q=...` - Buscar productos
- `POST /api/productos` - Crear producto

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente

### RUC
- `POST /api/ruc/calcular` - Calcular RUC

### Comprobantes
- `GET /api/comprobantes/:id/pdf?tipo=boleta|factura` - Generar PDF
- `POST /api/comprobantes/:id/email` - Enviar por email

## 🔐 Configuración de Email (Gmail)

Para usar Gmail como servidor SMTP:

1. Habilitar verificación en 2 pasos en tu cuenta de Gmail
2. Generar una contraseña de aplicación:
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Copia la contraseña generada
3. Usa esa contraseña en `SMTP_PASSWORD` del archivo `.env`

## 🐛 Solución de Problemas

### Error de instalación del frontend (RESUELTO)

Si encuentras un error con `apexcharts` durante la instalación:

```bash
npm error ERESOLVE unable to resolve dependency tree
```

**Solución**: Este problema ya está corregido en el `package.json`. Si aún lo ves:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

Ver [SOLUCION-INSTALACION.md](SOLUCION-INSTALACION.md) para más detalles.

### Error de conexión a MySQL

```bash
# Verificar que MySQL esté corriendo
mysql --version
mysql -u root -p

# Si hay problemas de conexión, verifica el DATABASE_URL en .env
```

### Error de Prisma

```bash
# Regenerar cliente Prisma
npx prisma generate

# Resetear base de datos (¡cuidado, borra todos los datos!)
npx prisma migrate reset
```

### Puerto en uso

```bash
# Cambiar puerto en backend/.env
PORT=3001

# Cambiar puerto en frontend (vite.config.ts)
server: { port: 5174 }
```

## 📝 Notas Importantes

- La zona horaria está configurada para `America/Lima` (Perú)
- Los precios están en Soles Peruanos (S/)
- Las contraseñas se hashean con bcrypt (10 rounds)
- Los tokens JWT expiran en 7 días por defecto
- Los PDFs incluyen códigos QR para verificación

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**Bazar Abem**

---

**¡Gracias por usar Bazar Abem! 🎉**
