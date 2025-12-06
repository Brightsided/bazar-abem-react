# 📋 Guía de Estructura del Proyecto Bazar Abem

Esta guía explica la organización del proyecto, cómo funcionan las carpetas del frontend y backend, y cómo se conectan entre sí.

---

## 🏗️ Estructura General del Proyecto

```
bazar-abem-react/
├── backend/          # API REST (Node.js + Express)
├── frontend/         # Aplicación web (React + Vite)
├── database-init.sql # Script de inicialización de BD
└── [archivos de configuración]
```

---

## 🔧 BACKEND - API REST

El backend es una API REST construida con **Node.js**, **Express** y **TypeScript**. Se encarga de procesar la lógica de negocio, gestionar la base de datos y proporcionar endpoints para que el frontend consuma.

### 📁 Estructura de Carpetas del Backend

```
backend/
├── src/
│   ├── config/           # Configuración de la aplicación
│   ├── controllers/       # Lógica de negocio por módulo
│   ├── middleware/        # Funciones intermedias (autenticación, errores)
│   ├── routes/            # Definición de rutas/endpoints
│   ├── services/          # Servicios auxiliares (email, PDF, QR)
│   └── server.ts          # Archivo principal del servidor
├── prisma/
│   ├── schema.prisma      # Definición del modelo de datos
│   └── seed.ts            # Script para poblar datos iniciales
├── scripts/               # Scripts útiles (hash de contraseñas)
├── .env.example           # Variables de entorno (ejemplo)
├── package.json           # Dependencias del proyecto
└── tsconfig.json          # Configuración de TypeScript
```

### 📂 Detalle de Carpetas Backend

#### **`src/config/`** - Configuración
- **Propósito**: Centraliza la configuración de la aplicación
- **Archivos**: `database.ts` (conexión a MySQL)
- **Uso**: Importado por otros módulos para acceder a la configuración

#### **`src/controllers/`** - Controladores
- **Propósito**: Contiene la lógica de negocio de cada módulo
- **Archivos**:
  - `authController.ts` - Autenticación y login
  - `ventasController.ts` - Gestión de ventas
  - `productosController.ts` - Gestión de productos
  - `clientesController.ts` - Gestión de clientes
  - `reportesController.ts` - Generación de reportes
  - `comprobantesController.ts` - Gestión de comprobantes
  - `rucController.ts` - Validación de RUC
- **Flujo**: Reciben datos de las rutas → Procesan lógica → Retornan respuesta

#### **`src/middleware/`** - Middleware
- **Propósito**: Funciones que se ejecutan antes de llegar a los controladores
- **Archivos**:
  - `auth.ts` - Verifica que el usuario esté autenticado (JWT)
  - `errorHandler.ts` - Maneja errores globales
- **Uso**: Se aplican a rutas específicas para validar permisos y manejar excepciones

#### **`src/routes/`** - Rutas/Endpoints
- **Propósito**: Define los endpoints de la API
- **Archivos**: `auth.ts`, `ventas.ts`, `productos.ts`, `clientes.ts`, `reportes.ts`, `comprobantes.ts`, `ruc.ts`
- **Ejemplo de ruta**:
  ```
  POST /api/ventas          → Crear venta
  GET /api/ventas/:id       → Obtener venta por ID
  GET /api/productos        → Listar productos
  ```

#### **`src/services/`** - Servicios Auxiliares
- **Propósito**: Funcionalidades reutilizables
- **Archivos**:
  - `emailService.ts` - Envío de correos
  - `pdfService.ts` - Generación de PDFs
  - `qrService.ts` - Generación de códigos QR
- **Uso**: Importados por controladores cuando necesitan estas funcionalidades

#### **`prisma/`** - ORM y Base de Datos
- **`schema.prisma`**: Define el modelo de datos (tablas, relaciones)
- **`seed.ts`**: Script para insertar datos iniciales
- **Propósito**: Gestiona la comunicación con MySQL

