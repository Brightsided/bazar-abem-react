# 🛒 Bazar Abem - Sistema de Gestión de Ventas

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Brightsided/bazar-abem-react/blob/main/docs/LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2+-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/mysql-8.0+-blue.svg)](https://www.mysql.com/)

Sistema moderno y completo para la gestión de ventas, clientes, productos, reportes y más, desarrollado con **React**, **Node.js**, **TypeScript** y **MySQL**.

## ✨ Características Principales

- 🔐 **Autenticación segura** con JWT
- 📊 **Dashboard interactivo** con gráficos en tiempo real
- 🛍️ **Gestión de productos** con búsqueda avanzada
- 👥 **Gestión de clientes** con historial de compras
- 💳 **Registro de ventas** con cálculo automático
- 📈 **Reportes detallados** por período, vendedor y tipo de comprobante
- 📄 **Generación de PDFs** (Facturas y Boletas)
- 🔲 **Códigos QR** automáticos en comprobantes
- 📧 **Envío de comprobantes por email**
- 💬 **Integración WhatsApp** para notificaciones
- 🎨 **Interfaz moderna** con Tailwind CSS
- 📱 **Responsive design** para todos los dispositivos

## 🏗️ Arquitectura del Proyecto

```
bazar-abem-react/
├── backend/                    # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/            # Configuración (Base de datos)
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── middleware/         # Autenticación, manejo de errores
│   │   ├── routes/             # Definición de endpoints
│   │   ├── services/           # Servicios (Email, PDF, QR)
│   │   └── server.ts           # Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma       # Esquema de base de datos
│   │   └── seed.ts             # Datos iniciales
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/              # Páginas principales
│   │   ├── services/           # API calls
│   │   ├── store/              # Estado global (Zustand)
│   │   ├── types/              # Tipos TypeScript
│   │   ├── utils/              # Funciones auxiliares
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docs/                       # Documentación completa
├── database-init.sql           # Script de inicialización
└── .gitignore
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Express.js** - Framework web
- **Prisma** - ORM para base de datos
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación
- **Nodemailer** - Envío de emails
- **PDFKit** - Generación de PDFs
- **QRCode** - Códigos QR
- **bcrypt** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **CORS** - Control de acceso

### Frontend
- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Bundler rápido
- **Tailwind CSS** - Estilos
- **React Router** - Navegación
- **Zustand** - Estado global
- **React Query** - Gestión de datos
- **React Hook Form** - Manejo de formularios
- **Recharts** - Gráficos
- **Lucide React** - Iconos
- **SweetAlert2** - Alertas modernas

## 📋 Requisitos Previos

- **Node.js** 18+
- **npm** o **yarn**
- **MySQL** 8.0+
- **Git**

## 🚀 Instalación Rápida

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/Brightsided/bazar-abem-react.git
cd bazar-abem-react
```

### 2️⃣ Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus datos de base de datos
# DATABASE_URL="mysql://usuario:contraseña@localhost:3306/bazar_abem"

# Ejecutar migraciones
npm run prisma:migrate

# Poblar datos iniciales (opcional)
npm run prisma:seed

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

### 3️⃣ Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env si es necesario (configurar URL de API)
# VITE_API_URL=http://localhost:3000/api

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 📚 Scripts Disponibles

### Backend

```bash
npm run dev              # Desarrollar con watch
npm run build            # Compilar a JavaScript
npm run start            # Ejecutar versión compilada
npm run prisma:migrate   # Ejecutar migraciones pendientes
npm run prisma:studio    # Abrir Prisma Studio
npm run prisma:seed      # Poblar base de datos
npm run prisma:reset     # Resetear base de datos
npm run create-admin     # Crear usuario administrador
```

### Frontend

```bash
npm run dev              # Desarrollar con Vite
npm run build            # Compilar para producción
npm run lint             # Verificar código
npm run preview          # Previsualizar build
```

## 👤 Credenciales de Acceso

Después de ejecutar las migraciones y seed, puedes acceder con:

- **Usuario:** `admin`
- **Contraseña:** (Ver `docs/USUARIOS_DB.TXT`)

## 🔧 Configuración de Variables de Entorno

### Backend (.env)

```env
# Database
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/bazar_abem"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=tu_secreto_muy_seguro_aqui

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-app
SMTP_FROM=tu-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Bazar Abem
```

## 📊 Endpoints Principales de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Ventas
- `POST /api/ventas` - Registrar venta
- `GET /api/ventas` - Listar ventas
- `GET /api/ventas/:id` - Obtener detalle de venta

### Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/:id` - Obtener cliente

### Reportes
- `GET /api/reportes/ventas` - Reporte de ventas
- `GET /api/reportes/productos` - Reporte de productos
- `GET /api/reportes/clientes` - Reporte de clientes

## 📖 Documentación

Para más información, consulta la documentación en la carpeta `docs/`:

- [README.md](./docs/README.md) - Documentación completa
- [ESTRUCTURA-PROYECTO.md](./docs/ESTRUCTURA-PROYECTO.md) - Estructura del proyecto
- [INICIO-RAPIDO.md](./docs/INICIO-RAPIDO.md) - Guía de inicio rápido
- [PERSONALIZACION.md](./docs/PERSONALIZACION.md) - Personalización del sistema

## 🐛 Solución de Problemas

### Error de conexión a base de datos
- Verifica que MySQL esté ejecutándose
- Comprueba las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Puerto ya en uso
- Backend: `lsof -i :3000` (macOS/Linux) o `netstat -ano | findstr :3000` (Windows)
- Frontend: `lsof -i :5173` (macOS/Linux)

### Errores de compilación
- Elimina `node_modules` y `.next`/`dist`
- Ejecuta `npm install` nuevamente
- Limpia la caché: `npm cache clean --force`

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Para más detalles, consulta [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](./docs/LICENSE) para detalles.

## 👨‍💻 Autor

**Bazar Abem**

- GitHub: [@Brightsided](https://github.com/Brightsided)

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

1. Consulta la documentación en `docs/`
2. Abre un issue en GitHub
3. Contacta al equipo de desarrollo

## 🎯 Hoja de Ruta

- ✅ Sistema de ventas básico
- ✅ Gestión de clientes
- ✅ Reportes
- ✅ Generación de PDFs
- ✅ Integración de email
- ⏳ Integración con sistemas de pago
- ⏳ Aplicación móvil
- ⏳ API GraphQL

---

**Última actualización:** Diciembre 2025

**Status:** ✅ En producción

¡Gracias por usar Bazar Abem! 🙏