import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed minimo de usuarios...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const trabajadorPassword = await bcrypt.hash('trabajador123', 10);

  const admin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nombre: 'Administrador',
      username: 'admin',
      password: adminPassword,
      rol: 'Administrador',
    },
  });

  const trabajador = await prisma.usuario.upsert({
    where: { username: 'trabajador' },
    update: {},
    create: {
      nombre: 'Trabajador',
      username: 'trabajador',
      password: trabajadorPassword,
      rol: 'Vendedor',
    },
  });

  console.log('✅ Usuarios creados/actualizados:', {
    admin: admin.username,
    trabajador: trabajador.username,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
