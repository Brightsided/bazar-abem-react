@echo off
echo Configurando base de datos...
echo.

echo 1. Sincronizando esquema con la base de datos...
call npx prisma db push

echo.
echo 2. Ejecutando seed para crear usuarios y datos iniciales...
call npm run prisma:seed

echo.
echo ¡Configuración completada!
echo.
echo Credenciales de acceso:
echo   Admin: username=admin, password=admin123
echo   Vendedor: username=vendedor, password=vendedor123
echo.
pause
