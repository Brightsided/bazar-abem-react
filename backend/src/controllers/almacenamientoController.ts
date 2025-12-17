import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Obtener todos los productos del almacenamiento
export const getAlmacenamiento = async (req: AuthRequest, res: Response) => {
  try {
    const almacenamiento = await prisma.almacenamiento.findMany({
      include: {
        producto: true,
      },
      orderBy: {
        fecha_actualizacion: 'desc',
      },
    });

    res.json(almacenamiento);
  } catch (error) {
    console.error('GetAlmacenamiento error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener almacenamiento',
    });
  }
};

// Obtener un producto del almacenamiento
export const getAlmacenamientoProducto = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const almacenamiento = await prisma.almacenamiento.findUnique({
      where: { id: parseInt(id) },
      include: {
        producto: true,
      },
    });

    if (!almacenamiento) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en almacenamiento',
      });
    }

    res.json(almacenamiento);
  } catch (error) {
    console.error('GetAlmacenamientoProducto error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto del almacenamiento',
    });
  }
};

// Obtener productos con stock bajo
export const getProductosStockBajo = async (req: AuthRequest, res: Response) => {
  try {
    // Obtener todos los almacenamientos
    const almacenamientos = await prisma.almacenamiento.findMany({
      include: {
        producto: true,
      },
    });

    // Filtrar aquellos con stock bajo
    const productosStockBajo = almacenamientos.filter(
      (item) => item.stock <= item.stock_minimo
    );

    res.json(productosStockBajo);
  } catch (error) {
    console.error('GetProductosStockBajo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos con stock bajo',
    });
  }
};

// Actualizar stock de un producto
export const actualizarStock = async (req: AuthRequest, res: Response) => {
  try {
    const { almacenamiento_id, cantidad, tipo_movimiento, descripcion } = req.body;

    if (!almacenamiento_id || cantidad === undefined || !tipo_movimiento) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos',
      });
    }

    // Validar que cantidad sea positiva
    if (cantidad <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser mayor a 0',
      });
    }

    // Obtener almacenamiento actual
    const almacenamiento = await prisma.almacenamiento.findUnique({
      where: { id: almacenamiento_id },
      include: { producto: true },
    });

    if (!almacenamiento) {
      return res.status(404).json({
        success: false,
        message: 'Almacenamiento no encontrado',
      });
    }

    const stock_anterior = almacenamiento.stock;
    let stock_nuevo = stock_anterior;

    // Calcular nuevo stock según tipo de movimiento
    if (tipo_movimiento === 'ENTRADA') {
      stock_nuevo = stock_anterior + cantidad;
    } else if (tipo_movimiento === 'SALIDA') {
      if (stock_anterior < cantidad) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente',
        });
      }
      stock_nuevo = stock_anterior - cantidad;
    } else if (tipo_movimiento === 'AJUSTE') {
      stock_nuevo = cantidad;
    }

    // Actualizar almacenamiento
    const almacenamientoActualizado = await prisma.almacenamiento.update({
      where: { id: almacenamiento_id },
      data: {
        stock: stock_nuevo,
      },
      include: { producto: true },
    });

    // Registrar movimiento
    await prisma.movimientoInventario.create({
      data: {
        almacenamiento_id,
        producto_id: almacenamiento.producto_id,
        tipo_movimiento,
        cantidad,
        stock_anterior,
        stock_nuevo,
        descripcion: descripcion || `Movimiento ${tipo_movimiento}`,
        usuario_id: req.user?.id,
      },
    });

    // Verificar si hay stock bajo y crear alerta si es necesario
    if (stock_nuevo <= almacenamiento.stock_minimo) {
      // Verificar si ya existe una alerta activa
      const alertaExistente = await prisma.alertaStock.findFirst({
        where: {
          almacenamiento_id,
          estado: 'ACTIVA',
        },
      });

      if (!alertaExistente) {
        await prisma.alertaStock.create({
          data: {
            almacenamiento_id,
            producto_id: almacenamiento.producto_id,
            tipo_alerta: 'STOCK_BAJO',
            stock_actual: stock_nuevo,
            stock_minimo: almacenamiento.stock_minimo,
            estado: 'ACTIVA',
          },
        });
      }
    } else {
      // Si el stock es suficiente, resolver alertas activas
      await prisma.alertaStock.updateMany({
        where: {
          almacenamiento_id,
          estado: 'ACTIVA',
        },
        data: {
          estado: 'RESUELTA',
          fecha_resolucion: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: 'Stock actualizado exitosamente',
      almacenamiento: almacenamientoActualizado,
    });
  } catch (error) {
    console.error('ActualizarStock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar stock',
    });
  }
};

// Obtener historial de movimientos
export const getMovimientosInventario = async (req: AuthRequest, res: Response) => {
  try {
    const { producto_id, tipo_movimiento, fecha_inicio, fecha_fin } = req.query;

    const where: any = {};

    if (producto_id) {
      where.producto_id = parseInt(producto_id as string);
    }

    if (tipo_movimiento) {
      where.tipo_movimiento = tipo_movimiento;
    }

    if (fecha_inicio || fecha_fin) {
      where.fecha_movimiento = {};
      if (fecha_inicio) {
        where.fecha_movimiento.gte = new Date(fecha_inicio as string);
      }
      if (fecha_fin) {
        where.fecha_movimiento.lte = new Date(fecha_fin as string);
      }
    }

    const movimientos = await prisma.movimientoInventario.findMany({
      where,
      include: {
        producto: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            username: true,
          },
        },
      },
      orderBy: {
        fecha_movimiento: 'desc',
      },
    });

    res.json(movimientos);
  } catch (error) {
    console.error('GetMovimientosInventario error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos de inventario',
    });
  }
};

