import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateBoletaPDF, generateFacturaPDF } from '../services/pdfService.js';
import { sendComprobanteEmail, sendBoletaAndFacturaEmail } from '../services/emailService.js';

export const generarPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tipo } = req.query;

    if (!tipo || (tipo !== 'boleta' && tipo !== 'factura')) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de comprobante inválido. Use "boleta" o "factura"',
      });
    }

    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(id) },
      include: {
        detalles: true,
        usuarioRel: {
          select: {
            nombre: true,
            username: true,
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

    let pdfBuffer: Buffer;
    
    if (tipo === 'boleta') {
      pdfBuffer = await generateBoletaPDF(venta);
    } else {
      pdfBuffer = await generateFacturaPDF(venta);
    }

    const numeroComprobante = tipo === 'boleta' 
      ? String(venta.id).padStart(8, '0')
      : `F001-${String(venta.id).padStart(8, '0')}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${tipo}_${numeroComprobante}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error('GenerarPDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF',
    });
  }
};

export const enviarEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, tipo } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido',
      });
    }

    if (!tipo || (tipo !== 'boleta' && tipo !== 'factura')) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de comprobante inválido. Use "boleta" o "factura"',
      });
    }

    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(id) },
      include: {
        detalles: true,
        usuarioRel: {
          select: {
            nombre: true,
            username: true,
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

    let pdfBuffer: Buffer;
    
    if (tipo === 'boleta') {
      pdfBuffer = await generateBoletaPDF(venta);
    } else {
      pdfBuffer = await generateFacturaPDF(venta);
    }

    await sendComprobanteEmail(email, venta, pdfBuffer, tipo);

    res.json({
      success: true,
      message: `Comprobante enviado exitosamente a ${email}`,
    });
  } catch (error) {
    console.error('EnviarEmail error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar email',
    });
  }
};

export const enviarBoletaYFactura = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido',
      });
    }

    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(id) },
      include: {
        detalles: true,
        usuarioRel: {
          select: {
            nombre: true,
            username: true,
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

    // Generar boleta y factura
    const boletaPDF = await generateBoletaPDF(venta);
    const facturaPDF = await generateFacturaPDF(venta);

    // Enviar ambos en un solo email
    await sendBoletaAndFacturaEmail(email, venta, boletaPDF, facturaPDF);

    res.json({
      success: true,
      message: `Boleta y factura enviadas exitosamente a ${email}`,
    });
  } catch (error) {
    console.error('EnviarBoletaYFactura error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar comprobantes',
    });
  }
};
