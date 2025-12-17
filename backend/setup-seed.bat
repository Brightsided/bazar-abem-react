@echo off
echo Regenerando cliente Prisma...
call npx prisma generate

echo.
echo Ejecutando seed...
call npx prisma db seed

echo.
echo Completado!
pause
