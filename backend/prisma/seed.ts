import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (opcional, comentar si no deseas limpiar)
  // await prisma.detalleVenta.deleteMany();
  // await prisma.venta.deleteMany();
  // await prisma.producto.deleteMany();
  // await prisma.cliente.deleteMany();
  // await prisma.usuario.deleteMany();

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nombre: 'Administrador',
      username: 'admin',
      password: hashedPassword,
      rol: 'Administrador',
    },
  });

  const vendedor = await prisma.usuario.upsert({
    where: { username: 'vendedor' },
    update: {},
    create: {
      nombre: 'Juan Pérez',
      username: 'vendedor',
      password: await bcrypt.hash('vendedor123', 10),
      rol: 'Vendedor',
    },
  });

  console.log('✅ Usuarios creados:', { admin: admin.username, vendedor: vendedor.username });

  // Crear clientes
  const clientes = [
    { nombre: 'Cliente Casual' },
    { nombre: 'María García' },
    { nombre: 'Carlos López' },
    { nombre: 'Ana Martínez' },
    { nombre: 'Pedro Rodríguez' },
  ];

  for (const cliente of clientes) {
    await prisma.cliente.upsert({
      where: { nombre: cliente.nombre },
      update: {},
      create: cliente,
    });
  }

  console.log('✅ Clientes creados:', clientes.length);

  // Crear productos
  const productos = [
    { nombre: 'Arroz Costeño 1kg' },
    { nombre: 'Aceite Primor 1L' },
    { nombre: 'Azúcar Rubia 1kg' },
    { nombre: 'Leche Gloria 1L' },
    { nombre: 'Pan Integral' },
    { nombre: 'Huevos x12' },
    { nombre: 'Fideos Don Vittorio' },
    { nombre: 'Atún Florida' },
    { nombre: 'Papel Higiénico Suave' },
    { nombre: 'Detergente Ariel' },
    { nombre: 'Jabón Bolívar' },
    { nombre: 'Shampoo Sedal' },
    { nombre: 'Galletas Soda' },
    { nombre: 'Café Nescafé' },
    { nombre: 'Té Herbi' },
  ];

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { nombre: producto.nombre },
      update: {},
      create: producto,
    });
  }

  console.log('✅ Productos creados:', productos.length);

  // Crear ventas de ejemplo
  const clientesCasual = await prisma.cliente.findFirst({
    where: { nombre: 'Cliente Casual' },
  });

  const clienteMaria = await prisma.cliente.findFirst({
    where: { nombre: 'María García' },
  });

  const productoArroz = await prisma.producto.findFirst({
    where: { nombre: 'Arroz Costeño 1kg' },
  });

  const productoAceite = await prisma.producto.findFirst({
    where: { nombre: 'Aceite Primor 1L' },
  });

  const productoLeche = await prisma.producto.findFirst({
    where: { nombre: 'Leche Gloria 1L' },
  });

  if (clientesCasual && productoArroz && productoAceite && productoLeche) {
    // Venta 1
    const venta1 = await prisma.venta.create({
      data: {
        cliente: clientesCasual.nombre,
        cliente_id: clientesCasual.id,
        productos: 'Arroz Costeño 1kg, Aceite Primor 1L',
        precio_total: 18.50,
        metodo_pago: 'Efectivo',
        usuario_id: admin.id,
        fecha_venta: new Date(),
        detalles: {
          create: [
            {
              producto_id: productoArroz.id,
              producto: productoArroz.nombre,
              cantidad: 2,
              precio: 4.50,
            },
            {
              producto_id: productoAceite.id,
              producto: productoAceite.nombre,
              cantidad: 1,
              precio: 9.50,
            },
          ],
        },
      },
    });

    // Venta 2
    const venta2 = await prisma.venta.create({
      data: {
        cliente: clienteMaria!.nombre,
        cliente_id: clienteMaria!.id,
        productos: 'Leche Gloria 1L',
        precio_total: 12.00,
        metodo_pago: 'Yape',
        usuario_id: vendedor.id,
        fecha_venta: new Date(Date.now() - 86400000), // Ayer
        detalles: {
          create: [
            {
              producto_id: productoLeche.id,
              producto: productoLeche.nombre,
              cantidad: 3,
              precio: 4.00,
            },
          ],
        },
      },
    });

    console.log('✅ Ventas de ejemplo creadas:', 2);
  }

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📝 Credenciales de acceso:');
  console.log('   Admin: username=admin, password=admin123');
  console.log('   Vendedor: username=vendedor, password=vendedor123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
