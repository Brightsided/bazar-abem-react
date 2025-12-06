import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Controlador de Reportes Optimizado
 * 
 * Características:
 * - Paginación
 * - Agregaciones en BD
 * - Índices para queries rápidas
 * - Caché (implementar con Redis)
 */

// ============================================
// TIPOS
// ============================================

interface FiltroReporte {
  filtro: 'hoy' | 'semana' | 'mes' | 'ano' | 'personalizado';
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
  limit?: number;
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Calcula las fechas según el filtro
 */
function calcularFechas(filtro: FiltroReporte): { inicio: Date; fin: Date } {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let inicio: Date;
  let fin: Date = new Date(hoy);
  fin.setHours(23, 59, 59, 999);

  switch (filtro.filtro) {
    case 'hoy':
      inicio = new Date(hoy);
      break;

    case 'semana':
      inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - hoy.getDay());
      break;

    case 'mes':
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      break;

    case 'ano':
      inicio = new Date(hoy.getFullYear(), 0, 1);
      break;

    case 'personalizado':
      if (!filtro.fecha_inicio || !filtro.fecha_fin) {
        throw new Error('Fechas requeridas para filtro personalizado');
      }
      inicio = new Date(filtro.fecha_inicio);
      fin = new Date(filtro.fecha_fin);
      fin.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error('Filtro inválido');
  }

  return { inicio, fin };
}

// ============================================
// CONTROLLERS
// ============================================

/**
 * GET /reportes/dashboard
 * Obtiene estadísticas del dashboard
 * 
 * Optimizaciones:
 * - Agregaciones en BD
 * - Índices en fecha_venta
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Ventas de hoy
    const ventasHoy = await prisma.venta.count({
      where: {
        fecha_venta: {
          gte: hoy,
        },
      },
    });

    // Total de hoy
    const totalHoy = await prisma.venta.aggregate({
      where: {
        fecha_venta: {
          gte: hoy,
        },
      },
      _sum: {
        precio_total: true,
      },
    });

    // Ventas de la semana
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());

    const ventasSemana = await prisma.venta.count({
      where: {
        fecha_venta: {
          gte: inicioSemana,
        },
      },
    });

    // Últimas 7 ventas
    const ultimasVentas = await prisma.venta.findMany({
      take: 7,
      orderBy: { fecha_venta: 'desc' },
      select: {
        id: true,
        cliente: true,
        productos: true,
        precio_total: true,
        fecha_venta: true,
      },
    });

    // Promedio por venta
    const promedioVenta =
      ventasHoy > 0 ? (totalHoy._sum.precio_total || 0) / ventasHoy : 0;

    res.json({
      ventasHoy,
      totalHoy: totalHoy._sum.precio_total || 0,
      ventasSemana,
      promedioVenta,
      ultimasVentas,
    });
  } catch (error) {
    console.error('Error en getDashboardStats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

/**
 * POST /reportes/ventas
 * Obtiene reporte de ventas con filtros y paginación
 * 
 * Body:
 * {
 *   filtro: 'hoy' | 'semana' | 'mes' | 'ano' | 'personalizado',
 *   fecha_inicio?: string (YYYY-MM-DD),
 *   fecha_fin?: string (YYYY-MM-DD),
 *   page?: number (default: 1),
 *   limit?: number (default: 50)
 * }
 * 
 * Optimizaciones:
 * - Paginación
 * - Agregaciones
 * - Índices en fecha_venta, metodo_pago
 */
export const getReporteVentas = async (req: Request, res: Response) => {
  try {
    const { filtro, fecha_inicio, fecha_fin, page = 1, limit = 50 } = req.body;

    // Validar página y límite
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Calcular fechas
    const { inicio, fin } = calcularFechas({
      filtro,
      fecha_inicio,
      fecha_fin,
    });

    // Condición WHERE común
    const whereCondition = {
      fecha_venta: {
        gte: inicio,
        lte: fin,
      },
    };

    // Obtener ventas (con paginación)
    const ventas = await prisma.venta.findMany({
      where: whereCondition,
      skip,
      take: limitNum,
      orderBy: { fecha_venta: 'desc' },
      select: {
        id: true,
        cliente: true,
        productos: true,
        metodo_pago: true,
        precio_total: true,
        fecha_venta: true,
      },
    });

    // Contar total de ventas
    const totalVentas = await prisma.venta.count({
      where: whereCondition,
    });

    // Sumar total de ingresos
    const totalIngresos = await prisma.venta.aggregate({
      where: whereCondition,
      _sum: {
        precio_total: true,
      },
    });

    // Agrupar por fecha (para gráfico)
    const ventasPorFecha = await prisma.venta.groupBy({
      by: ['fecha_venta'],
      where: whereCondition,
      _count: true,
      _sum: {
        precio_total: true,
      },
      orderBy: { fecha_venta: 'asc' },
    });

    // Agrupar por método de pago (para gráfico)
    const metodosPago = await prisma.venta.groupBy({
      by: ['metodo_pago'],
      where: whereCondition,
      _count: true,
      _sum: {
        precio_total: true,
      },
    });

    // Ranking de vendedores (si existe campo vendedor)
    // Descomentar si existe el campo en la BD
    // const ranking = await prisma.venta.groupBy({
    //   by: ['vendedor'],
    //   where: whereCondition,
    //   _count: true,
    //   _sum: {
    //     precio_total: true,
    //   },
    //   orderBy: {
    //     _sum: {
    //       precio_total: 'desc',
    //     },
    //   },
    //   take: 10,
    // });

    // Formatear datos para gráficos
    const ventasPorFechaFormatted = ventasPorFecha.reduce(
      (acc, item) => {
        const fecha = item.fecha_venta.toISOString().split('T')[0];
        acc[fecha] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const metodosPagoFormatted = metodosPago.reduce(
      (acc, item) => {
        acc[item.metodo_pago] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    res.json({
      ventas,
      totalVentas,
      totalIngresos: totalIngresos._sum.precio_total || 0,
      ventasPorFecha: ventasPorFechaFormatted,
      metodosPago: metodosPagoFormatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalVentas,
        pages: Math.ceil(totalVentas / limitNum),
      },
      // ranking: ranking.map(r => ({
      //   nombre: r.vendedor,
      //   cantidad: r._count,
      //   total: r._sum.precio_total || 0,
      // })),
    });
  } catch (error) {
    console.error('Error en getReporteVentas:', error);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
};

/**
 * POST /reportes/ventas/export
 * Exporta reporte a CSV (sin paginación)
 * 
 * Nota: Usar con cuidado, puede ser lento con muchos datos
 */
export const exportarReporteVentas = async (req: Request, res: Response) => {
  try {
    const { filtro, fecha_inicio, fecha_fin } = req.body;

    const { inicio, fin } = calcularFechas({
      filtro,
      fecha_inicio,
      fecha_fin,
    });

    const ventas = await prisma.venta.findMany({
      where: {
        fecha_venta: {
          gte: inicio,
          lte: fin,
        },
      },
      orderBy: { fecha_venta: 'desc' },
    });

    // Convertir a CSV
    const csv = [
      ['ID', 'Cliente', 'Productos', 'Método Pago', 'Total', 'Fecha'],
      ...ventas.map((v) => [
        v.id,
        v.cliente,
        v.productos,
        v.metodo_pago,
        v.precio_total,
        v.fecha_venta.toISOString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error en exportarReporteVentas:', error);
    res.status(500).json({ error: 'Error al exportar reporte' });
  }
};
