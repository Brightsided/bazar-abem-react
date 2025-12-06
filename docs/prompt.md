# Contexto del Proyecto: Bazar Abem - Sistema de Ventas

## 📋 Descripción General
Sistema de gestión de ventas para Bazar Abem desarrollado originalmente en PHP vanilla con MySQL. El sistema permite registrar ventas, generar comprobantes (boletas y facturas), visualizar reportes dinámicos, calcular RUC y gestionar clientes.

---

## 🎯 Objetivo de Migración
**Migrar todo el proyecto a React** manteniendo todas las funcionalidades actuales, mejorando la experiencia de usuario y modernizando la arquitectura.

---

## 🏗️ Arquitectura Actual

### Backend (PHP)
- **Lenguaje**: PHP 7.4+
- **Base de Datos**: MySQL
- **Patrón**: MVC simplificado
- **Zona Horaria**: America/Lima (Perú)

### Frontend Actual
- HTML5, CSS3, JavaScript vanilla
- Font Awesome 6.5.0
- SweetAlert2 para alertas
- ApexCharts para gráficos
- Sin framework frontend

---

## 🗄️ Base de Datos

### Configuración de Conexión
```php
Host: localhost
Database: bazar_abem
Username: root
Password: (vacío)
Charset: utf8
PDO con manejo de excepciones
```

### Tablas Principales

#### 1. `ventas`
```sql
- id (PK, AUTO_INCREMENT)
- cliente (VARCHAR) - Nombre del cliente
- cliente_id (FK a clientes) - Relación con tabla clientes
- productos (TEXT) - Descripción concatenada de productos
- precio_total (DECIMAL) - Total de la venta
- metodo_pago (VARCHAR) - Efectivo, Tarjeta De Credito/Debito, Yape
- fecha_venta (DATETIME) - Timestamp de la venta
- usuario_id (FK a usuarios) - Usuario que registró la venta
```

#### 2. `detalle_venta`
```sql
- id (PK, AUTO_INCREMENT)
- venta_id (FK a ventas)
- producto_id (FK a productos)
- producto (VARCHAR) - Nombre del producto
- cantidad (INT) - Cantidad vendida
- precio (DECIMAL) - Precio unitario
```

#### 3. `clientes`
```sql
- id (PK, AUTO_INCREMENT)
- nombre (VARCHAR, UNIQUE) - Nombre del cliente
```

#### 4. `productos`
```sql
- id (PK, AUTO_INCREMENT)
- nombre (VARCHAR, UNIQUE) - Nombre del producto
```

#### 5. `usuarios`
```sql
- id (PK, AUTO_INCREMENT)
- nombre (VARCHAR) - Nombre completo
- username (VARCHAR, UNIQUE) - Usuario de login
- password (VARCHAR) - Hash de contraseña
- rol (VARCHAR) - Administrador o Vendedor
```

---

## 🔌 API Endpoints Actuales (AJAX)

### 1. `/public/ajax/obtener-ventas.php`
**Método**: POST  
**Parámetros**:
- `filtro`: 'hoy', 'semana', 'mes', 'ano', 'personalizado'
- `fecha_inicio`: YYYY-MM-DD (opcional)
- `fecha_fin`: YYYY-MM-DD (opcional)

**Respuesta**:
```json
{
  "success": true,
  "ventas": [...],
  "ventasPorFecha": {...},
  "ventasPorFechaDetalle": {...},
  "metodosPago": {...},
  "metodosPagoDetalle": {...},
  "tablaHTML": "...",
  "totalVentas": 0,
  "fechaInicio": "...",
  "fechaFin": "...",
  "filtro": "...",
  "rankingHTML": "..."
}
```

### 2. `/public/ajax/buscar-productos.php`
**Método**: GET  
**Parámetros**: `q` (término de búsqueda)  
**Respuesta**: Array de productos que coinciden

### 3. `/public/ajax/calcular-ruc.php`
**Método**: POST  
**Parámetros**: `mes`, `ano`  
**Respuesta**: Categoría RUC y monto a pagar

### 4. `/public/ajax/enviar-comprobante-email.php`
**Método**: POST  
**Parámetros**: `venta_id`, `email`, `tipo` (boleta/factura)  
**Respuesta**: Confirmación de envío

