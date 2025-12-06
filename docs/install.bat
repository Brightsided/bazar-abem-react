@echo off
echo ========================================
echo   BAZAR ABEM - Instalacion Automatica
echo ========================================
echo.

REM Verificar Node.js
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)
echo OK - Node.js instalado
echo.

REM Verificar MySQL
echo [2/6] Verificando MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ADVERTENCIA: MySQL no encontrado en PATH
    echo Asegurate de tener MySQL instalado y corriendo
    echo.
)
echo.

REM Instalar dependencias del backend
echo [3/6] Instalando dependencias del backend...
cd backend
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo ERROR: Fallo la instalacion del backend
        pause
        exit /b 1
    )
) else (
    echo Backend ya tiene dependencias instaladas
)
cd ..
echo.

REM Instalar dependencias del frontend
echo [4/6] Instalando dependencias del frontend...
cd frontend
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo ERROR: Fallo la instalacion del frontend
        pause
        exit /b 1
    )
) else (
    echo Frontend ya tiene dependencias instaladas
)
cd ..
echo.

REM Verificar archivos .env
echo [5/6] Verificando archivos de configuracion...
if not exist "backend\.env" (
    echo ADVERTENCIA: backend\.env no existe
    echo Copiando desde backend\.env.example...
    copy "backend\.env.example" "backend\.env" >nul
    echo IMPORTANTE: Edita backend\.env con tus configuraciones
)

if not exist "frontend\.env" (
    echo ADVERTENCIA: frontend\.env no existe
    echo Copiando desde frontend\.env.example...
    copy "frontend\.env.example" "frontend\.env" >nul
    echo IMPORTANTE: Edita frontend\.env con tus configuraciones
)
echo.

REM Instrucciones finales
echo [6/6] Instalacion completada!
echo.
echo ========================================
echo   PROXIMOS PASOS
echo ========================================
echo.
echo 1. Configura la base de datos:
echo    mysql -u root -p
echo    CREATE DATABASE bazar_abem;
echo    EXIT;
echo.
echo 2. Configura backend\.env con tus datos
echo.
echo 3. Ejecuta las migraciones:
echo    cd backend
echo    npx prisma generate
echo    npx prisma migrate dev
echo    npx tsx prisma/seed.ts
echo.
echo 4. Inicia el proyecto:
echo    Terminal 1: cd backend ^&^& npm run dev
echo    Terminal 2: cd frontend ^&^& npm run dev
echo.
echo 5. Abre http://localhost:5173
echo    Usuario: admin
echo    Password: admin123
echo.
echo ========================================
echo Para mas informacion, lee README.md
echo ========================================
echo.
pause
