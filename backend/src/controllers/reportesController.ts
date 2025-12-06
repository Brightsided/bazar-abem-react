import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(inicioSemana.getDate() - hoy.getDay());

    // Ventas de hoy
    const ventasHoy = await prisma.venta.count({
      where: {
        fecha_venta: {
          gte: hoy,
          lt: manana,
        },
      },
    });

    const totalHoyResult = await prisma.venta.aggregate({
      where: {
        fecha_venta: {
          gte: hoy,
          lt: manana,
        },
      },
      _sum: {
        precio_total: true,
      },
    });

    // Ventas de la semana
    const ventasSemana = await prisma.venta.count({
      where: {
        fecha_venta: {
          gte: inicioSemana,
        },
      },
    });

    const totalSemanaResult = await prisma.venta.aggregate({
      where: {
        fecha_venta: {
          gte: inicioSemana,
        },
      },
      _sum: {
        precio_total: true,
      },
    });

    // Promedio por venta
    const promedioResult = await prisma.venta.aggregate({
      _avg: {
        precio_total: true,
      },
    });

    // Últimas 7 ventas
    const ultimasVentas = await prisma.venta.findMany({
      take: 7,
      orderBy: {
        fecha_venta: 'desc',
      },
      include: {
        detalles: true,
      },
    });

    res.json({
      ventasHoy,
      totalHoy: Number(totalHoyResult._sum.precio_total || 0),
      ventasSemana,
      totalSemana: Number(totalSemanaResult._sum.precio_total || 0),
      promedioVenta: Number(promedioResult._avg.precio_total || 0),
      ultimasVentas,
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
    });
  }
};

export const getReporteVentas = async (req: AuthRequest, res: Response) => {
  try {
    const { filtro, fecha_inicio, fecha_fin } = req.body;

    let fechaInicio: Date;
    let fechaFin: Date = new Date();

    switch (filtro) {
      case 'hoy':
        fechaInicio = new Date();
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        break;
      case 'mes':
        fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        break;
      case 'ano':
        fechaInicio = new Date();
        fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        break;
      case 'personalizado':
        if (!fecha_inicio || !fecha_fin) {
          return res.status(400).json({
            success: false,
            message: 'Fechas requeridas para filtro personalizado',
          });
        }
        fechaInicio = new Date(fecha_inicio);
        fechaFin = new Date(fecha_fin);
        fechaFin.setHours(23, 59, 59, 999);
        break;
      default:
        fechaInicio = new Date();
        fechaInicio.setHours(0, 0, 0, 0);
    }

    // ✅ OPTIMIZACIÓN: Usar agregaciones de Prisma en lugar de traer todos los datos
    // Obtener ventas con select limitado para mejor performance
    const ventas = await prisma.venta.findMany({
      where: {
        fecha_venta: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      select: {
        id: true,
        cliente: true,
        productos: true,
        precio_total: true,
        metodo_pago: true,
        fecha_venta: true,
        usuario_id: true,
        usuarioRel: {
          select: {
            id: true,
            nombre: true,
            username: true,
            rol: true,
          },
        },
        detalles: {
          select: {
            producto_id: true,
            producto: true,
            cantidad: true,
            precio: true,
          },
        },
      },
      orderBy: {
        fecha_venta: 'desc',
      },
    });

    // ✅ OPTIMIZACIÓN: Calcular total con agregación en lugar de en memoria
    const totalResult = await prisma.venta.aggregate({
      where: {
        fecha_venta: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      _sum: {
        precio_total: true,
      },
    });

    const totalVentas = Number(totalResult._sum.precio_total || 0);

    // Ventas por fecha - Optimizado
    const ventasPorFecha: Record<string, number> = {};
    const ventasPorFechaDetalle: Record<string, { cantidad: number; total: number }> = {};

    ventas.forEach((venta) => {
      const fecha = venta.fecha_venta.toISOString().split('T')[0];
      const monto = Number(venta.precio_total);
      
      ventasPorFecha[fecha] = (ventasPorFecha[fecha] || 0) + monto;
      
      if (!ventasPorFechaDetalle[fecha]) {
        ventasPorFechaDetalle[fecha] = { cantidad: 0, total: 0 };
      }
      ventasPorFechaDetalle[fecha].cantidad++;
      ventasPorFechaDetalle[fecha].total += monto;
    });

    // Métodos de pago - Optimizado con Map
    const metodosPagoMap = new Map<string, { cantidad: number; total: number }>();

    ventas.forEach((venta) => {
      const metodo = venta.metodo_pago;
      const monto = Number(venta.precio_total);
      
      if (!metodosPagoMap.has(metodo)) {
        metodosPagoMap.set(metodo, { cantidad: 0, total: 0 });
      }
      const data = metodosPagoMap.get(metodo)!;
      data.cantidad++;
      data.total += monto;
    });

    const metodosPago: Record<string, number> = {};
    const metodosPagoDetalle: any[] = [];

    metodosPagoMap.forEach((data, metodo) => {
      metodosPago[metodo] = data.total;
      metodosPagoDetalle.push({ metodo_pago: metodo, cantidad: data.cantidad, total: data.total });
    });

    // Ranking de vendedores - Optimizado con Map
    const ventasPorUsuarioMap = new Map<number, any>();

    ventas.forEach((venta) => {
      if (venta.usuario_id && venta.usuarioRel) {
        const userId = venta.usuario_id;
        const monto = Number(venta.precio_total);
        
        if (!ventasPorUsuarioMap.has(userId)) {
          ventasPorUsuarioMap.set(userId, {
            id: venta.usuarioRel.id,
            nombre: venta.usuarioRel.nombre,
            username: venta.usuarioRel.username,
            rol: venta.usuarioRel.rol,
            cantidad: 0,
            total: 0,
          });
        }
        const userData = ventasPorUsuarioMap.get(userId)!;
        userData.cantidad++;
        userData.total += monto;
      }
    });

    const ranking = Array.from(ventasPorUsuarioMap.values()).sort((a, b) => b.total - a.total);

    // Mapear detalles a detalle_productos para compatibilidad con frontend
    const ventasConDetalles = ventas.map(venta => ({
      ...venta,
      detalle_productos: venta.detalles.map(d => ({
        producto_id: d.producto_id,
        nombre: d.producto,
        producto: d.producto,
        cantidad: d.cantidad,
        precio: d.precio,
      })),
      detalles: undefined,
    }));

    res.json({
      success: true,
      ventas: ventasConDetalles,
      ventasPorFecha,
      ventasPorFechaDetalle,
      metodosPago,
      metodosPagoDetalle,
      totalVentas,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
      filtro,
      ranking,
    });
  } catch (error) {
    console.error('GetReporteVentas error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte',
    });
  }
};
