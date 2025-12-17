import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getVentas = async (req: AuthRequest, res: Response) => {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        detalles: true,
        usuarioRel: {
          select: {
            id: true,
            nombre: true,
            username: true,
            rol: true,
          },
        },
      },
      orderBy: {
        fecha_venta: 'desc',
      },
    });

    res.json(ventas);
  } catch (error) {
    console.error('GetVentas error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas',
    });
  }
};

export const getVenta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(id) },
      include: {
        detalles: true,
        usuarioRel: {
          select: {
            id: true,
            nombre: true,
            username: true,
            rol: true,
          },
        },
      },
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada',
      });
    }

    res.json(venta);
  } catch (error) {
    console.error('GetVenta error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener venta',
    });
  }
};

export const createVenta = async (req: AuthRequest, res: Response) => {
  try {
    const { cliente, cliente_id, productos, metodo_pago } = req.body;

    if (!cliente || !productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos',
      });
    }

    // Validar stock disponible para todos los productos
    for (const prod of productos) {
      const almacenamiento = await prisma.almacenamiento.findUnique({
        where: { producto_id: prod.producto_id },
      });

      if (!almacenamiento || almacenamiento.stock < prod.cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${prod.nombre}. Disponible: ${almacenamiento?.stock || 0}`,
        });
      }
    }

    // Calcular total
    const precio_total = productos.reduce(
      (sum: number, prod: any) => sum + prod.cantidad * prod.precio,
      0
    );

    // Crear descripción de productos
    const productosDesc = productos
      .map((p: any) => `${p.nombre} (${p.cantidad})`)
      .join(', ');

    // Determinar clienteId
    let clienteId = cliente_id || null;
    
    console.log('Antes de procesar - clienteId:', clienteId, 'cliente:', cliente);
    
    // Si no viene cliente_id pero el cliente no es "Cliente Casual", buscar o crear
    if (!clienteId && cliente && cliente !== 'Cliente Casual') {
      try {
        const clienteExistente = await prisma.cliente.findUnique({
          where: { nombre: cliente },
        });

        if (clienteExistente) {
          clienteId = clienteExistente.id;
        } else {
          const nuevoCliente = await prisma.cliente.create({
            data: { nombre: cliente },
          });
          clienteId = nuevoCliente.id;
        }
      } catch (error: any) {
        // Si hay error de unicidad, buscar el cliente existente
        if (error.code === 'P2002') {
          const clienteExistente = await prisma.cliente.findUnique({
            where: { nombre: cliente },
          });
          if (clienteExistente) {
            clienteId = clienteExistente.id;
          }
        }
      }
    }
    
    console.log('Después de procesar - clienteId final:', clienteId);

    // Crear venta
    const venta = await prisma.venta.create({
      data: {
        cliente,
        cliente_id: clienteId,
        productos: productosDesc,
        precio_total,
        metodo_pago,
        usuario_id: req.user!.id,
        detalles: {
          create: productos.map((prod: any) => ({
            producto: prod.nombre,
            cantidad: prod.cantidad,
            precio: prod.precio,
            producto_id: prod.producto_id,
          })),
        },
      },
      include: {
        detalles: true,
      },
    });

    // Disminuir stock y registrar movimientos
    for (const prod of productos) {
      const almacenamiento = await prisma.almacenamiento.findUnique({
        where: { producto_id: prod.producto_id },
      });

      if (almacenamiento) {
        const stock_anterior = almacenamiento.stock;
        const stock_nuevo = stock_anterior - prod.cantidad;

        // Actualizar stock
        await prisma.almacenamiento.update({
          where: { id: almacenamiento.id },
          data: { stock: stock_nuevo },
        });

        // Registrar movimiento
        await prisma.movimientoInventario.create({
          data: {
            almacenamiento_id: almacenamiento.id,
            producto_id: prod.producto_id,
            tipo_movimiento: 'SALIDA',
            cantidad: prod.cantidad,
            stock_anterior,
            stock_nuevo,
            referencia_venta_id: venta.id,
            descripcion: `Venta registrada - ${prod.nombre}`,
            usuario_id: req.user!.id,
          },
        });

        // Verificar si hay stock bajo y crear alerta si es necesario
        if (stock_nuevo <= almacenamiento.stock_minimo) {
          const alertaExistente = await prisma.alertaStock.findFirst({
            where: {
              almacenamiento_id: almacenamiento.id,
              estado: 'ACTIVA',
            },
          });

          if (!alertaExistente) {
            await prisma.alertaStock.create({
              data: {
                almacenamiento_id: almacenamiento.id,
                producto_id: prod.producto_id,
                tipo_alerta: 'STOCK_BAJO',
                stock_actual: stock_nuevo,
                stock_minimo: almacenamiento.stock_minimo,
                estado: 'ACTIVA',
              },
            });
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      venta,
    });
  } catch (error) {
    console.error('CreateVenta error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear venta',
    });
  }
};

export const deleteVenta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.venta.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Venta eliminada exitosamente',
    });
  } catch (error) {
    console.error('DeleteVenta error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar venta',
    });
  }
};
