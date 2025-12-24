# 📦 Instalación Paso a Paso - Facturación SUNAT

## 🎯 Objetivo
Instalar y configurar el sistema de Facturación Electrónica SUNAT en Bazar Abem.

## ⏱️ Tiempo Estimado
- Instalación: 10 minutos
- Configuración: 5 minutos
- Prueba: 5 minutos
- **Total: 20 minutos**

---

## 📋 Requisitos Previos

- ✅ Node.js v16+ instalado
- ✅ MySQL corriendo
- ✅ Git (opcional)
- ✅ Proyecto Bazar Abem clonado

---

## 🚀 Paso 1: Instalar Dependencias Backend

### 1.1 Abrir Terminal en Backend
```bash
cd backend
```

### 1.2 Instalar Paquetes NPM
```bash
npm install
```

**Esto instalará:**
- ✅ xmlbuilder2 (generación de XML)
- ✅ soap (Web Services)
- ✅ node-forge (firma digital)
- ✅ date-fns (manejo de fechas)

**Tiempo**: ~3 minutos

---

## 🗄️ Paso 2: Actualizar Base de Datos

### 2.1 Opción A: Usar Prisma (Recomendado)
```bash
npx prisma migrate dev
```

**Esto:**
- ✅ Crea la tabla `comprobantes_electronicos`
- ✅ Agrega índices
- ✅ Actualiza schema

**Tiempo**: ~2 minutos

### 2.2 Opción B: Ejecutar SQL Directamente
```bash
mysql -u root -p bazar_abem < database-init.sql
```

**Ingresa tu contraseña de MySQL cuando se pida**

---

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 Copiar Archivo de Ejemplo
```bash
# En la carpeta backend
cp .env.example .env
cp .env.sunat.example .env.sunat
```

### 3.2 Editar `.env`
```bash
# Abrir con tu editor favorito
nano .env
# o
code .env
```

**Configurar:**
```env
DATABASE_URL="mysql://root:password@localhost:3306/bazar_abem"
PORT=3000
NODE_ENV=development
```

### 3.3 Editar `.env.sunat` (Opcional)
```bash
nano .env.sunat
```

**Valores por defecto (BETA):**
```env
SUNAT_USERNAME="MODDATOS"
SUNAT_PASSWORD="MODDATOS"
SUNAT_RUC_EMISOR="20000000001"
```

---

## 🔧 Paso 4: Verificar Instalación

### 4.1 Verificar Prisma
```bash
npx prisma generate
```

**Debe mostrar:**
```
✔ Generated Prisma Client
```

### 4.2 Verificar Base de Datos
```bash
npx prisma studio
```

**Debe abrir interfaz en http://localhost:5555**
- Buscar tabla `comprobantes_electronicos`
- Debe estar vacía

---

## 🚀 Paso 5: Iniciar Servidor Backend

### 5.1 Iniciar en Modo Desarrollo
```bash
npm run dev
```

**Debe mostrar:**
```
🚀 Server running on port 3000
📍 Environment: development
```

### 5.2 Verificar Endpoints
```bash
# En otra terminal
curl http://localhost:3000/health
```

**Debe retornar:**
```json
{"status":"ok","message":"Bazar Abem API is running"}
```

---

## 🎨 Paso 6: Verificar Frontend

### 6.1 Abrir Terminal en Frontend
```bash
cd frontend
```

### 6.2 Iniciar Frontend
```bash
npm run dev
```

**Debe mostrar:**
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

### 6.3 Acceder a la Aplicación
```
http://localhost:5173
```

---

## ✅ Paso 7: Verificar Integración

### 7.1 Hacer Login
1. Ir a http://localhost:5173
2. Usuario: `admin`
3. Password: `admin123`

### 7.2 Crear una Venta
1. Ir a "Registrar Venta"
2. Llenar datos:
   - Cliente: "Juan Pérez"
   - Productos: Seleccionar 2-3
   - Método: Efectivo
3. Hacer clic "Registrar Venta"

### 7.3 Verificar Botón SUNAT
1. Ir a "Reportes"
2. Buscar la venta creada
3. Debe haber botón SUNAT (icono rojo de factura)

---

## 🧪 Paso 8: Prueba Completa

### 8.1 Hacer Clic en Botón SUNAT
1. En tabla de ventas
2. Hacer clic en botón SUNAT
3. Debe abrir modal

### 8.2 Enviar a SUNAT
1. En modal, hacer clic "Enviar a SUNAT"
2. Esperar procesamiento (~2-3 segundos)
3. Debe mostrar estado "ACEPTADO"

