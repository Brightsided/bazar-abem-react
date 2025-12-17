# Implementación del Sistema de Inventario

## Resumen de Cambios

Se ha implementado un sistema completo de gestión de inventario que permite:

1. **Gestión de Almacenamiento**: Controlar el stock de productos
2. **Alertas de Stock Bajo**: Notificaciones automáticas cuando el stock es bajo
3. **Códigos de Barras**: Generación de códigos únicos por producto
4. **Historial de Movimientos**: Registro de todas las transacciones de inventario
5. **Integración con Ventas**: Disminución automática de stock al registrar ventas

## Cambios en la Base de Datos

### Nuevas Tablas

#### 1. `almacenamiento`
Tabla principal para gestionar el inventario de productos.

```sql
CREATE TABLE almacenamiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL UNIQUE,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 5,
  codigo_barras VARCHAR(255) UNIQUE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
```

**Campos:**
- `id`: Identificador único
- `producto_id`: Referencia al producto
- `stock`: Cantidad actual en almacén
- `stock_minimo`: Cantidad mínima antes de alerta
- `codigo_barras`: Código único para escaneo
- `fecha_creacion`: Fecha de creación del registro
- `fecha_actualizacion`: Última actualización

#### 2. `alertas_stock`
Registro de alertas cuando el stock es bajo.

```sql
CREATE TABLE alertas_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  almacenamiento_id INT NOT NULL,
  producto_id INT NOT NULL,
  tipo_alerta VARCHAR(50) DEFAULT 'STOCK_BAJO',
  stock_actual INT NOT NULL,
  stock_minimo INT NOT NULL,
  estado VARCHAR(50) DEFAULT 'ACTIVA',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion DATETIME NULL,
  FOREIGN KEY (almacenamiento_id) REFERENCES almacenamiento(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
```

**Campos:**
- `estado`: 'ACTIVA' o 'RESUELTA'
- `tipo_alerta`: Tipo de alerta (actualmente 'STOCK_BAJO')
- `fecha_resolucion`: Cuándo se resolvió la alerta

#### 3. `movimientos_inventario`
Historial completo de movimientos de inventario.

```sql
CREATE TABLE movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  almacenamiento_id INT NOT NULL,
  producto_id INT NOT NULL,
  tipo_movimiento VARCHAR(50) NOT NULL,
  cantidad INT NOT NULL,
  stock_anterior INT NOT NULL,
  stock_nuevo INT NOT NULL,
  referencia_venta_id INT NULL,
  descripcion TEXT,
  usuario_id INT NULL,
  fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (almacenamiento_id) REFERENCES almacenamiento(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

**Campos:**
- `tipo_movimiento`: 'ENTRADA', 'SALIDA', 'AJUSTE'
- `referencia_venta_id`: ID de la venta si es una salida por venta
- `stock_anterior`: Stock antes del movimiento
- `stock_nuevo`: Stock después del movimiento

### Cambios en Tablas Existentes

#### `productos`
Se agregó el campo `precio`:

```sql
ALTER TABLE productos ADD COLUMN precio DECIMAL(10, 2) NOT NULL DEFAULT 0;
```

## Cambios en el Backend

### Nuevos Archivos

1. **`backend/src/controllers/almacenamientoController.ts`**
   - Controlador para gestionar almacenamiento
   - Funciones: obtener inventario, actualizar stock, generar códigos de barras, etc.

2. **`backend/src/routes/almacenamiento.ts`**
   - Rutas API para almacenamiento
   - Endpoints disponibles:
     - `GET /api/almacenamiento` - Obtener todo el inventario
     - `GET /api/almacenamiento/disponibles` - Productos con stock > 0
     - `GET /api/almacenamiento/stock-bajo` - Productos con stock bajo
     - `GET /api/almacenamiento/:id` - Obtener un producto
     - `POST /api/almacenamiento/actualizar-stock` - Actualizar stock
     - `POST /api/almacenamiento/generar-codigo-barras` - Generar código
     - `GET /api/almacenamiento/movimientos/historial` - Historial de movimientos
     - `GET /api/almacenamiento/alertas/lista` - Obtener alertas

### Cambios en Archivos Existentes

1. **`backend/src/server.ts`**
   - Se agregó la importación y registro de rutas de almacenamiento

2. **`backend/src/controllers/ventasController.ts`**
   - Se modificó `createVenta` para:
     - Validar stock disponible antes de crear venta
     - Disminuir automáticamente el stock
     - Registrar movimientos de inventario
     - Crear alertas si el stock queda bajo

3. **`backend/prisma/schema.prisma`**
   - Se agregaron modelos: `Almacenamiento`, `AlertaStock`, `MovimientoInventario`
   - Se actualizó modelo `Producto` con campo `precio`
   - Se agregaron relaciones entre modelos

## Cambios en el Frontend

### Nuevos Archivos

1. **`frontend/src/services/almacenamientoService.ts`**
   - Servicio para consumir API de almacenamiento
   - Funciones para obtener inventario, actualizar stock, etc.

2. **`frontend/src/pages/Almacenamiento.tsx`**
   - Página principal de gestión de almacenamiento
   - Características:
     - Vista de inventario completo
     - Alertas de stock bajo
     - Edición de stock (entrada/salida)
     - Generación de códigos de barras
     - Estadísticas en tiempo real

### Cambios en Archivos Existentes

1. **`frontend/src/components/forms/ProductSearch.tsx`**
   - Se actualizó para usar productos del almacenamiento
   - Ahora muestra stock disponible y precio
   - Solo muestra productos con stock > 0

2. **`frontend/src/pages/RegisterSale.tsx`**
   - Se actualizó para incluir `producto_id` en los datos de venta
   - Integración con el nuevo ProductSearch

## Flujo de Funcionamiento

### Registrar una Venta

1. Usuario selecciona productos del almacenamiento
2. Sistema valida que hay stock disponible
3. Se crea la venta
4. Se disminuye automáticamente el stock
5. Se registra el movimiento en el historial
6. Si el stock queda bajo, se crea una alerta

### Gestionar Alertas

1. Sistema detecta cuando stock ≤ stock_minimo
2. Crea alerta automáticamente
3. Usuario ve alertas en la página de Almacenamiento
4. Cuando se agrega stock, la alerta se marca como resuelta

### Generar Códigos de Barras

1. Usuario hace clic en "Generar Código" para un producto
2. Sistema genera código único: `PROD-{producto_id}-{timestamp}`
3. Código se guarda en la base de datos
4. Puede ser usado para escaneo rápido en ventas

## Instrucciones de Implementación

### 1. Actualizar Base de Datos

```bash
# Ejecutar el script SQL actualizado
mysql -u root -p bazar_abem < database-init.sql
```

### 2. Actualizar Prisma

```bash
cd backend