// Obtener alertas de stock
export const getAlertasStock = async (req: AuthRequest, res: Response) => {
  try {
    const { estado } = req.query;

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    const alertas = await prisma.alertaStock.findMany({
      where,
      include: {
        producto: true,
        almacenamiento: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    res.json(alertas);
  } catch (error) {
    console.error('GetAlertasStock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas de stock',
    });
  }
};

// Generar código de barras para un producto
export const generarCodigoBarras = async (req: AuthRequest, res: Response) => {
  try {
    const { almacenamiento_id } = req.body;

    if (!almacenamiento_id) {
      return res.status(400).json({
        success: false,
        message: 'ID de almacenamiento requerido',
      });
    }

    const almacenamiento = await prisma.almacenamiento.findUnique({
      where: { id: almacenamiento_id },
      include: { producto: true },
    });

    if (!almacenamiento) {
      return res.status(404).json({
        success: false,
        message: 'Almacenamiento no encontrado',
      });
    }

    // Generar código de barras único
    const codigo_barras = `PROD-${almacenamiento.producto_id}-${Date.now()}`;

    const almacenamientoActualizado = await prisma.almacenamiento.update({
      where: { id: almacenamiento_id },
      data: {
        codigo_barras,
      },
      include: { producto: true },
    });

    res.json({
      success: true,
      message: 'Código de barras generado exitosamente',
      almacenamiento: almacenamientoActualizado,
    });
  } catch (error) {
    console.error('GenerarCodigoBarras error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar código de barras',
    });
  }
};

// Crear nuevo almacenamiento para un producto
export const createAlmacenamiento = async (req: AuthRequest, res: Response) => {
  try {
    const { producto_id, stock, stock_minimo } = req.body;

    if (!producto_id || stock === undefined || stock_minimo === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos. Se requiere: producto_id, stock, stock_minimo',
      });
    }

    // Verificar que el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id: producto_id },
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    // Verificar que no exista almacenamiento para este producto
    const almacenamientoExistente = await prisma.almacenamiento.findUnique({
      where: { producto_id },
    });

    if (almacenamientoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe almacenamiento para este producto',
      });
    }

    // Crear almacenamiento
    const almacenamiento = await prisma.almacenamiento.create({
      data: {
        producto_id,
        stock: parseInt(stock),
        stock_minimo: parseInt(stock_minimo),
      },
      include: {
        producto: true,
      },
    });

    res.status(201).json(almacenamiento);
  } catch (error: any) {
    console.error('CreateAlmacenamiento error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear almacenamiento',
    });
  }
};

// Obtener productos disponibles para venta (con stock > 0)
export const getProductosDisponibles = async (req: AuthRequest, res: Response) => {
  try {
    const productosDisponibles = await prisma.almacenamiento.findMany({
      where: {
        stock: {
          gt: 0,
        },
      },
      include: {
        producto: true,
      },
      orderBy: {
        producto: {
          nombre: 'asc',
        },
      },
    });

    res.json(productosDisponibles);
  } catch (error) {
    console.error('GetProductosDisponibles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos disponibles',
    });
  }
};

// Actualizar almacenamiento (stock y stock_minimo)
export const updateAlmacenamiento = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stock, stock_minimo } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de almacenamiento requerido',
      });
    }

    // Obtener almacenamiento actual
    const almacenamiento = await prisma.almacenamiento.findUnique({
      where: { id: parseInt(id) },
      include: { producto: true },
    });

    if (!almacenamiento) {
      return res.status(404).json({
        success: false,
        message: 'Almacenamiento no encontrado',
      });
    }

    // Actualizar almacenamiento
    const almacenamientoActualizado = await prisma.almacenamiento.update({
      where: { id: parseInt(id) },
      data: {
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(stock_minimo !== undefined && { stock_minimo: parseInt(stock_minimo) }),
      },
      include: { producto: true },
    });

    // Verificar si hay stock bajo y crear alerta si es necesario
    if (almacenamientoActualizado.stock <= almacenamientoActualizado.stock_minimo) {
      const alertaExistente = await prisma.alertaStock.findFirst({
        where: {
          almacenamiento_id: parseInt(id),
          estado: 'ACTIVA',
        },
      });

      if (!alertaExistente) {
        await prisma.alertaStock.create({
          data: {
            almacenamiento_id: parseInt(id),
            producto_id: almacenamiento.producto_id,
            tipo_alerta: 'STOCK_BAJO',
            stock_actual: almacenamientoActualizado.stock,
            stock_minimo: almacenamientoActualizado.stock_minimo,
            estado: 'ACTIVA',
          },
        });
      }
    } else {
      // Si el stock es suficiente, resolver alertas activas
      await prisma.alertaStock.updateMany({
        where: {
          almacenamiento_id: parseInt(id),
          estado: 'ACTIVA',
        },
        data: {
          estado: 'RESUELTA',
          fecha_resolucion: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: 'Almacenamiento actualizado exitosamente',
      almacenamiento: almacenamientoActualizado,
    });
  } catch (error) {
    console.error('UpdateAlmacenamiento error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar almacenamiento',
    });
  }
};