### 8.3 Descargar Documentos
1. Hacer clic "Descargar XML"
2. Debe descargar archivo `comprobante-1.xml`
3. Hacer clic "Descargar CDR"
4. Debe descargar archivo `cdr-1.xml`

---

## 🔍 Paso 9: Verificar Base de Datos

### 9.1 Abrir Prisma Studio
```bash
npx prisma studio
```

### 9.2 Verificar Tabla
1. Ir a `comprobantes_electronicos`
2. Debe haber 1 registro
3. Verificar campos:
   - `venta_id`: 1
   - `estado`: ACEPTADO
   - `codigoSunat`: 0
   - `xmlSinFirma`: (XML generado)
   - `xmlFirmado`: (XML con firma)
   - `cdrXml`: (CDR de SUNAT)

---

## 📊 Paso 10: Verificar Logs

### 10.1 Revisar Consola Backend
```
Debe mostrar:
- Generando XML...
- Firmando XML...
- Enviando a SUNAT BETA...
- Comprobante guardado
```

### 10.2 Revisar Consola Frontend
```
Debe mostrar:
- Llamadas a API
- Respuestas exitosas
- Sin errores
```

---

## ✨ Paso 11: Pruebas Adicionales

### 11.1 Crear Otra Venta
1. Registrar nueva venta
2. Enviar a SUNAT
3. Verificar que funciona

### 11.2 Reenviar Comprobante
1. Ir a comprobante rechazado
2. Hacer clic "Reenviar"
3. Debe intentar nuevamente

### 11.3 Listar Comprobantes
```bash
curl http://localhost:3000/api/facturacion/listar \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎉 Paso 12: Verificación Final

### Checklist
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Base de datos actualizada
- [ ] Tabla `comprobantes_electronicos` existe
- [ ] Botón SUNAT visible en Reportes
- [ ] Modal SUNAT abre correctamente
- [ ] Comprobante se envía a SUNAT
- [ ] Estado muestra "ACEPTADO"
- [ ] XML se descarga
- [ ] CDR se descarga
- [ ] Registro en base de datos

---

## 🐛 Troubleshooting

### Error: "npm: command not found"
**Solución**: Instalar Node.js desde https://nodejs.org

### Error: "Cannot find module"
**Solución**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Database connection failed"
**Solución**: 
- Verificar MySQL corriendo
- Verificar DATABASE_URL en .env
- Verificar credenciales

### Error: "Port 3000 already in use"
**Solución**:
```bash
# Cambiar puerto en .env
PORT=3001
```

### Error: "Venta no encontrada"
**Solución**: 
- Crear venta primero
- Verificar ID de venta correcto

### Error: "CORS error"
**Solución**: 
- Verificar backend corriendo
- Verificar URL correcta
- Limpiar cache del navegador

---

## 📚 Documentación Relacionada

- **README_FACTURACION.md** - Guía completa
- **INICIO_RAPIDO_SUNAT.md** - Guía rápida
- **CAMBIOS_SUNAT.md** - Cambios realizados
- **RESUMEN_IMPLEMENTACION_SUNAT.md** - Resumen ejecutivo

---

## 🎯 Próximos Pasos

1. ✅ Instalación completada
2. ⏳ Probar en BETA (este paso)
3. ⏳ Obtener certificado digital real
4. ⏳ Cambiar a producción
5. ⏳ Realizar homologación SUNAT

---

## 💡 Tips Útiles

### Desarrollo
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Prisma Studio (opcional)
cd backend && npx prisma studio
```

### Debugging
```bash
# Ver logs detallados
NODE_DEBUG=* npm run dev

# Ver queries SQL
DATABASE_DEBUG=* npm run dev
```

### Limpiar
```bash
# Limpiar cache
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules && npm install

# Reset base de datos
npx prisma migrate reset
```

---

## 📞 Soporte

Si tienes problemas:

1. **Revisar documentación**
   - README_FACTURACION.md
   - INICIO_RAPIDO_SUNAT.md

2. **Revisar logs**
   - Consola del servidor
   - Consola del navegador
   - Base de datos

3. **Verificar configuración**
   - .env correcto
   - DATABASE_URL correcto
   - Puertos disponibles

4. **Reiniciar servicios**
   - Detener servidor (Ctrl+C)
   - Detener frontend (Ctrl+C)
   - Iniciar nuevamente

---

## ✅ Instalación Completada

Si llegaste hasta aquí sin errores:

🎉 **¡Felicidades! Tu sistema de Facturación SUNAT está instalado y funcionando.**

**Próximo paso**: Leer `README_FACTURACION.md` para entender todas las características.

---

**Última actualización**: Enero 2024
**Versión**: 1.0.0 (BETA)
**Estado**: ✅ Funcional
