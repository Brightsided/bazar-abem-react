import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  generarXmlFactura,
  firmarXml,
  enviarASunatBeta,
  obtenerEstadoComprobante,
  reenviarComprobante,
  listarComprobantes,
  generarHashCpe,
} from '../services/sunatService.js';

/**
 * Controlador para Facturación Electrónica SUNAT
 * Gestiona la generación, firma y envío de comprobantes electrónicos
 */

/**
 * Genera un comprobante electrónico para una venta
 * POST /api/facturacion/generar
 */
export const generarComprobante = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId, tipo = 'FACTURA' } = req.body;

    if (!ventaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de venta requerido',
      });
    }

    // Verificar que la venta existe
    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: {
        detalles: true,
        clienteRel: true,
      },
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada',
      });
    }

    // Verificar si ya existe un comprobante para esta venta
    const comprobanteExistente = await prisma.comprobanteElectronico.findUnique({
      where: { venta_id: ventaId },
    });

    if (comprobanteExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un comprobante para esta venta',
      });
    }

    // Generar XML
    const xmlSinFirma = await generarXmlFactura(ventaId);
    const hashCpe = generarHashCpe(xmlSinFirma);

    // Generar serie y número
    const serie = tipo === 'FACTURA' ? 'F001' : 'B001';
    const numero = ventaId; // Simplificado para BETA

    // Guardar comprobante sin firmar
    const comprobante = await prisma.comprobanteElectronico.create({
      data: {
        venta_id: ventaId,
        tipo,
        serie,
        numero,
        xmlSinFirma,
        hashCpe,
        estado: 'PENDIENTE',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Comprobante generado exitosamente',
      comprobante: {
        id: comprobante.id,
        ventaId: comprobante.venta_id,
        tipo: comprobante.tipo,
        serie: comprobante.serie,
        numero: comprobante.numero,
        estado: comprobante.estado,
        hashCpe: comprobante.hashCpe,
      },
    });
  } catch (error) {
    console.error('Error generando comprobante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar comprobante',
      error: String(error),
    });
  }
};

/**
 * Firma un comprobante electrónico
 * POST /api/facturacion/firmar/:ventaId
 */
export const firmarComprobante = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;

    if (!ventaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de venta requerido',
      });
    }

    // Obtener comprobante
    const comprobante = await prisma.comprobanteElectronico.findUnique({
      where: { venta_id: parseInt(ventaId) },
    });

    if (!comprobante) {
      return res.status(404).json({
        success: false,
        message: 'Comprobante no encontrado',
      });
    }

    if (comprobante.estado !== 'PENDIENTE') {
      return res.status(400).json({
        success: false,
        message: `No se puede firmar un comprobante en estado ${comprobante.estado}`,
      });
    }

    // Firmar XML
    const xmlFirmado = await firmarXml(comprobante.xmlSinFirma);

    // Actualizar comprobante
    const comprobanteActualizado = await prisma.comprobanteElectronico.update({
      where: { venta_id: parseInt(ventaId) },
      data: {
        xmlFirmado,
        estado: 'FIRMADO',
      },
    });

    res.json({
      success: true,
      message: 'Comprobante firmado exitosamente',
      comprobante: {
        id: comprobanteActualizado.id,
        ventaId: comprobanteActualizado.venta_id,
        estado: comprobanteActualizado.estado,
      },
    });
  } catch (error) {
    console.error('Error firmando comprobante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al firmar comprobante',
      error: String(error),
    });
  }
};

/**
 * Envía un comprobante a SUNAT
 * POST /api/facturacion/enviar/:ventaId
 */
export const enviarComprobante = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;

    if (!ventaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de venta requerido',
      });
    }

    // Obtener comprobante
    const comprobante = await prisma.comprobanteElectronico.findUnique({
      where: { venta_id: parseInt(ventaId) },
    });

    if (!comprobante) {
      return res.status(404).json({
        success: false,
        message: 'Comprobante no encontrado',
      });
    }

    if (!comprobante.xmlFirmado) {
      return res.status(400).json({
        success: false,
        message: 'El comprobante debe estar firmado antes de enviar',
      });
    }

    // Enviar a SUNAT
    const resultado = await enviarASunatBeta(parseInt(ventaId), comprobante.xmlFirmado);

    if (resultado.success) {
      res.json({
        success: true,
        message: 'Comprobante enviado a SUNAT exitosamente',
        resultado,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Error al enviar comprobante a SUNAT',
        error: resultado.mensajeSunat,
      });
    }
  } catch (error) {
    console.error('Error enviando comprobante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar comprobante',
      error: String(error),
    });
  }
};

/**
 * Obtiene el estado de un comprobante
 * GET /api/facturacion/estado/:ventaId
 */
export const obtenerEstado = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;

    if (!ventaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de venta requerido',
      });
    }

    const resultado = await obtenerEstadoComprobante(parseInt(ventaId));

    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(404).json(resultado);
    }
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado',
      error: String(error),
    });
  }
};

/**
 * Reintenta enviar un comprobante
 * POST /api/facturacion/reenviar/:ventaId
 */
