import nodemailer from 'nodemailer';
import { Venta, DetalleVenta } from '@prisma/client';

interface VentaConDetalles extends Venta {
  detalles: DetalleVenta[];
  usuarioRel?: {
    nombre: string;
    username: string;
  } | null;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_ENCRYPTION === 'ssl',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendComprobanteEmail = async (
  email: string,
  venta: VentaConDetalles,
  pdfBuffer: Buffer,
  tipo: 'boleta' | 'factura',
  filename?: string
): Promise<void> => {
  try {
    const tipoComprobante = tipo === 'boleta' ? 'Boleta' : 'Factura';
    const numeroComprobante = tipo === 'boleta' 
      ? String(venta.id).padStart(8, '0')
      : `F001-${String(venta.id).padStart(8, '0')}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #6366f1;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 20px;
            border: 1px solid #e5e7eb;
          }
          .info-row {
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
          }
          .label {
            font-weight: bold;
            color: #6366f1;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
          }
          .total {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BAZAR ABEM</h1>
            <p>${tipoComprobante} de Venta</p>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="label">N° de ${tipoComprobante}:</span> ${numeroComprobante}
            </div>
            <div class="info-row">
              <span class="label">Cliente:</span> ${venta.cliente}
            </div>
            <div class="info-row">
              <span class="label">Fecha:</span> ${new Date(venta.fecha_venta).toLocaleString('es-PE', { 
                timeZone: 'America/Lima',
                dateStyle: 'long',
                timeStyle: 'short'
              })}
            </div>
            <div class="info-row">
              <span class="label">Método de Pago:</span> ${venta.metodo_pago}
            </div>
            ${venta.usuarioRel ? `
            <div class="info-row">
              <span class="label">Vendedor:</span> ${venta.usuarioRel.nombre}
            </div>
            ` : ''}
            <div class="total">
              Total: S/ ${Number(venta.precio_total).toFixed(2)}
            </div>
            <p style="text-align: center; margin-top: 20px;">
              Adjunto encontrará su ${tipoComprobante.toLowerCase()} en formato PDF.
            </p>
          </div>
          <div class="footer">
            <p>Gracias por su compra</p>
            <p>BAZAR ABEM - RUC: 10123456789</p>
            <p>Av. Principal 123, Lima, Perú</p>
            <p>Tel: (01) 234-5678</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachmentFilename = filename || `${tipo}_${numeroComprobante}.pdf`;

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: `${tipoComprobante} de Venta N° ${numeroComprobante} - Bazar Abem`,
      html: htmlContent,
      attachments: [
        {
          filename: attachmentFilename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error al enviar el correo electrónico');
  }
};

export const sendBoletaAndFacturaEmail = async (
  email: string,
  venta: VentaConDetalles,
  boletaPDF: Buffer,
  facturaPDF: Buffer
): Promise<void> => {
  try {
    const numeroBoletaDescarga = String(venta.id).padStart(8, '0');
    const numeroFacturaDescarga = `F001-${String(venta.id).padStart(8, '0')}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #1e40af;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 20px;
            border: 1px solid #e5e7eb;
          }
          .info-row {
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
          }
          .label {
            font-weight: bold;
            color: #1e40af;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
          }
          .total {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            text-align: center;
            margin: 20px 0;
          }
          .documents-section {
            background-color: white;
            border: 2px solid #1e40af;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
          }
          .document-item {
            display: inline-block;
            width: 48%;
            margin: 5px 1%;
            padding: 10px;
            background-color: #f0f4ff;
            border-radius: 5px;
            text-align: center;
            border-left: 4px solid #1e40af;
          }
          .document-title {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .document-number {
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BAZAR ABEM</h1>
            <p>Comprobantes de Venta</p>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="label">Cliente:</span> ${venta.cliente}
            </div>
            <div class="info-row">
              <span class="label">Fecha:</span> ${new Date(venta.fecha_venta).toLocaleString('es-PE', { 
                timeZone: 'America/Lima',
                dateStyle: 'long',
                timeStyle: 'short'
              })}
            </div>
            <div class="info-row">
              <span class="label">Método de Pago:</span> ${venta.metodo_pago}
            </div>
            ${venta.usuarioRel ? `
            <div class="info-row">
              <span class="label">Vendedor:</span> ${venta.usuarioRel.nombre}
            </div>
            ` : ''}
            <div class="total">
              Total: S/ ${Number(venta.precio_total).toFixed(2)}
            </div>

            <div class="documents-section">
              <p style="text-align: center; font-weight: bold; color: #1e40af; margin-top: 0;">
                Documentos Adjuntos
              </p>
              <div class="document-item">
                <div class="document-title">📄 Boleta</div>
                <div class="document-number">N° ${numeroBoletaDescarga}</div>
              </div>
              <div class="document-item">
                <div class="document-title">📋 Factura</div>
                <div class="document-number">N° ${numeroFacturaDescarga}</div>
              </div>
            </div>

            <p style="text-align: center; margin-top: 20px; color: #666;">
              Adjuntos encontrará su boleta y factura en formato PDF.
            </p>
          </div>
          <div class="footer">
            <p>Gracias por su compra</p>
            <p>BAZAR ABEM - RUC: 20123456789</p>
            <p>Av. Principal 123, Lima, Perú</p>
            <p>Tel: (01) 1234567</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: `Comprobantes de Venta - Boleta N° ${numeroBoletaDescarga} y Factura N° ${numeroFacturaDescarga} - Bazar Abem`,
      html: htmlContent,
      attachments: [
        {
          filename: `boleta_${numeroBoletaDescarga}.pdf`,
          content: boletaPDF,
          contentType: 'application/pdf',
        },
        {
          filename: `factura_${numeroFacturaDescarga}.pdf`,
          content: facturaPDF,
          contentType: 'application/pdf',
        },
      ],
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error al enviar el correo electrónico');
  }
};

export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