#### **`server.ts`** - Punto de Entrada
- **Propósito**: Inicia el servidor Express
- **Configuración**: Puerto (3000), CORS, rutas, middleware
- **Comando**: `npm run dev` para desarrollo

---

## 🎨 FRONTEND - Aplicación React

El frontend es una aplicación web construida con **React**, **Vite** y **TypeScript**. Se comunica con el backend mediante peticiones HTTP (Axios) y muestra la interfaz de usuario.

### 📁 Estructura de Carpetas del Frontend

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── common/        # Componentes genéricos
│   │   ├── forms/         # Componentes de formularios
│   │   └── layout/        # Componentes de estructura
│   ├── pages/             # Páginas principales
│   ├── services/          # Servicios para comunicarse con API
│   ├── store/             # Estado global (Zustand)
│   ├── types/             # Tipos TypeScript
│   ├── utils/             # Funciones auxiliares
│   ├── App.tsx            # Componente raíz
│   ├── main.tsx           # Punto de entrada
│   └── index.css           # Estilos globales
├── index.html             # HTML principal
├── package.json           # Dependencias
├── vite.config.ts         # Configuración de Vite
├── tailwind.config.js     # Configuración de Tailwind CSS
└── tsconfig.json          # Configuración de TypeScript
```

### 📂 Detalle de Carpetas Frontend

#### **`src/components/`** - Componentes Reutilizables
- **Propósito**: Componentes React que se usan en múltiples páginas
- **Subcarpetas**:
  - **`common/`**: Componentes genéricos
    - `Calculator.tsx` - Calculadora
    - `StatsCard.tsx` - Tarjeta de estadísticas
  - **`forms/`**: Componentes de formularios
    - `ProductSearch.tsx` - Búsqueda de productos
  - **`layout/`**: Estructura de la aplicación
    - `Header.tsx` - Encabezado
    - `Sidebar.tsx` - Barra lateral
    - `Layout.tsx` - Contenedor principal

#### **`src/pages/`** - Páginas Principales
- **Propósito**: Vistas completas de la aplicación
- **Archivos**:
  - `Login.tsx` - Página de autenticación
  - `Dashboard.tsx` - Panel principal
  - `RegisterSale.tsx` - Registro de ventas
  - `Reports.tsx` - Reportes
  - `RUC.tsx` - Validación de RUC
- **Uso**: Cada página es una ruta en la aplicación

#### **`src/services/`** - Servicios de API
- **Propósito**: Funciones para comunicarse con el backend
- **Archivos**:
  - `api.ts` - Configuración de Axios (base URL, interceptores)
  - `authService.ts` - Llamadas de autenticación
  - `ventasService.ts` - Llamadas de ventas
  - `productosService.ts` - Llamadas de productos
  - `clientesService.ts` - Llamadas de clientes
  - `reportesService.ts` - Llamadas de reportes
  - `rucService.ts` - Llamadas de validación RUC
- **Ejemplo**:
  ```typescript
  // En ventasService.ts
  export const crearVenta = (datos) => {
    return api.post('/ventas', datos);
  };
  ```

#### **`src/store/`** - Estado Global (Zustand)
- **Propósito**: Gestiona el estado global de la aplicación
- **Archivos**:
  - `authStore.ts` - Estado de autenticación (usuario, token)
  - `themeStore.ts` - Estado del tema (claro/oscuro)
- **Uso**: Accesible desde cualquier componente sin prop drilling

#### **`src/types/`** - Tipos TypeScript
- **Propósito**: Define interfaces y tipos reutilizables
- **Archivo**: `index.ts` - Tipos como Usuario, Venta, Producto, etc.
- **Uso**: Importados en servicios y componentes para type safety

#### **`src/utils/`** - Funciones Auxiliares
- **Propósito**: Funciones reutilizables
- **Archivos**:
  - `alerts.ts` - Funciones para mostrar alertas (SweetAlert2)
  - `formatters.ts` - Formateo de datos (fechas, moneda, etc.)

#### **`App.tsx`** - Componente Raíz
- **Propósito**: Define las rutas principales de la aplicación
- **Contenido**: React Router con todas las páginas

#### **`main.tsx`** - Punto de Entrada
- **Propósito**: Monta la aplicación React en el DOM
- **Comando**: `npm run dev` para desarrollo

---

## 🔗 Conexión Frontend ↔ Backend

### Flujo de Comunicación

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Componente (pages/RegisterSale.tsx)                  │  │
│  │ - Usuario llena formulario                           │  │
│  │ - Click en "Guardar"                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Service (services/ventasService.ts)                  │  │
│  │ - Prepara datos                                      │  │
│  │ - Llama a api.post('/ventas', datos)                │  │
│  └───��──────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Axios (services/api.ts)                              │  │
│  │ - Agrega token JWT en headers                        │  │
│  │ - Envía POST a http://localhost:3000/api/ventas     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
│  ┌────────────────────────────��─────────────────────────┐  │
│  │ Route (routes/ventas.ts)                             │  │
│  │ - POST /api/ventas                                   │  │
│  │ - Aplica middleware de autenticación                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Controller (controllers/ventasController.ts)         │  │
│  │ - Valida datos                                       │  │
│  │ - Procesa lógica de negocio                          │  │
│  │ - Llama a Prisma para guardar en BD                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌───────────────────────────────────���──────────────────┐  │
│  │ Database (MySQL)                                     │  │
│  │ - Inserta registro en tabla "ventas"                 │  │
│  │ - Retorna ID de la venta creada                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Response                                             │  │
│  │ { success: true, id: 123, message: "Venta creada" } │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ JSON
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Service recibe respuesta                             │  │
│  │ - Retorna datos al componente                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Componente actualiza estado                          │  │
│  │ - Muestra mensaje de éxito                           │  │
│  │ - Recarga lista de ventas                            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────���─────────────────────────────────────┘
```

