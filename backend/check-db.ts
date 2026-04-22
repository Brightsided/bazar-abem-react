// Script para ejecutar migraciones en Railway
import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
require('dotenv').config({ path: '.env.production' });

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Verificando conexión a la base de datos...');
  
  try {
    // Probar conexión
    await prisma.$connect();
    console.log('✅ Conexión exitosa a MySQL en Railway');
    
    // Las migraciones se aplican automáticamente con prisma migrate deploy
    // Pero aquí verificamos que las tablas existan
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log('📋 Tablas existentes:', tables);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();