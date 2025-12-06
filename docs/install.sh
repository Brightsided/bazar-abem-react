#!/bin/bash

echo "========================================"
echo "  BAZAR ABEM - Instalación Automática"
echo "========================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "[1/6] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js no está instalado${NC}"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}OK - Node.js $(node --version) instalado${NC}"
echo ""

# Verificar npm
echo "[2/6] Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}ERROR: npm no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}OK - npm $(npm --version) instalado${NC}"
echo ""

# Verificar MySQL
echo "[3/6] Verificando MySQL..."
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}ADVERTENCIA: MySQL no encontrado en PATH${NC}"
    echo "Asegúrate de tener MySQL instalado y corriendo"
else
    echo -e "${GREEN}OK - MySQL instalado${NC}"
fi
echo ""

# Instalar dependencias del backend
echo "[4/6] Instalando dependencias del backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Falló la instalación del backend${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Backend ya tiene dependencias instaladas${NC}"
fi
cd ..
echo ""

# Instalar dependencias del frontend
echo "[5/6] Instalando dependencias del frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Falló la instalación del frontend${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Frontend ya tiene dependencias instaladas${NC}"
fi
cd ..
echo ""

# Verificar archivos .env
echo "[6/6] Verificando archivos de configuración..."
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}ADVERTENCIA: backend/.env no existe${NC}"
    echo "Copiando desde backend/.env.example..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}IMPORTANTE: Edita backend/.env con tus configuraciones${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}ADVERTENCIA: frontend/.env no existe${NC}"
    echo "Copiando desde frontend/.env.example..."
    cp frontend/.env.example frontend/.env
    echo -e "${YELLOW}IMPORTANTE: Edita frontend/.env con tus configuraciones${NC}"
fi
echo ""

# Hacer ejecutable el script
chmod +x install.sh 2>/dev/null

# Instrucciones finales
echo -e "${GREEN}[✓] Instalación completada!${NC}"
echo ""
echo "========================================"
echo "  PRÓXIMOS PASOS"
echo "========================================"
echo ""
echo "1. Configura la base de datos:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE bazar_abem;"
echo "   EXIT;"
echo ""
echo "2. Configura backend/.env con tus datos"
echo ""
echo "3. Ejecuta las migraciones:"
echo "   cd backend"
echo "   npx prisma generate"
echo "   npx prisma migrate dev"
echo "   npx tsx prisma/seed.ts"
echo ""
echo "4. Inicia el proyecto:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "5. Abre http://localhost:5173"
echo "   Usuario: admin"
echo "   Password: admin123"
echo ""
echo "========================================"
echo "Para más información, lee README.md"
echo "========================================"
echo ""