export const reenviar = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;

    if (!ventaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de venta requerido',
      });
    }

    const resultado = await reenviarComprobante(parseInt(ventaId));

    if (resultado.success) {
      res.json({
        success: true,
        message: 'Comprobante reenviado exitosamente',
        resultado,
      });
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    console.error('Error reenviando:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reenviar comprobante',
      error: String(error),
    });
  }
};

/**
 * Lista comprobantes electrónicos
 * GET /api/facturacion/listar
 */
export const listar = async (req: AuthRequest, res: Response) => {
  try {
    const { estado, ventaId } = req.query;

    const filtros: any = {};

    if (estado) {
      filtros.estado = estado;
    }

    if (ventaId) {
      filtros.ventaId = parseInt(ventaId as string);
    }

    const resultado = await listarComprobantes(filtros);

    res.json(resultado);
  } catch (error) {
    console.error('Error listando comprobantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar comprobantes',
      error: String(error),
    });
  }
};

/**
 * Obtiene el XML de un comprobante
 * GET /api/facturacion/xml/:ventaId
 */
export const obtenerXml = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;

    if (!ventaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de venta requerido',
      });
    }

    const comprobante = await prisma.comprobanteElectronico.findUnique({
      where: { venta_id: parseInt(ventaId) },
    });

    if (!comprobante) {
      return res.status(404).json({
        success: false,
        message: 'Comprobante no encontrado',
      });
    }

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="comprobante-${ventaId}.xml"`);
    res.send(comprobante.xmlFirmado || comprobante.xmlSinFirma);
  } catch (error) {
    console.error('Error obteniendo XML:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener XML',
      error: String(error),
    });
  }
};

/**
 * Obtiene el CDR de un comprobante
 * GET /api/facturacion/cdr/:ventaId
 */
export const obtenerCdr = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;

    if (!ventaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de venta requerido',
      });
    }

    const comprobante = await prisma.comprobanteElectronico.findUnique({
      where: { venta_id: parseInt(ventaId) },
    });

    if (!comprobante) {
      return res.status(404).json({
        success: false,
        message: 'Comprobante no encontrado',
      });
    }

    if (!comprobante.cdrXml) {
      return res.status(404).json({
        success: false,
        message: 'CDR no disponible',
      });
    }

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="cdr-${ventaId}.xml"`);
    res.send(comprobante.cdrXml);
  } catch (error) {
    console.error('Error obteniendo CDR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener CDR',
      error: String(error),
    });
  }
};

/**
 * Obtiene detalles completos de un comprobante
 * GET /api/facturacion/detalles/:ventaId
 */
export const obtenerDetalles = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;

    if (!ventaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de venta requerido',
      });
    }

    const comprobante = await prisma.comprobanteElectronico.findUnique({
      where: { venta_id: parseInt(ventaId) },
      include: {
        venta: {
          include: {
            detalles: true,
            clienteRel: true,
            usuarioRel: {
              select: {
                id: true,
                nombre: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!comprobante) {
      return res.status(404).json({
        success: false,
        message: 'Comprobante no encontrado',
      });
    }

    res.json({
      success: true,
      comprobante,
    });
  } catch (error) {
    console.error('Error obteniendo detalles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles',
      error: String(error),
    });
  }
};

/**
 * Flujo completo: Generar, Firmar y Enviar
 * POST /api/facturacion/procesar/:ventaId
 */
export const procesarComprobante = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;
    const { tipo = 'FACTURA' } = req.body;

    if (!ventaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de venta requerido',
      });
    }

    // Paso 1: Generar
    const xmlSinFirma = await generarXmlFactura(parseInt(ventaId));
    const hashCpe = generarHashCpe(xmlSinFirma);

    // Paso 2: Firmar
    const xmlFirmado = await firmarXml(xmlSinFirma);

    // Paso 3: Guardar y enviar
    const serie = tipo === 'FACTURA' ? 'F001' : 'B001';
    const numero = parseInt(ventaId);

    let comprobante = await prisma.comprobanteElectronico.findUnique({
      where: { venta_id: parseInt(ventaId) },
    });

    if (!comprobante) {
      comprobante = await prisma.comprobanteElectronico.create({
        data: {
          venta_id: parseInt(ventaId),
          tipo,
          serie,
          numero,
          xmlSinFirma,
          xmlFirmado,
          hashCpe,
          estado: 'FIRMADO',
        },
      });
    } else {
      comprobante = await prisma.comprobanteElectronico.update({
        where: { venta_id: parseInt(ventaId) },
        data: {
          xmlSinFirma,
          xmlFirmado,
          hashCpe,
          estado: 'FIRMADO',
        },
      });
    }

    // Paso 4: Enviar a SUNAT
    const resultado = await enviarASunatBeta(parseInt(ventaId), xmlFirmado);

    res.json({
      success: resultado.success,
      message: resultado.success
        ? 'Comprobante procesado y enviado exitosamente'
        : 'Error al procesar comprobante',
      comprobante: {
        id: comprobante.id,
        ventaId: comprobante.venta_id,
        tipo: comprobante.tipo,
        serie: comprobante.serie,
        numero: comprobante.numero,
        estado: comprobante.estado,
        codigoSunat: resultado.codigoSunat,
        mensajeSunat: resultado.mensajeSunat,
      },
    });
  } catch (error) {
    console.error('Error procesando comprobante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar comprobante',
      error: String(error),
    });
  }
};
