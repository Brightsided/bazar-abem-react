# 🌱 Ejecutar Seed de Base de Datos

## Problema Actual

El error indica que Prisma no reconoce el campo `precio` en el modelo `Producto`. Esto ocurre porque el cliente Prisma necesita ser regenerado.

## Solución

### Opción 1: Ejecutar Script (Recomendado)

En Windows, ejecuta el script batch:

```bash
cd backend
setup-seed.bat
```

### Opción 2: Comandos Manuales

Abre PowerShell en la carpeta `backend` y ejecuta:

```powershell
# Paso 1: Regenerar cliente Prisma
npx prisma generate

# Paso 2: Ejecutar seed
npx prisma db seed
```

### Opción 3: Limpiar y Resetear (Si hay problemas)

Si el seed sigue fallando, intenta resetear la base de datos:

```powershell
# Esto eliminará todos los datos y recreará la BD
npx prisma migrate reset

# Luego ejecuta el seed
npx prisma db seed
```

## Pasos Detallados

1. **Abre PowerShell o CMD**
   - Navega a: `d:\Baza Abem\bazar-abem-react\backend`

2. **Regenera el cliente Prisma**
   ```powershell
   npx prisma generate
   ```
   Espera a que termine (verás un mensaje de éxito)

3. **Ejecuta el seed**
   ```powershell
   npx prisma db seed
   ```

4. **Verifica el resultado**
   - Deberías ver mensajes como:
     ```
     ✅ Usuarios creados
     ✅ Clientes creados
     ✅ Productos creados
     ✅ Almacenamiento creado
     ✅ Ventas de ejemplo creadas
     🎉 Seed completado exitosamente!
     ```

## Qué Hace el Seed

El seed crea automáticamente:

- ✅ **2 Usuarios**
  - Admin: `admin` / `admin123`
  - Vendedor: `vendedor` / `vendedor123`

- ✅ **5 Clientes**
  - Cliente Casual
  - María García
  - Carlos López
  - Ana Martínez
  - Pedro Rodríguez

- ✅ **15 Productos** con precios
  - Arroz Costeño 1kg - S/. 3.50
  - Aceite Primor 1L - S/. 5.20
  - Y 13 más...

- ✅ **15 Registros de Almacenamiento**
  - Stock inicial: 10 unidades
  - Stock mínimo: 5 unidades
  - Código de barras único

- ✅ **2 Ventas de Ejemplo**
  - Venta 1: Arroz + Aceite
  - Venta 2: Leche

- ✅ **4 Movimientos de Inventario**
  - Registros de salida por ventas
  - Registro de entrada de ejemplo

## Solución de Problemas

### Error: "Unknown argument `precio`"

**Causa**: El cliente Prisma no está actualizado

**Solución**:
```powershell
npx prisma generate
```

### Error: "Table 'almacenamiento' doesn't exist"

**Causa**: Las tablas no se han creado en la BD

**Solución**:
```powershell
# Ejecutar la migración
npx prisma migrate deploy

# O resetear todo
npx prisma migrate reset
```

### Error: "Connection refused"

**Causa**: MySQL no está corriendo

**Solución**:
1. Inicia MySQL
2. Verifica que la BD `bazar_abem` existe
3. Verifica que el `.env` tiene las credenciales correctas

### Error: "Unique constraint failed"

**Causa**: Los datos ya existen en la BD

**Solución**:
```powershell
# Opción 1: Limpiar y resetear
npx prisma migrate reset

# Opción 2: Eliminar datos manualmente
# En MySQL:
# DELETE FROM movimientos_inventario;
# DELETE FROM alertas_stock;
# DELETE FROM almacenamiento;
# DELETE FROM detalle_venta;
# DELETE FROM venta;
# DELETE FROM producto;
# DELETE FROM cliente;
# DELETE FROM usuario;
```

## Verificar que Funcionó

Después de ejecutar el seed, verifica en MySQL:

```sql
-- Conectar a la BD
USE bazar_abem;

-- Ver usuarios
SELECT * FROM usuarios;

-- Ver productos
SELECT * FROM productos;

-- Ver almacenamiento
SELECT * FROM almacenamiento;

-- Ver ventas
SELECT * FROM ventas;

-- Ver movimientos
SELECT * FROM movimientos_inventario;
```

## Próximos Pasos

1. ✅ Ejecutar seed
2. ✅ Iniciar backend: `npm run dev`
3. ✅ Iniciar frontend: `npm run dev`
4. ✅ Acceder a http://localhost:5173
5. ✅ Iniciar sesión con admin/admin123

---

**¡Seed Ejecutado Exitosamente! 🎉**