### Ejemplo Práctico: Crear una Venta

**1. Frontend - Componente (RegisterSale.tsx)**
```typescript
const handleSave = async (formData) => {
  try {
    const response = await ventasService.crearVenta(formData);
    showAlert('Venta creada exitosamente');
  } catch (error) {
    showAlert('Error al crear venta');
  }
};
```

**2. Frontend - Service (ventasService.ts)**
```typescript
export const crearVenta = (datos) => {
  return api.post('/ventas', datos);
};
```

**3. Frontend - API (api.ts)**
```typescript
// Axios interceptor agrega token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**4. Backend - Ruta (routes/ventas.ts)**
```typescript
router.post('/', authMiddleware, ventasController.crearVenta);
```

**5. Backend - Controlador (controllers/ventasController.ts)**
```typescript
export const crearVenta = async (req, res) => {
  // Valida datos
  // Procesa lógica
  // Guarda en BD con Prisma
  // Retorna respuesta
};
```

**6. Backend - Base de Datos (Prisma)**
```typescript
const venta = await prisma.venta.create({
  data: { cliente, productos, precio_total, metodo_pago }
});
```

---

## 🗄️ Base de Datos

### Ubicación
- **Archivo**: `database-init.sql` (en la raíz del proyecto)
- **Tipo**: MySQL
- **Gestión**: Prisma ORM

### Tablas Principales
- **usuarios** - Usuarios del sistema (admin, vendedores)
- **clientes** - Clientes del bazar
- **productos** - Catálogo de productos
- **ventas** - Registro de ventas
- **detalle_venta** - Detalles de cada venta (productos vendidos)

### Conexión
- **Backend**: Se conecta a MySQL mediante Prisma (definido en `prisma/schema.prisma`)
- **Variables de entorno**: `DATABASE_URL` en `.env`

---

## 🖼️ Logo de la Empresa

### Recomendación: Crear Carpeta `assets`

Se recomienda crear una carpeta dedicada para los assets (imágenes, logos, iconos) del frontend:

```
frontend/src/
├── assets/                # ← NUEVA CARPETA
│   ├── images/
│   │   ├── logo.png       # Logo de la empresa
│   │   ├── favicon.ico    # Favicon
│   │   └── [otras imágenes]
│   ├── icons/
│   │   └── [iconos SVG]
│   └── fonts/
│       └── [fuentes personalizadas]
├── components/
├── pages/
├── services/
└── ...
```

### Estructura Recomendada

```
frontend/src/assets/
├── images/
│   ├── logo.png           # Logo principal (PNG)
��   ├── logo.svg           # Logo en vector (SVG - recomendado)
│   ├── logo-white.png     # Logo versión blanca
│   ├── favicon.ico        # Favicon para pestaña del navegador
│   └── banner.png         # Banner o imágenes de fondo
├── icons/
│   ├── dashboard.svg
│   ├── sales.svg
│   └── [otros iconos]
└── fonts/
    └── [fuentes personalizadas si las hay]