---

## 📦 Dependencias PHP (Composer)

```json
{
  "mpdf/mpdf": "8.1",           // Generación de PDFs
  "endroid/qr-code": "^4.8",    // Códigos QR para comprobantes
  "phpmailer/phpmailer": "^6.11" // Envío de emails
}
```

---

## 🎨 Funcionalidades Principales

### 1. Dashboard (index.php)
- **Estadísticas en tiempo real**:
  - Ventas del día
  - Ingresos del día
  - Ventas de la semana
  - Promedio por venta
- **Últimas 7 ventas** con detalles
- **Calculadora integrada**
- **Acciones rápidas**: Nueva venta, Reportes, Calcular RUC
- **Tema claro/oscuro**

### 2. Registrar Venta (registrar-venta.php)
- **Campos**:
  - Cliente (opcional, default: "Cliente Casual")
  - Productos dinámicos (nombre, cantidad, precio)
  - Método de pago (Efectivo, Tarjeta, Yape)
- **Características**:
  - Agregar múltiples productos
  - Cálculo automático del total
  - Autocompletado de productos
  - Validación en tiempo real

### 3. Reportes (reportes.php)
- **Filtros**:
  - Hoy, Semana, Mes, Año, Personalizado
- **Visualizaciones**:
  - Tabla de ventas con DataTable
  - Gráfico de ventas por fecha (ApexCharts)
  - Gráfico de métodos de pago (Pie chart)
  - Ranking de vendedores
- **Acciones por venta**:
  - Generar PDF (Boleta/Factura)
  - Enviar por WhatsApp
  - Enviar por Email

### 4. Calcular RUC (ruc.php)
- Selección de mes y año
- Cálculo automático según ventas totales:
  - < S/ 5,000: Categoría 1 (S/ 20)
  - S/ 5,000 - S/ 8,000: Categoría 2 (S/ 50)
  - > S/ 8,000: Excede RUS

### 5. Generación de Comprobantes
- **Boletas** (generar-boleta.php)
- **Facturas** (generar-factura.php)
- **PDF** (generar-pdf.php)
- Incluyen:
  - Logo de la empresa
  - Código QR
  - Detalles de productos
  - Total y método de pago

### 6. Sistema de Autenticación
- Login con usuario y contraseña
- Sesiones PHP
- Roles: Administrador y Vendedor
- Logout

---

## 🎨 Diseño y UI

### Paleta de Colores (Tema Claro)
```css
--primary: #6366f1 (Índigo)
--secondary: #8b5cf6 (Púrpura)
--accent: #ec4899 (Rosa)
--success: #22c55e (Verde)
--warning: #f59e0b (Ámbar)
--error: #ef4444 (Rojo)
--info: #0ea5e9 (Azul cielo)
```

### Componentes UI
- **Cards** con sombras y bordes redondeados
- **Sidebar** colapsable con navegación
- **Botones** con iconos de Font Awesome
- **Formularios** modernos con validación
- **Tablas** responsivas con hover effects
- **Gráficos** interactivos con ApexCharts
- **Alertas** con SweetAlert2
- **Toggle** de tema claro/oscuro

### Iconografía
- Font Awesome 6.5.0
- Iconos para cada acción y sección

---

## 📧 Configuración de Email

### SMTP (PHPMailer)
```php
Host: smtp.gmail.com
Port: 587
Encryption: TLS
Variables de entorno (.env):
- SMTP_HOST
- SMTP_PORT
- SMTP_ENCRYPTION
- SMTP_USERNAME
- SMTP_PASSWORD
- SMTP_FROM_EMAIL
- SMTP_FROM_NAME
```

---

## 🔐 Seguridad

### Implementaciones Actuales
- Sesiones PHP para autenticación
- Prepared statements (PDO) para prevenir SQL Injection
- Validación de datos en servidor
- Control de acceso por roles
- Variables de entorno para credenciales sensibles

---

## 📱 Características Especiales

### 1. Autocompletado de Productos
- Búsqueda en tiempo real
- Sugerencias basadas en productos existentes

### 2. Calculadora Integrada
- Operaciones básicas
- Interfaz tipo calculadora física

