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
    const { cliente, productos, metodo_pago } = req.body;

    if (!cliente || !productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos',
      });
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

    // Buscar o crear cliente
    let clienteId = null;
    if (cliente !== 'Cliente Casual') {
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
    }

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
          })),
        },
      },
      include: {
        detalles: true,
      },
    });

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