```

### Uso del Logo en Componentes

**En Header.tsx:**
```typescript
import logo from '../assets/images/logo.svg';

export const Header = () => {
  return (
    <header>
      <img src={logo} alt="Bazar Abem" className="h-10" />
      <h1>Bazar Abem</h1>
    </header>
  );
};
```

**En index.html:**
```html
<link rel="icon" type="image/svg+xml" href="/src/assets/images/favicon.ico" />
```

### Ventajas de esta Estructura
✅ Centraliza todos los assets en un solo lugar  
✅ Fácil de mantener y actualizar  
✅ Escalable para agregar más imágenes  
✅ Separación clara entre código y recursos  
✅ Mejor organización del proyecto  

---

## 🚀 Flujo de Desarrollo

### Iniciar el Proyecto

**1. Backend**
```bash
cd backend
npm install
npm run dev
# Servidor en http://localhost:3000
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
# Aplicación en http://localhost:5173
```

### Variables de Entorno

**Backend (.env)**
```
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/bazar_abem
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_secreto_jwt
```

**Frontend (.env.local)**
```
VITE_API_URL=http://localhost:3000/api
```

---

## 📊 Resumen de Responsabilidades

| Componente | Responsabilidad |
|-----------|-----------------|
| **Backend** | Procesar lógica, validar datos, gestionar BD, autenticación |
| **Frontend** | Interfaz de usuario, validación de formularios, estado local |
| **Prisma** | Comunicación con MySQL, migraciones |
| **Axios** | Peticiones HTTP, interceptores, manejo de tokens |
| **Zustand** | Estado global (usuario, tema) |
| **React Router** | Navegación entre páginas |

---

## 🔐 Autenticación

### Flujo de Login

1. **Frontend**: Usuario ingresa credenciales
2. **Backend**: Valida credenciales, genera JWT
3. **Frontend**: Guarda token en localStorage
4. **Axios**: Agrega token en headers de todas las peticiones
5. **Backend**: Middleware verifica token en cada petición
6. **Logout**: Frontend elimina token, redirige a login

---

## 📝 Notas Importantes para Practicantes

1. **Siempre usar services**: No hagas peticiones HTTP directamente en componentes
2. **Tipos TypeScript**: Define tipos para todo (datos, respuestas, etc.)
3. **Manejo de errores**: Usa try-catch en services y muestra alertas al usuario
4. **Variables de entorno**: Nunca hardcodees URLs o credenciales
5. **Componentes reutilizables**: Si usas un componente 2+ veces, muévelo a `components/`
6. **Estado global**: Usa Zustand solo para estado que necesitan múltiples páginas
7. **Middleware**: El backend valida SIEMPRE en el servidor, no confíes en el frontend

---

## 🎯 Próximos Pasos

1. Crear carpeta `frontend/src/assets/` para el logo
2. Agregar logo a `Header.tsx`
3. Configurar favicon en `index.html`
4. Documentar endpoints de API en un archivo `API.md`
5. Crear guía de contribución en `CONTRIBUTING.md`

---

**Última actualización**: 2024  
**Autor**: Equipo de Desarrollo Bazar Abem
