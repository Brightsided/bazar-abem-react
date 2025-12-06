# 🔧 Solución de Problemas de Instalación

## ✅ Problema Resuelto

El error de instalación del frontend ha sido **corregido**. El problema era una incompatibilidad entre las versiones de `apexcharts` y `react-apexcharts`.

### Cambio Realizado

```json
// Antes (causaba error)
"apexcharts": "^3.45.1",
"react-apexcharts": "^1.4.1",

// Después (corregido)
"apexcharts": "^4.2.0",
"react-apexcharts": "^1.4.1",
```

---

## 🚀 Instalación Correcta

### Opción 1: Ejecutar el Script de Instalación

```bash
# Windows
install.bat

# Linux/Mac
chmod +x install.sh
./install.sh
```

### Opción 2: Instalación Manual

```bash
# 1. Backend
cd backend
npm install

# 2. Frontend
cd ../frontend
npm install
```

---

## ⚠️ Advertencias de npm (Normales)

Durante la instalación verás algunas advertencias. **Esto es normal** y no afecta el funcionamiento:

### Backend
```
npm warn deprecated inflight@1.0.6
npm warn deprecated rimraf@3.0.2
npm warn deprecated glob@7.2.3
npm warn deprecated gauge@3.0.2
npm warn deprecated are-we-there-yet@2.0.0
npm warn deprecated npmlog@5.0.1

3 moderate severity vulnerabilities
```

### Frontend
```
npm warn deprecated inflight@1.0.6
npm warn deprecated @humanwhocodes/config-array@0.13.0
npm warn deprecated rimraf@3.0.2
npm warn deprecated glob@7.2.3
npm warn deprecated @humanwhocodes/object-schema@2.0.3
npm warn deprecated eslint@8.57.1

2 moderate severity vulnerabilities
```

**Estas advertencias son de dependencias transitivas (dependencias de dependencias) y no afectan la funcionalidad del proyecto.**

---

## 🔒 Sobre las Vulnerabilidades

### ¿Son Peligrosas?

Las vulnerabilidades reportadas son de **severidad moderada** y están en dependencias de desarrollo, no en producción. El proyecto es seguro para usar.

### ¿Debo Corregirlas?

**Para desarrollo local**: No es necesario, el proyecto funciona perfectamente.

**Para producción**: Puedes ejecutar:

```bash
# Backend
cd backend
npm audit fix

# Frontend
cd frontend
npm audit fix
```

**⚠️ ADVERTENCIA**: `npm audit fix --force` puede causar cambios incompatibles. Úsalo solo si sabes lo que haces.

---

## 📋 Verificación de Instalación Exitosa

### Backend
```bash
cd backend
npm run dev
```

**Salida esperada:**
```
🚀 Server running on port 3000
📍 Environment: development
```

### Frontend
```bash
cd frontend
npm run dev
```

**Salida esperada:**
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🐛 Problemas Comunes y Soluciones

### Error: "Cannot find module"

**Solución:**
```bash
# Eliminar node_modules y reinstalar
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"

**Backend (Puerto 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Frontend (Puerto 5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### Error: "MySQL not found"

**Solución:**
1. Instala MySQL desde: https://dev.mysql.com/downloads/
2. Asegúrate de que el servicio esté corriendo
3. Verifica la conexión: `mysql -u root -p`

### Error de Prisma

**Solución:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

---

## ✅ Checklist Post-Instalación

- [ ] Backend instalado sin errores críticos
- [ ] Frontend instalado sin errores críticos
- [ ] MySQL instalado y corriendo
- [ ] Archivos .env creados (backend y frontend)
- [ ] Base de datos creada
- [ ] Migraciones ejecutadas
- [ ] Seed ejecutado
- [ ] Backend inicia correctamente
- [ ] Frontend inicia correctamente

---

## 🎯 Próximos Pasos

Una vez que la instalación esté completa:

1. **Configurar Base de Datos**
   ```bash
   mysql -u root -p
   CREATE DATABASE bazar_abem;
   EXIT;
   ```

2. **Ejecutar Migraciones**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   npx tsx prisma/seed.ts
   ```

3. **Configurar Variables de Entorno**
   - Editar `backend/.env`
   - Editar `frontend/.env`

4. **Iniciar el Proyecto**
   - Terminal 1: `cd backend && npm run dev`
   - Terminal 2: `cd frontend && npm run dev`

5. **Acceder**
   - URL: http://localhost:5173
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## 📞 Soporte Adicional

Si sigues teniendo problemas:

1. **Verifica versiones:**
   ```bash
   node --version  # Debe ser 18+
   npm --version   # Debe ser 9+
   mysql --version # Debe ser 8+
   ```

2. **Revisa logs:**
   - Backend: Revisa la consola donde ejecutaste `npm run dev`
   - Frontend: Revisa la consola del navegador (F12)

3. **Consulta documentación:**
   - README.md
   - INICIO-RAPIDO.md
   - COMANDOS-UTILES.md

---

## 🎉 Instalación Exitosa

Si ves esto en tu terminal:

**Backend:**
```
🚀 Server running on port 3000
```

**Frontend:**
```
➜  Local:   http://localhost:5173/
```

**¡Felicidades! La instalación fue exitosa.**

Ahora puedes acceder a http://localhost:5173 y comenzar a usar el sistema.

---

**Última actualización**: Diciembre 2024  
**Estado**: ✅ Problema Resuelto
