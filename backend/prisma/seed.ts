import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (opcional, comentar si no deseas limpiar)
  // await prisma.movimientoInventario.deleteMany();
  // await prisma.alertaStock.deleteMany();
  // await prisma.almacenamiento.deleteMany();
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

  // Crear productos con precios (ACTUALIZADO)
  const productos = [
    { nombre: 'Arroz Costeño 1kg', precio: 3.50 },
    { nombre: 'Aceite Primor 1L', precio: 5.20 },
    { nombre: 'Azúcar Rubia 1kg', precio: 2.80 },
    { nombre: 'Leche Gloria 1L', precio: 4.10 },
    { nombre: 'Pan Integral', precio: 1.50 },
    { nombre: 'Huevos x12', precio: 6.00 },
    { nombre: 'Fideos Don Vittorio', precio: 1.20 },
    { nombre: 'Atún Florida', precio: 2.50 },
    { nombre: 'Papel Higiénico Suave', precio: 3.00 },
    { nombre: 'Detergente Ariel', precio: 4.50 },
    { nombre: 'Jabón Bolívar', precio: 1.80 },
    { nombre: 'Shampoo Sedal', precio: 3.50 },
    { nombre: 'Galletas Soda', precio: 2.00 },
    { nombre: 'Café Nescafé', precio: 8.50 },
    { nombre: 'Té Herbi', precio: 2.50 },
  ];

  const productosCreados = [];
  for (const producto of productos) {
    const prod = await prisma.producto.upsert({
      where: { nombre: producto.nombre },
      update: { precio: producto.precio },
      create: producto,
    });
    productosCreados.push(prod);
  }

  console.log('✅ Productos creados:', productosCreados.length);

  // Crear una caja abierta de ejemplo para el admin (para pruebas de Cierre de Caja)
  const cajaAdmin = await prisma.cierreCaja.create({
    data: {
      usuario_id: admin.id,
      monto_inicial: 50,
      observaciones: 'Caja de prueba creada por seed',
      estado: 'ABIERTO',
    },
  });

  console.log('✅ Caja abierta de ejemplo creada:', cajaAdmin.id);

  // Crear almacenamiento para cada producto (NUEVO)
  console.log('📦 Creando almacenamiento...');
  const almacenamientos = [];
  for (const producto of productosCreados) {
    const almacen = await prisma.almacenamiento.upsert({
      where: { producto_id: producto.id },
      update: {},
      create: {
        producto_id: producto.id,
        stock: 10, // Stock inicial
        stock_minimo: 5,
        codigo_barras: `PROD-${producto.id}-${Date.now()}`,
      },
    });
    almacenamientos.push(almacen);
  }

  console.log('✅ Almacenamiento creado:', almacenamientos.length);

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
        productos: 'Arroz Costeño 1kg (2), Aceite Primor 1L (1)',
        precio_total: 12.20,
        metodo_pago: 'Efectivo',
        usuario_id: admin.id,
        fecha_venta: new Date(),
        detalles: {
          create: [
            {
              producto_id: productoArroz.id,
              producto: productoArroz.nombre,
              cantidad: 2,
              precio: productoArroz.precio,
            },
            {
              producto_id: productoAceite.id,
              producto: productoAceite.nombre,
              cantidad: 1,
              precio: productoAceite.precio,
            },
          ],
        },
      },
    });

    // Registrar movimientos de inventario para venta 1
    const almacenArroz = await prisma.almacenamiento.findUnique({
      where: { producto_id: productoArroz.id },
    });

    const almacenAceite = await prisma.almacenamiento.findUnique({
      where: { producto_id: productoAceite.id },
    });

    if (almacenArroz) {
      await prisma.movimientoInventario.create({
        data: {
          almacenamiento_id: almacenArroz.id,
          producto_id: productoArroz.id,
          tipo_movimiento: 'SALIDA',
          cantidad: 2,
          stock_anterior: 10,
          stock_nuevo: 8,
          referencia_venta_id: venta1.id,
          descripcion: 'Venta registrada - Arroz Costeño 1kg',
          usuario_id: admin.id,
        },
      });

      // Actualizar stock
      await prisma.almacenamiento.update({
        where: { id: almacenArroz.id },
        data: { stock: 8 },
      });
    }

    if (almacenAceite) {
      await prisma.movimientoInventario.create({
        data: {
          almacenamiento_id: almacenAceite.id,
          producto_id: productoAceite.id,
          tipo_movimiento: 'SALIDA',
          cantidad: 1,
          stock_anterior: 10,
          stock_nuevo: 9,
          referencia_venta_id: venta1.id,
          descripcion: 'Venta registrada - Aceite Primor 1L',
          usuario_id: admin.id,
        },
      });

      // Actualizar stock
      await prisma.almacenamiento.update({
        where: { id: almacenAceite.id },
        data: { stock: 9 },
      });
    }

    // Venta 2
    const venta2 = await prisma.venta.create({
      data: {
        cliente: clienteMaria!.nombre,
        cliente_id: clienteMaria!.id,
        productos: 'Leche Gloria 1L (3)',
        precio_total: 12.30,
        metodo_pago: 'Yape',
        usuario_id: vendedor.id,
        fecha_venta: new Date(Date.now() - 86400000), // Ayer
        detalles: {
          create: [
            {
              producto_id: productoLeche.id,
              producto: productoLeche.nombre,
              cantidad: 3,
              precio: productoLeche.precio,
            },
          ],
        },
      },
    });

    // Registrar movimiento de inventario para venta 2
    const almacenLeche = await prisma.almacenamiento.findUnique({
      where: { producto_id: productoLeche.id },
    });

    if (almacenLeche) {
      await prisma.movimientoInventario.create({
        data: {
          almacenamiento_id: almacenLeche.id,
          producto_id: productoLeche.id,
          tipo_movimiento: 'SALIDA',
          cantidad: 3,
          stock_anterior: 10,
          stock_nuevo: 7,
          referencia_venta_id: venta2.id,
          descripcion: 'Venta registrada - Leche Gloria 1L',
          usuario_id: vendedor.id,
        },
      });

      // Actualizar stock
      await prisma.almacenamiento.update({
        where: { id: almacenLeche.id },
        data: { stock: 7 },
      });

      // Crear alerta si stock es bajo
      if (7 <= 5) {
        await prisma.alertaStock.create({
          data: {
            almacenamiento_id: almacenLeche.id,
            producto_id: productoLeche.id,
            tipo_alerta: 'STOCK_BAJO',
            stock_actual: 7,
            stock_minimo: 5,
            estado: 'ACTIVA',
          },
        });
      }
    }

    console.log('✅ Ventas de ejemplo creadas:', 2);
    console.log('✅ Movimientos de inventario registrados');
  }

  // Crear algunos movimientos de entrada de ejemplo
  console.log('📥 Creando movimientos de entrada...');
  const almacenPan = await prisma.almacenamiento.findFirst({
    where: { producto: { nombre: 'Pan Integral' } },
  });

  if (almacenPan) {
    await prisma.movimientoInventario.create({
      data: {
        almacenamiento_id: almacenPan.id,
        producto_id: almacenPan.producto_id,
        tipo_movimiento: 'ENTRADA',
        cantidad: 5,
        stock_anterior: 10,
        stock_nuevo: 15,
        descripcion: 'Compra a proveedor',
        usuario_id: admin.id,
      },
    });

    await prisma.almacenamiento.update({
      where: { id: almacenPan.id },
      data: { stock: 15 },
    });
  }

  console.log('✅ Movimientos de entrada creados');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   ✅ Usuarios: 2`);
  console.log(`   ✅ Clientes: ${clientes.length}`);
  console.log(`   ✅ Productos: ${productosCreados.length}`);
  console.log(`   ✅ Almacenamiento: ${almacenamientos.length}`);
  console.log(`   ✅ Ventas: 2`);
  console.log(`   ✅ Movimientos de inventario: 4`);
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