### 3. Exportación de Datos
- PDF con mPDF
- Códigos QR con endroid/qr-code
- Envío por email con PHPMailer

### 4. Gráficos Dinámicos
- ApexCharts para visualizaciones
- Actualización en tiempo real según filtros

### 5. Tema Claro/Oscuro
- Toggle persistente
- CSS variables para colores
- Transiciones suaves

---

## 🚀 Recomendaciones para React

### Stack Tecnológico Sugerido

#### Opción 1: React + TypeScript (RECOMENDADO)
**¿Por qué TypeScript?**
- ✅ Type safety para prevenir errores
- ✅ Mejor autocompletado y documentación
- ✅ Escalabilidad a largo plazo
- ✅ Interfaces claras para datos de BD
- ✅ Refactoring más seguro

**Stack completo**:
```
Frontend:
- React 18+ con TypeScript
- Vite (build tool rápido)
- React Router v6 (navegación)
- TanStack Query (React Query) para fetching
- Zustand o Context API (estado global)
- Axios (HTTP client)
- React Hook Form + Zod (formularios y validación)
- Tailwind CSS o Material-UI (estilos)
- ApexCharts React (gráficos)
- SweetAlert2 React (alertas)
- date-fns (manejo de fechas)

Backend:
- Node.js + Express + TypeScript
- MySQL2 (driver MySQL)
- Prisma ORM (type-safe database access)
- JWT (autenticación)
- bcrypt (hash de passwords)
- nodemailer (emails)
- pdfkit o puppeteer (PDFs)
- qrcode (códigos QR)
- dotenv (variables de entorno)
- cors (CORS middleware)
```

#### Opción 2: React + JavaScript
**¿Cuándo usar JavaScript?**
- ⚠️ Equipo sin experiencia en TypeScript
- ⚠️ Proyecto pequeño y de corta duración
- ⚠️ Prototipado rápido

**Stack completo**:
```
Frontend:
- React 18+ con JavaScript
- Vite
- React Router v6
- React Query
- Context API
- Axios
- React Hook Form
- Tailwind CSS
- ApexCharts React
- SweetAlert2 React

Backend:
- Node.js + Express
- MySQL2
- Sequelize ORM
- JWT
- bcrypt
- nodemailer
- pdfkit
- qrcode
- dotenv
- cors
```

### Estructura de Proyecto Sugerida

```
bazar-abem-react/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Botones, Cards, Modals
│   │   │   ├── layout/          # Sidebar, Header, Footer
│   │   │   ├── forms/           # Formularios reutilizables
│   │   │   └── charts/          # Componentes de gráficos
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── RegisterSale.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── RUC.tsx
│   │   │   └── Login.tsx
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API calls
│   │   ├── store/               # Estado global
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Funciones auxiliares
│   │   ├── styles/              # CSS/Tailwind
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── ventasController.ts
│   │   │   ├── authController.ts
│   │   │   └── reportesController.ts
│   │   ├── models/              # Prisma models
│   │   ├── routes/
│   │   │   ├── ventas.ts
│   │   │   ├── auth.ts
│   │   │   └── reportes.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── services/
│   │   │   ├── pdfService.ts
│   │   │   ├── emailService.ts
│   │   │   └── qrService.ts
│   │   ├── utils/
│   │   ├── config/
│   │   │   └── database.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example
└── README.md
```

### API REST Endpoints Sugeridos

```typescript
// Autenticación
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

// Ventas
GET    /api/ventas                    // Listar con filtros
GET    /api/ventas/:id                // Detalle de venta
POST   /api/ventas                    // Crear venta
PUT    /api/ventas/:id                // Actualizar venta
DELETE /api/ventas/:id                // Eliminar venta

// Reportes
GET    /api/reportes/dashboard        // Stats del dashboard
GET    /api/reportes/ventas           // Ventas con filtros
GET    /api/reportes/metodos-pago     // Estadísticas de métodos
GET    /api/reportes/ranking-usuarios // Ranking de vendedores

// RUC
POST   /api/ruc/calcular              // Calcular RUC

// Productos
GET    /api/productos                 // Listar productos
GET    /api/productos/search?q=...    // Buscar productos
POST   /api/productos                 // Crear producto

// Clientes
GET    /api/clientes                  // Listar clientes
POST   /api/clientes                  // Crear cliente

// Comprobantes
GET    /api/comprobantes/:id/pdf?tipo=boleta|factura
POST   /api/comprobantes/:id/email    // Enviar por email
```

