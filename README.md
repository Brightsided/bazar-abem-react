# 🛒 Bazar Abem - Sistema Integral de Gestión de Ventas e Inventario

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Brightsided/bazar-abem-react/blob/main/docs/LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2+-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/mysql-8.0+-blue.svg)](https://www.mysql.com/)
[![Vite](https://img.shields.io/badge/vite-7.2+-purple.svg)](https://vitejs.dev/)

Sistema moderno, completo y profesional para la gestión integral de ventas, inventario, clientes, productos y reportes. Desarrollado con **React 18**, **Node.js**, **TypeScript**, **Prisma ORM** y **MySQL**, con una interfaz moderna y responsiva.

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- Autenticación segura con **JWT** (JSON Web Tokens)
- Contraseñas hasheadas con **bcrypt**
- Protección de rutas con middleware de autenticación
- Roles de usuario (Administrador y Vendedor)
- Persistencia de sesión en localStorage

### 📊 Dashboard Interactivo
- Estadísticas en tiempo real (ventas hoy, ingresos, promedio por venta)
- Últimas 7 ventas registradas
- Calculadora integrada
- Widget de alertas de stock bajo
- Interfaz moderna con gradientes y animaciones

### 🛍️ Gestión de Productos
- Crear, editar y listar productos
- Búsqueda avanzada de productos
- Gestión de precios
- Integración con sistema de almacenamiento
- Validación de datos en tiempo real

### 👥 Gestión de Clientes
- Crear y listar clientes
- Búsqueda de clientes
- Historial de compras por cliente
- Soporte para "Cliente Casual" (compras sin cliente específico)
- Validación de nombres únicos

### 💳 Registro de Ventas
- Interfaz intuitiva para registrar ventas
- Búsqueda y selección de productos
- Cálculo automático de totales
- Múltiples métodos de pago:
  - Efectivo
  - Tarjeta de Crédito/Débito
  - Yape (billetera digital)
- Validación de stock disponible
- Descuento automático de stock al registrar venta
- Resumen en tiempo real de la venta

### 📦 Gestión de Almacenamiento e Inventario
- **Control de Stock**: Visualización completa del inventario
- **Alertas de Stock Bajo**: Sistema automático de alertas cuando el stock cae por debajo del mínimo
- **Movimientos de Inventario**: Registro detallado de todas las entradas, salidas y ajustes
- **Códigos de Barras**: Generación automática de códigos CODE128
- **Descarga de Códigos**: Exportar códigos de barras como imágenes PNG
- **Edición de Productos**: Actualizar stock, precio y stock mínimo
- **Agregar Productos**: Crear nuevos productos directamente desde el almacenamiento
- **Historial de Movimientos**: Trazabilidad completa de cambios en inventario

### 📈 Reportes Avanzados
- **Filtros Flexibles**: Hoy, Semana, Mes, Año, Personalizado
- **Gráficos Interactivos**:
  - Ventas por fecha (línea)
  - Distribución de métodos de pago (pastel)
- **Tabla Detallada de Ventas**: Con búsqueda en tiempo real
- **Ranking de Vendedores**: Top vendedores por período
- **Estadísticas Resumidas**:
  - Total de ventas
  - Ingresos totales
  - Promedio por venta
- **Acciones Rápidas**: Email, WhatsApp, Boleta desde reportes

### 📄 Generación de Comprobantes
- **Boletas**: Comprobantes simplificados
- **Facturas**: Comprobantes formales con RUC
- **Códigos QR**: Generación automática en comprobantes
- **Exportación a PDF**: Descarga directa de comprobantes
- **Diseño Profesional**: Formato imprimible y profesional

### 📧 Integración de Comunicación
- **Envío por Email**: Enviar comprobantes por correo electrónico
- **Integración WhatsApp**: Enviar comprobantes y notificaciones por WhatsApp
- **Modales Interactivos**: Interfaz amigable para envíos

### 🔲 Validación de RUC
- Cálculo y validación de RUC (Registro Único de Contribuyente)
- Verificación de dígito verificador
- Interfaz dedicada para validación

### 🎨 Interfaz Moderna
- **Diseño Responsivo**: Funciona perfectamente en desktop, tablet y móvil
- **Tema Oscuro/Claro**: Toggle de tema con persistencia
- **Tailwind CSS**: Estilos modernos y consistentes
- **Animaciones Suaves**: Transiciones y efectos visuales
- **Iconos FontAwesome**: Iconografía profesional
- **Componentes Reutilizables**: Arquitectura modular

### 🔄 Optimizaciones de Rendimiento
- **React Query**: Gestión eficiente de caché y sincronización de datos
- **Debouncing**: Búsquedas optimizadas sin múltiples requests
- **Índices de Base de Datos**: Optimización de queries para reportes
- **Compresión GZIP**: Reducción de tamaño de respuestas
- **Lazy Loading**: Carga perezosa de componentes

## 🏗️ Arquitectura del Proyecto

```
bazar-abem-react/
├── backend/                    # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts     # Configuración de Prisma
│   │   ├── controllers/        # Lógica de negocio
│   │   │   ├── authController.ts
│   │   │   ├── ventasController.ts
│   │   │   ├── productosController.ts
│   │   │   ├── clientesController.ts
│   │   │   ├── almacenamientoController.ts
│   │   │   ├── reportesController.ts
│   │   │   ├── comprobantesController.ts
│   │   │   └── rucController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts         # Autenticación JWT
│   │   │   └── errorHandler.ts # Manejo de errores
│   │   ├── routes/             # Definición de endpoints
│   │   │   ├── auth.ts
│   │   │   ├── ventas.ts
│   │   │   ├── productos.ts
│   │   │   ├── clientes.ts
│   │   │   ├── almacenamiento.ts
│   │   │   ├── reportes.ts
│   │   │   ├── comprobantes.ts
│   │   │   └── ruc.ts
│   │   ├── services/           # Servicios externos
│   │   │   ├── emailService.ts # Nodemailer
│   │   │   ├── pdfService.ts   # PDFKit
│   │   │   └── qrService.ts    # QRCode
│   │   └── server.ts           # Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma       # Esquema de base de datos
│   │   ├── seed.ts             # Datos iniciales
│   │   └── migrations/         # Historial de migraciones
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/         # Gráficos (Recharts)
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   └── PaymentMethodChart.tsx
│   │   │   ├── common/         # Componentes reutilizables
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── Calculator.tsx
│   │   │   │   └── StockAlertsWidget.tsx
│   │   │   ├── forms/          # Componentes de formularios
│   │   │   │   ├── ProductSearch.tsx
│   │   │   │   └── ClientSearch.tsx
│   │   │   ├── layout/         # Layout principal
│   │   │   │   ├── Header.tsx
│   │   │   ��   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── modals/         # Modales
│   │   │   │   ├── EmailModal.tsx
│   │   │   │   ├── WhatsAppModal.tsx
│   │   │   │   ├── BolletaPrintModal.tsx
│   │   │   │   └── FacturaPrintModal.tsx
│   │   │   └── pdf/            # Componentes PDF
│   │   │       ├── BoletaPDF.tsx
│   │   │       ├── FacturaPDF.tsx
│   │   │       └── BoletaPDFWithQR.tsx
│   │   ├── pages/              # Páginas principales
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── RegisterSale.tsx
│   │   │   ├── Almacenamiento.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── RUC.tsx
│   │   ├── services/           # API calls
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── ventasService.ts
│   │   │   ├── productosService.ts
│   │   │   ├── clientesService.ts
│   │   │   ├── almacenamientoService.ts
│   │   │   ├── reportesService.ts
│   │   │   └── rucService.ts
│   │   ├── store/              # Estado global (Zustand)
│   │   │   ├���─ authStore.ts
│   │   │   └── themeStore.ts
│   │   ├── types/              # Tipos TypeScript
│   │   │   └── index.ts
│   │   ├── utils/              # Funciones auxiliares
│   │   │   ├── alerts.ts
│   │   │   ├── formatters.ts
│   │   │   └── boletaPrinter.ts
│   │   ├── hooks/              # Custom hooks
│   │   │   └── useDebounce.ts
│   │   ├── config/
│   │   │   └── queryClient.ts  # React Query config
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docs/                       # Documentación completa
└── .gitignore
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Express.js** - Framework web minimalista
- **Prisma** - ORM moderno para base de datos
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación segura
- **Nodemailer** - Envío de emails
- **PDFKit** - Generación de PDFs
- **QRCode** - Generación de códigos QR
- **bcrypt** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **CORS** - Control de acceso entre dominios
- **Morgan** - Logging de requests
- **Compression** - Compresión GZIP

### Frontend
- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Bundler rápido y moderno
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación SPA
- **Zustand** - Gestión de estado global
- **React Query** - Gestión de datos y caché
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Recharts** - Gráficos interactivos
- **Lucide React** - Iconos modernos
- **FontAwesome** - Iconografía adicional
- **SweetAlert2** - Alertas modernas
- **Axios** - Cliente HTTP
- **date-fns** - Manipulación de fechas
- **QRCode.react** - Generación de QR en React
- **React Barcode** - Generación de códigos de barras

## 📋 Requisitos Previos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **npm** o **yarn**
- **MySQL** 8.0+ ([Descargar](https://www.mysql.com/downloads/mysql/))
- **Git** ([Descargar](https://git-scm.com/))

## 🚀 Instalación Rápida

### 1️⃣ Clonar el Repositorio

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
# JWT_SECRET="tu_secreto_muy_seguro_aqui"
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="tu-email@gmail.com"
# SMTP_PASS="tu-contraseña-app"

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

# Editar .env si es necesario
# VITE_API_URL=http://localhost:3000/api
# VITE_APP_NAME=Bazar Abem

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 📚 Scripts Disponibles

### Backend

```bash
npm run dev              # Desarrollar con watch (tsx)
npm run build            # Compilar TypeScript a JavaScript
npm run start            # Ejecutar versión compilada
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones pendientes
npm run prisma:studio    # Abrir Prisma Studio (GUI)
npm run prisma:seed      # Poblar base de datos con datos iniciales
npm run prisma:reset     # Resetear base de datos (cuidado!)
npm run create-admin     # Crear usuario administrador
```

### Frontend

```bash
npm run dev              # Desarrollar con Vite (hot reload)
npm run build            # Compilar para producción
npm run lint             # Verificar código con ESLint
npm run preview          # Previsualizar build de producción
```

## 👤 Credenciales de Acceso

Después de ejecutar las migraciones y seed, puedes acceder con:

- **Usuario:** `admin`
- **Contraseña:** (Ver `docs/USUARIOS_DB.TXT`)

O crear un nuevo usuario administrador:
```bash
cd backend
npm run create-admin
```

## 🔧 Configuración de Variables de Entorno

### Backend (.env)

```env
# Database
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/bazar_abem"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=tu_secreto_muy_seguro_aqui_minimo_32_caracteres

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
- `GET /api/ventas` - Listar todas las ventas
- `GET /api/ventas/:id` - Obtener detalle de venta
- `POST /api/ventas` - Registrar nueva venta
- `DELETE /api/ventas/:id` - Eliminar venta

### Productos
- `GET /api/productos` - Listar todos los productos
- `GET /api/productos/search` - Buscar productos
- `POST /api/productos` - Crear nuevo producto
- `PUT /api/productos/:id` - Actualizar producto

### Clientes
- `GET /api/clientes` - Listar todos los clientes
- `POST /api/clientes` - Crear nuevo cliente

### Almacenamiento
- `GET /api/almacenamiento` - Listar inventario completo
- `GET /api/almacenamiento/:id` - Obtener producto del almacenamiento
- `GET /api/almacenamiento/stock-bajo` - Productos con stock bajo
- `GET /api/almacenamiento/alertas` - Alertas de stock
- `POST /api/almacenamiento` - Crear almacenamiento
- `PUT /api/almacenamiento/:id` - Actualizar almacenamiento
- `POST /api/almacenamiento/:id/stock` - Actualizar stock
- `POST /api/almacenamiento/:id/codigo-barras` - Generar código de barras
- `GET /api/almacenamiento/movimientos` - Historial de movimientos

### Reportes
- `GET /api/reportes/dashboard` - Estadísticas del dashboard
- `GET /api/reportes/ventas` - Reporte de ventas con filtros
- `POST /api/reportes/ventas/export` - Exportar reporte a CSV

### Comprobantes
- `POST /api/comprobantes/pdf` - Generar PDF
- `POST /api/comprobantes/email` - Enviar por email
- `POST /api/comprobantes/whatsapp` - Enviar por WhatsApp

### RUC
- `POST /api/ruc/validar` - Validar RUC

## 📖 Documentación

Para más información, consulta la documentación en la carpeta `docs/`:

- [ESTRUCTURA-PROYECTO.md](./docs/ESTRUCTURA-PROYECTO.md) - Estructura detallada del proyecto
- [INICIO-RAPIDO.md](./docs/INICIO-RAPIDO.md) - Guía de inicio rápido
- [PERSONALIZACION.md](./docs/PERSONALIZACION.md) - Personalización del sistema
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) - Guía de contribución

## 🐛 Solución de Problemas

### Error de conexión a base de datos
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solución:**
- Verifica que MySQL esté ejecutándose
- Comprueba las credenciales en `.env`
- Asegúrate de que la base de datos existe
- En Windows: `mysql -u usuario -p` para verificar conexión

### Puerto ya en uso
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solución:**
- Windows: `netstat -ano | findstr :3000` y luego `taskkill /PID <PID> /F`
- macOS/Linux: `lsof -i :3000` y luego `kill -9 <PID>`

### Errores de compilación
```
Error: Cannot find module '@prisma/client'
```
**Solución:**
- Elimina `node_modules` y `package-lock.json`
- Ejecuta `npm install` nuevamente
- Ejecuta `npm run prisma:generate`

### Errores de autenticación
```
Error: Invalid token
```
**Solución:**
- Verifica que JWT_SECRET esté configurado en `.env`
- Limpia localStorage en el navegador
- Vuelve a iniciar sesión

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
2. Revisa los issues existentes en GitHub
3. Abre un nuevo issue con detalles del problema
4. Contacta al equipo de desarrollo

## 🎯 Hoja de Ruta

- ✅ Sistema de ventas completo
- ✅ Gestión de clientes
- ✅ Gestión de inventario
- ✅ Reportes avanzados
- ✅ Generación de PDFs
- ✅ Integración de email
- ✅ Integración WhatsApp
- ✅ Códigos de barras
- ✅ Validación de RUC
- ⏳ Integración con sistemas de pago
- ⏳ Aplicación móvil nativa
- ⏳ API GraphQL
- ⏳ Sincronización en tiempo real (WebSockets)

## 📊 Estadísticas del Proyecto

- **Líneas de Código**: 10,000+
- **Componentes React**: 25+
- **Endpoints API**: 30+
- **Modelos de Base de Datos**: 8
- **Funcionalidades**: 50+

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de entrada en servidor
- ✅ Protección CORS
- ✅ Headers de seguridad HTTP (Helmet)
- ✅ Validación de esquemas con Zod
- ✅ Middleware de autenticación

## 🚀 Rendimiento

- ✅ Índices de base de datos optimizados
- ✅ Caché con React Query
- ✅ Compresión GZIP
- ✅ Lazy loading de componentes
- ✅ Debouncing en búsquedas
- ✅ Vite para bundling rápido

---

## 🆕 Versión 1.2 - Nuevas Características Implementadas

### 🏷️ Facturación Electrónica SUNAT
Sistema completo de facturación electrónica integrado con SUNAT en ambiente BETA:

**Características:**
- ✅ Generación de comprobantes XML UBL 2.1 conforme a estándar SUNAT
- ✅ Facturación automática directa desde tabla de ventas
- ✅ Modal interactivo de SUNAT con gestión completa de estados
- ✅ Cálculo automático de IGV (18%)
- ✅ Firma digital simulada en BETA (listo para certificado en producción)
- ✅ Envío automático a servidores SUNAT con reintentos
- ✅ Descarga de XML generado y CDR de respuesta
- ✅ Historial de intentos y mensajes de SUNAT
- ✅ Estados de facturación: PENDIENTE → FIRMADO → ENVIADO → ACEPTADO/RECHAZADO
- ✅ Validación de RUC integrada
- ✅ Ejemplo de XML incluido para referencia

**Archivos Nuevos:**
- `backend/src/controllers/facturacionElectronicaController.ts` - Lógica de facturación
- `backend/src/routes/facturacion.ts` - Endpoints SUNAT
- `backend/src/services/sunatService.ts` - Integración con SUNAT
- `backend/.env.sunat.example` - Variables de entorno de ejemplo
- `frontend/src/pages/CierreCaja.tsx` - Página de cierre de caja
- `frontend/src/components/modals/SunatModal.tsx` - Modal de facturación
- `frontend/src/services/facturacionService.ts` - Llamadas API de facturación
- Documentación completa: `DOCUMENTACION_COMPLETA_SUNAT.md`, `GUIA-IMPLEMENTACION-SUNAT.md`, etc.

### 🏪 Sistema de Cierre de Caja
Módulo completo para el cierre de caja con gestión de efectivo y pagos:

**Características:**
- ✅ Interfaz intuitiva para cerrar caja
- ✅ Registro de efectivo en caja (apertura y cierre)
- ✅ Registro de pagos a bancos y proveedores
- ✅ Cálculo automático de diferencias
- ✅ Resumen detallado de movimientos
- ✅ Historial de cierres anteriores
- ✅ Validación de datos completa
- ✅ Estados de cierre (ABIERTA, EN_PROCESO, CERRADA)
- ✅ PDF descargable del cierre
- ✅ Email del resumen de cierre

**Archivos Nuevos:**
- `backend/src/controllers/cierreCajaController.ts` - Lógica del cierre
- `backend/src/routes/cierreCaja.ts` - Endpoints de cierre
- `frontend/src/pages/CierreCaja.tsx` - Página de cierre de caja
- `frontend/src/services/cierreCajaService.ts` - Llamadas API
- Documentación: `CIERRE-CAJA-EXPLICACION-COMPLETA.md`, `CIERRE-CAJA-INICIO-RAPIDO.md`, etc.

### 🔄 Mejoras Generales
- ✅ Actualización del schema de Prisma con nuevas tablas (FacturacionElectronica, CierreCaja, PagoBanco, PagoProveedor)
- ✅ Nuevas rutas y controladores en backend
- ✅ Integración en Sidebar con acceso rápido a nuevas funcionalidades
- ✅ Mejoras en el servicio de PDF para soportar nuevos comprobantes
- ✅ Optimización de tipos TypeScript
- ✅ Documentación exhaustiva para implementación

### 📚 Documentación Nueva Incluida
- DOCUMENTACION_COMPLETA_SUNAT.md
- GUIA-IMPLEMENTACION-SUNAT.md
- CIERRE-CAJA-EXPLICACION-COMPLETA.md
- CIERRE-CAJA-INICIO-RAPIDO.md
- Y más de 15 documentos de soporte

**Última actualización:** Diciembre 2025

**Status:** ✅ En producción

**Versión:** 1.2.0

¡Gracias por usar Bazar Abem! 🙏