# Generar cliente Prisma
npx prisma generate

# Crear migración (opcional, si usas migraciones)
npx prisma migrate dev --name add_inventory_system
```

### 3. Reiniciar Backend

```bash
cd backend
npm run dev
```

### 4. Actualizar Frontend

```bash
cd frontend
npm install
npm run dev
```

## Uso del Sistema

### Acceder a Almacenamiento

1. Ir a la nueva sección "Almacenamiento" en el menú
2. Ver inventario completo con stock actual
3. Ver alertas de stock bajo

### Registrar Venta con Inventario

1. Ir a "Registrar Venta"
2. Buscar producto (solo muestra disponibles)
3. Seleccionar cantidad
4. El precio se carga automáticamente
5. Al registrar, el stock se disminuye automáticamente

### Gestionar Stock

1. En Almacenamiento, hacer clic en "Editar"
2. Ingresar cantidad
3. Seleccionar tipo: Entrada (+) o Salida (-)
4. Confirmar cambio

### Generar Códigos de Barras

1. En Almacenamiento, hacer clic en "Código"
2. Se genera código único
3. Puede imprimirse para etiquetas

## Alertas del Sistema

### Stock Bajo
- Se activa cuando: `stock <= stock_minimo`
- Acción: Comprar más productos
- Resolución: Automática al agregar stock

### Stock Insuficiente
- Se muestra al intentar vender más de lo disponible
- Previene ventas sin stock

## Reportes Disponibles

Con el historial de movimientos, se pueden generar reportes de:
- Productos más vendidos
- Movimientos por período
- Auditoría de cambios de stock
- Análisis de alertas

## Próximas Mejoras Sugeridas

1. **Importación de Inventario**: Cargar stock desde CSV
2. **Ajustes de Inventario**: Correcciones por pérdida/daño
3. **Transferencias**: Mover stock entre ubicaciones
4. **Proveedores**: Registrar compras de reabastecimiento
5. **Reportes Avanzados**: Análisis de rotación de inventario
6. **Integración de Códigos de Barras**: Lectura con scanner
7. **Notificaciones**: Email/SMS cuando stock es bajo
8. **Predicción de Demanda**: Sugerencias de reorden

## Soporte

Para problemas o preguntas sobre el sistema de inventario, revisar:
- Logs del backend en `backend/logs/`
- Consola del navegador para errores frontend
- Base de datos para verificar datos