### Tipos TypeScript Principales

```typescript
// types/index.ts

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  rol: 'Administrador' | 'Vendedor';
}

export interface Cliente {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
}

export interface DetalleProducto {
  producto_id?: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Venta {
  id: number;
  cliente: string;
  cliente_id?: number;
  productos: string;
  precio_total: number;
  metodo_pago: 'Efectivo' | 'Tarjeta De Credito/Debito' | 'Yape';
  fecha_venta: string;
  usuario_id?: number;
}

export interface VentaDetallada extends Venta {
  detalle_productos: DetalleProducto[];
  usuario?: Usuario;
}

export interface DashboardStats {
  ventasHoy: number;
  totalHoy: number;
  ventasSemana: number;
  totalSemana: number;
  promedioVenta: number;
}

export interface FiltroReporte {
  filtro: 'hoy' | 'semana' | 'mes' | 'ano' | 'personalizado';
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface EstadisticaMetodoPago {
  metodo_pago: string;
  cantidad: number;
  total: number;
}

export interface RankingUsuario {
  id: number;
  nombre: string;
  username: string;
  rol: string;
  cantidad: number;
  total: number;
}

export interface CalculoRUC {
  categoria: number | string;
  monto: number | string;
  total_ventas: number;
}
```

---

## 📝 Consideraciones Importantes

### 1. Migración de Base de Datos
- ✅ Mantener la misma estructura de BD MySQL
- ✅ Usar Prisma para type-safety (TypeScript)
- ✅ Mantener zona horaria America/Lima
- ✅ Índices en fecha_venta para optimización

### 2. Autenticación
- 🔄 Cambiar de sesiones PHP a JWT
- ✅ Tokens en localStorage o httpOnly cookies
- ✅ Refresh tokens para seguridad
- ✅ Middleware de autenticación en rutas protegidas

### 3. Generación de PDFs
- 🔄 Reemplazar mPDF con pdfkit o puppeteer
- ✅ Mantener diseño de boletas y facturas
- ✅ Incluir códigos QR

### 4. Envío de Emails
- 🔄 Reemplazar PHPMailer con nodemailer
- ✅ Mantener configuración SMTP
- ✅ Templates HTML para emails

### 5. Manejo de Fechas
- ✅ Usar date-fns o dayjs
- ✅ Mantener zona horaria America/Lima
- ✅ Formato consistente: DD/MM/YYYY HH:mm

### 6. Estilos
- ✅ Mantener paleta de colores actual
- ✅ Tema claro/oscuro
- ✅ Responsive design
- ✅ Animaciones suaves

### 7. Gráficos
- ✅ Usar ApexCharts React
- ✅ Mantener tipos de gráficos actuales
- ✅ Interactividad y tooltips

### 8. Validaciones
- ✅ Validación en frontend (React Hook Form + Zod)
- �� Validación en backend (express-validator o Zod)
- ✅ Mensajes de error claros

---

## 🎯 Prioridades de Desarrollo

### Fase 1: Setup y Autenticación
1. Configurar proyecto React + Backend
2. Configurar base de datos con Prisma
3. Implementar sistema de autenticación JWT
4. Crear layout base (Sidebar, Header)

### Fase 2: Funcionalidades Core
1. Dashboard con estadísticas
2. Registrar venta
3. Listar ventas
4. Generación de PDFs

### Fase 3: Reportes y Análisis
1. Filtros de reportes
2. Gráficos dinámicos
3. Ranking de vendedores
4. Calcular RUC

### Fase 4: Características Adicionales
1. Envío de emails
2. Autocompletado de productos
3. Calculadora integrada
4. Tema claro/oscuro

### Fase 5: Optimización
1. Performance optimization
2. Testing (Jest, React Testing Library)
3. Documentación
4. Deploy

---

