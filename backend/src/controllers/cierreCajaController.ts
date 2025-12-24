import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function normalizeMetodoPago(m: string) {
  const v = (m || '').trim().toLowerCase();
  if (v === 'efectivo') return 'EFECTIVO';
  if (v === 'yape') return 'YAPE';
  if (v === 'plin') return 'PLIN';
  if (v === 'tarjeta' || v === 'visa' || v === 'mastercard') return 'TARJETA';
  if (v === 'transferencia' || v === 'transferencia bancaria') return 'TRANSFERENCIA';
  return 'OTRO';
}

async function calcularTotalesVentas(desde: Date, hasta: Date, usuarioId?: number | null) {
  const where: any = {
    fecha_venta: { gte: desde, lte: hasta },
  };
  if (usuarioId) where.usuario_id = usuarioId;

  const ventas = await prisma.venta.findMany({
    where,
    select: { precio_total: true, metodo_pago: true },
  });

  let total_ventas = 0;
  let total_efectivo = 0;
  let total_yape = 0;
  let total_plin = 0;
  let total_tarjeta = 0;
  let total_transferencia = 0;
  let total_otro = 0;

  for (const v of ventas) {
    const amount = Number(v.precio_total);
    total_ventas += amount;
    const mp = normalizeMetodoPago(v.metodo_pago);
    if (mp === 'EFECTIVO') total_efectivo += amount;
    else if (mp === 'YAPE') total_yape += amount;
    else if (mp === 'PLIN') total_plin += amount;
    else if (mp === 'TARJETA') total_tarjeta += amount;
    else if (mp === 'TRANSFERENCIA') total_transferencia += amount;
    else total_otro += amount;
  }

  return {
    total_ventas,
    total_efectivo,
    total_yape,
    total_plin,
    total_tarjeta,
    total_transferencia,
    total_otro,
    cantidad_ventas: ventas.length,
  };
}

export const obtenerEstadoCaja = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).user?.id as number | undefined;

    const abierto = await prisma.cierreCaja.findFirst({
      where: { estado: 'ABIERTO', ...(usuarioId ? { usuario_id: usuarioId } : {}) },
      orderBy: { fecha_apertura: 'desc' },
    });

    return res.json({ abierto });
  } catch (error) {
    console.error('Error obtenerEstadoCaja:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};

export const previsualizarCierre = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).user?.id as number | undefined;

    // Si hay caja abierta, el rango es desde apertura hasta ahora. Si no, hoy.
    const abierto = await prisma.cierreCaja.findFirst({
      where: { estado: 'ABIERTO', ...(usuarioId ? { usuario_id: usuarioId } : {}) },
      orderBy: { fecha_apertura: 'desc' },
    });

    const desde = abierto ? abierto.fecha_apertura : startOfDay(new Date());
    const hasta = new Date();

    const totales = await calcularTotalesVentas(desde, hasta, usuarioId);

    return res.json({
      rango: { desde, hasta },
      cierre_abierto: abierto,
      totales,
      estimado_monto_final: (abierto ? Number(abierto.monto_inicial) : 0) + totales.total_efectivo,
    });
  } catch (error) {
    console.error('Error previsualizarCierre:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};

export const abrirCaja = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).user?.id as number | undefined;
    if (!usuarioId) return res.status(401).json({ error: 'No autenticado' });

    const { monto_inicial = 0, observaciones } = req.body || {};

    const existente = await prisma.cierreCaja.findFirst({
      where: { usuario_id: usuarioId, estado: 'ABIERTO' },
    });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe una caja abierta', cierre: existente });
    }

    const cierre = await prisma.cierreCaja.create({
      data: {
        usuario_id: usuarioId,
        monto_inicial: monto_inicial,
        observaciones,
        estado: 'ABIERTO',
      },
    });

    return res.status(201).json({ cierre });
  } catch (error) {
    console.error('Error abrirCaja:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};

export const cerrarCaja = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).user?.id as number | undefined;
    if (!usuarioId) return res.status(401).json({ error: 'No autenticado' });

    const { monto_final = 0, observaciones } = req.body || {};

    const abierto = await prisma.cierreCaja.findFirst({
      where: { usuario_id: usuarioId, estado: 'ABIERTO' },
      orderBy: { fecha_apertura: 'desc' },
    });

    if (!abierto) {
      return res.status(409).json({ error: 'No hay caja abierta' });
    }

    const desde = abierto.fecha_apertura;
    const hasta = new Date();
    const totales = await calcularTotalesVentas(desde, hasta, usuarioId);

    const cierre = await prisma.cierreCaja.update({
      where: { id: abierto.id },
      data: {
        fecha_cierre: hasta,
        estado: 'CERRADO',
        monto_final,
        total_ventas: totales.total_ventas,
        total_efectivo: totales.total_efectivo,
        total_yape: totales.total_yape,
        total_plin: totales.total_plin,
        total_tarjeta: totales.total_tarjeta,
        total_transferencia: totales.total_transferencia,
        total_otro: totales.total_otro,
        observaciones: observaciones ?? abierto.observaciones,
      },
    });

    return res.json({ cierre, rango: { desde, hasta }, totales });
  } catch (error) {
    console.error('Error cerrarCaja:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};

export const listarCierres = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).user?.id as number | undefined;

    const { desde, hasta, usuario_id } = req.query as any;

    const where: any = {};

    const desdeDate = desde ? new Date(desde) : undefined;
    const hastaDate = hasta ? new Date(hasta) : undefined;
    if (desdeDate || hastaDate) {
      where.fecha_apertura = {
        ...(desdeDate ? { gte: desdeDate } : {}),
        ...(hastaDate ? { lte: hastaDate } : {}),
      };
    }

    // Si viene usuario_id por query (admin) lo usamos; si no, limitamos al usuario actual
    if (usuario_id) where.usuario_id = Number(usuario_id);
    else if (usuarioId) where.usuario_id = usuarioId;

    const cierres = await prisma.cierreCaja.findMany({
      where,
      orderBy: { fecha_apertura: 'desc' },
      include: {
        usuario: { select: { id: true, nombre: true, username: true, rol: true } },
      },
    });

    return res.json({ cierres });
  } catch (error) {
    console.error('Error listarCierres:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};
