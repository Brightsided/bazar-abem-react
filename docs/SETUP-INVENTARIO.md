# Setup Rápido - Sistema de Inventario

## Pasos para Implementar el Sistema de Inventario

### Paso 1: Actualizar la Base de Datos

Ejecuta el script SQL actualizado:

```bash
# En Windows (CMD)
mysql -u root -p bazar_abem < database-init.sql

# O si tienes MySQL en PATH
cd d:\Baza Abem\bazar-abem-react
mysql -u root -p bazar_abem < database-init.sql
```

**Nota**: Reemplaza `root` con tu usuario de MySQL si es diferente.

### Paso 2: Actualizar Prisma

```bash
cd backend

# Generar cliente Prisma
npx prisma generate

# Opcional: Ver cambios en la BD
npx prisma db push
```

### Paso 3: Reiniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver en la consola:
```
🚀 Server running on port 3000
```

### Paso 4: Actualizar el Frontend

```bash
cd frontend
npm run dev
```

## Verificar la Instalación

### 1. Verificar Base de Datos

```bash
mysql -u root -p bazar_abem

# En MySQL:
SHOW TABLES;
# Deberías ver: almacenamiento, alertas_stock, movimientos_inventario

DESC almacenamiento;
DESC alertas_stock;
DESC movimientos_inventario;
```

### 2. Verificar API

Abre en el navegador:
```
http://localhost:3000/api/almacenamiento
```

Deberías recibir un JSON con los productos del almacenamiento.

### 3. Verificar Frontend

Abre en el navegador:
```
http://localhost:5173
```

Deberías ver una nueva opción "Almacenamiento" en el menú.

## Características Implementadas

✅ **Gestión de Almacenamiento**
- Ver inventario completo
- Editar stock (entrada/salida)
- Generar códigos de barras

✅ **Alertas de Stock Bajo**
- Alertas automáticas cuando stock ≤ stock_minimo
- Vista de alertas activas
- Resolución automática

✅ **Integración con Ventas**
- Validación de stock antes de venta
- Disminución automática de stock
- Registro de movimientos

✅ **Historial de Movimientos**
- Registro de todas las transacciones
- Filtros por producto, tipo, fecha
- Auditoría completa

## Datos Iniciales

Se crean automáticamente:
- 10 productos de ejemplo con precios
- Stock inicial de 10 unidades por producto
- Stock mínimo de 5 unidades

## Próximos Pasos

1. **Agregar Productos**: Ve a Almacenamiento y edita stock
2. **Registrar Ventas**: Ve a Registrar Venta y selecciona productos
3. **Monitorear Alertas**: Ve a Almacenamiento > Alertas
4. **Generar Códigos**: Haz clic en "Código" para cada producto

## Solución de Problemas

### Error: "Table 'almacenamiento' doesn't exist"
- Ejecuta nuevamente: `mysql -u root -p bazar_abem < database-init.sql`
- Verifica que la BD se creó correctamente

### Error: "producto_id is not unique"
- Borra la tabla almacenamiento y vuelve a ejecutar el script
- O ejecuta: `TRUNCATE TABLE almacenamiento;`

### Error: "Stock insuficiente" al vender
- Verifica que el producto tiene stock en Almacenamiento
- Edita el stock si es necesario

### Frontend no muestra productos
- Verifica que el backend está corriendo en puerto 3000
- Abre la consola del navegador (F12) para ver errores
- Verifica que hay productos en almacenamiento

## Contacto

Para problemas o sugerencias, revisar la documentación completa en:
`docs/IMPLEMENTACION-INVENTARIO.md`
