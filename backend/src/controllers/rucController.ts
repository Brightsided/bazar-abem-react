import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const calcularRUC = async (req: AuthRequest, res: Response) => {
  try {
    const { mes, ano } = req.body;

    if (!mes || !ano) {
      return res.status(400).json({
        success: false,
        message: 'Mes y año son requeridos',
      });
    }

    // Calcular fechas del mes
    const fechaInicio = new Date(ano, mes - 1, 1);
    const fechaFin = new Date(ano, mes, 0, 23, 59, 59, 999);

    // Obtener ventas del mes
    const result = await prisma.venta.aggregate({
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

    const total_ventas = Number(result._sum.precio_total || 0);

    let categoria: number | string;
    let monto: number | string;

    if (total_ventas < 5000) {
      categoria = 1;
      monto = 20;
    } else if (total_ventas >= 5000 && total_ventas <= 8000) {
      categoria = 2;
      monto = 50;
    } else {
      categoria = 'Excede RUS';
      monto = 'Debe cambiar de régimen';
    }

    res.json({
      success: true,
      categoria,
      monto,
      total_ventas,
    });
  } catch (error) {
    console.error('CalcularRUC error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular RUC',
    });
  }
};