## 🔧 Variables de Entorno

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Bazar Abem
```

### Backend (.env)
```env
# Database
DATABASE_URL="mysql://root:@localhost:3306/bazar_abem"

# JWT
JWT_SECRET=tu_secret_key_aqui
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=tu_refresh_secret_aqui
JWT_REFRESH_EXPIRES_IN=30d

# Server
PORT=3000
NODE_ENV=development

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USERNAME=tu_email@gmail.com
SMTP_PASSWORD=tu_password_aqui
SMTP_FROM_EMAIL=tu_email@gmail.com
SMTP_FROM_NAME=Bazar Abem

# Timezone
TZ=America/Lima
```

---

## 📚 Recursos y Documentación

### Librerías Principales
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Prisma](https://www.prisma.io/)
- [Express](https://expressjs.com/)
- [ApexCharts](https://apexcharts.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Patrones Recomendados
- **Hooks personalizados** para lógica reutilizable
- **Componentes atómicos** (Atomic Design)
- **API service layer** para separar lógica de fetching
- **Error boundaries** para manejo de errores
- **Lazy loading** para optimización
- **Memoization** (useMemo, useCallback) cuando sea necesario

---

## ✅ Checklist de Migración

### Backend
- [ ] Configurar Node.js + Express + TypeScript
- [ ] Configurar Prisma con MySQL
- [ ] Migrar esquema de base de datos
- [ ] Implementar autenticación JWT
- [ ] Crear endpoints REST
- [ ] Implementar generación de PDFs
- [ ] Implementar envío de emails
- [ ] Implementar códigos QR
- [ ] Middleware de autenticación
- [ ] Manejo de errores global
- [ ] Validación de datos
- [ ] CORS configurado

### Frontend
- [ ] Configurar React + TypeScript + Vite
- [ ] Configurar React Router
- [ ] Configurar TanStack Query
- [ ] Crear layout base (Sidebar, Header)
- [ ] Implementar login
- [ ] Implementar dashboard
- [ ] Implementar registro de ventas
- [ ] Implementar reportes
- [ ] Implementar cálculo RUC
- [ ] Implementar gráficos
- [ ] Implementar tema claro/oscuro
- [ ] Implementar calculadora
- [ ] Implementar autocompletado
- [ ] Responsive design
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Validación de formularios

### Testing
- [ ] Tests unitarios (Backend)
- [ ] Tests de integración (Backend)
- [ ] Tests de componentes (Frontend)
- [ ] Tests E2E (Cypress/Playwright)

### Deploy
- [ ] Configurar CI/CD
- [ ] Deploy backend (Railway, Render, etc.)
- [ ] Deploy frontend (Vercel, Netlify, etc.)
- [ ] Configurar dominio
- [ ] SSL/HTTPS
- [ ] Monitoreo y logs

---

## 🎓 Decisión Final: TypeScript vs JavaScript

### ✅ RECOMENDACIÓN: **TypeScript**

**Razones principales**:

1. **Type Safety**: Previene errores en tiempo de desarrollo
2. **Mejor DX**: Autocompletado inteligente en VSCode
3. **Documentación implícita**: Los tipos documentan el código
4. **Refactoring seguro**: Cambios con confianza
5. **Escalabilidad**: Proyecto más mantenible a largo plazo
6. **Integración con Prisma**: Type-safe database access
7. **Estándar de la industria**: Mayoría de proyectos React modernos usan TS

**Curva de aprendizaje**: Moderada, pero vale la pena la inversión inicial.

---

## 📞 Información de Contacto del Sistema

- **Nombre**: Bazar Abem
- **Zona Horaria**: America/Lima (UTC-5)
- **Moneda**: Soles Peruanos (S/)
- **Idioma**: Español

---

## 🚀 Comando para Iniciar

Cuando estés listo para crear el proyecto React, usa este prompt:

```
Lee el archivo prompt.md y crea un proyecto React completo para Bazar Abem siguiendo todas las especificaciones. 
Usa TypeScript, Vite, React Router, TanStack Query, Tailwind CSS y todas las librerías recomendadas.
Crea también el backend con Node.js, Express, TypeScript y Prisma.
Mantén todas las funcionalidades del sistema actual.
```

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0  
**Estado**: Listo para migración a React
