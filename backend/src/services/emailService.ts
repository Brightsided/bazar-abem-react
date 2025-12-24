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
  // Mejora compatibilidad y reduce errores de entrega/identificación
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  tls: {
    // Evita fallos típicos en algunos proveedores cuando el certificado no coincide
    // (mejor que reventar el envío; si tu provider es estricto puedes ponerlo en true)
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true',
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
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${tipoComprobante} - Bazar Abem</title>
        <style>
          /* Reset básico compatible con clientes de correo */
          body { margin: 0; padding: 0; background: #f3f4f6; }
          table { border-spacing: 0; border-collapse: collapse; }
          img { border: 0; display: block; }
          a { color: inherit; text-decoration: none; }

          .wrapper { width: 100%; background: #f3f4f6; padding: 24px 12px; }
          .card { width: 100%; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 30px rgba(15, 23, 42, .10); }

          .header { background: linear-gradient(90deg, #2563eb, #7c3aed); padding: 20px 22px; }
          .brand { font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: .5px; }
          .subtitle { font-family: Arial, sans-serif; font-size: 13px; color: rgba(255,255,255,.92); margin-top: 4px; }

          .content { padding: 22px; font-family: Arial, sans-serif; color: #0f172a; }

          .pill { display: inline-block; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; background: rgba(37,99,235,.12); color: #1d4ed8; }

          .section-title { font-size: 13px; font-weight: 800; letter-spacing: .6px; color: #334155; margin: 18px 0 10px; text-transform: uppercase; }

          .grid { width: 100%; }
          .row { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
          .label { font-size: 12px; color: #64748b; }
          .value { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }

          .totalBox { margin-top: 16px; border-radius: 14px; background: linear-gradient(180deg, rgba(16,185,129,.10), rgba(16,185,129,.04)); border: 1px solid rgba(16,185,129,.25); padding: 16px; text-align: center; }
          .totalLabel { font-size: 12px; color: #065f46; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }
          .totalValue { font-size: 28px; font-weight: 900; color: #047857; margin-top: 6px; }

          .note { margin-top: 14px; background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; border-radius: 12px; padding: 12px 14px; font-size: 12px; line-height: 1.6; }

          .footer { padding: 18px 22px; background: #0b1220; color: rgba(255,255,255,.82); font-family: Arial, sans-serif; }
          .footerSmall { font-size: 12px; line-height: 1.6; }
          .divider { height: 1px; background: rgba(255,255,255,.10); margin: 12px 0; }

          @media (max-width: 520px) {
            .content { padding: 18px; }
            .header { padding: 18px; }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <table role="presentation" class="card" width="640">
            <tr>
              <td class="header">
                <div class="brand">BAZAR ABEM</div>
                <div class="subtitle">${tipoComprobante} de venta • Documento adjunto en PDF</div>
              </td>
            </tr>
            <tr>
              <td class="content">
                <span class="pill">N° ${numeroComprobante}</span>

                <div class="section-title">Detalle</div>

                <table role="presentation" class="grid" width="100%">
                  <tr>
                    <td style="padding: 6px 0;">
                      <div class="row">
                        <div class="label">Cliente</div>
                        <div class="value">${venta.cliente}</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0;">
                      <div class="row">
                        <div class="label">Fecha / hora</div>
                        <div class="value">${new Date(venta.fecha_venta).toLocaleString('es-PE', {
                          timeZone: 'America/Lima',
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0;">
                      <div class="row">
                        <div class="label">Método de pago</div>
                        <div class="value">${venta.metodo_pago}</div>
                      </div>
                    </td>
                  </tr>
                  ${venta.usuarioRel ? `
                  <tr>
                    <td style="padding: 6px 0;">
                      <div class="row">
                        <div class="label">Vendedor</div>
                        <div class="value">${venta.usuarioRel.nombre}</div>
                      </div>
                    </td>
                  </tr>
                  ` : ''}
                </table>

                <div class="totalBox">
                  <div class="totalLabel">Total</div>
                  <div class="totalValue">S/ ${Number(venta.precio_total).toFixed(2)}</div>
                </div>

                <div class="note">
                  Adjuntamos su ${tipoComprobante.toLowerCase()} en PDF.
                  Si no puede visualizar el archivo, intente descargarlo y abrirlo con un lector de PDF.
                </div>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <div class="footerSmall">
                  <strong>Gracias por su compra.</strong>
                  <div class="divider"></div>
                  BAZAR ABEM • RUC: 20123456789<br />
                  Av. Principal 123, Lima, Perú • Tel: (01) 1234567
                </div>
              </td>
            </tr>
          </table>
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
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Comprobantes - Bazar Abem</title>
        <style>
          body { margin: 0; padding: 0; background: #f3f4f6; }
          table { border-spacing: 0; border-collapse: collapse; }
          img { border: 0; display: block; }
          a { color: inherit; text-decoration: none; }

          .wrapper { width: 100%; background: #f3f4f6; padding: 24px 12px; }
          .card { width: 100%; max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 30px rgba(15, 23, 42, .10); }

          .header { background: linear-gradient(90deg, #0ea5e9, #7c3aed); padding: 22px; }
          .brand { font-family: Arial, sans-serif; font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: .5px; }
          .subtitle { font-family: Arial, sans-serif; font-size: 13px; color: rgba(255,255,255,.92); margin-top: 4px; }

          .content { padding: 22px; font-family: Arial, sans-serif; color: #0f172a; }

          .row { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
          .label { font-size: 12px; color: #64748b; }
          .value { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }

          .totals { margin-top: 14px; border-radius: 14px; background: linear-gradient(180deg, rgba(16,185,129,.10), rgba(16,185,129,.04)); border: 1px solid rgba(16,185,129,.25); padding: 16px; text-align: center; }
          .totalsLabel { font-size: 12px; color: #065f46; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; }
          .totalsValue { font-size: 28px; font-weight: 900; color: #047857; margin-top: 6px; }

          .docs { margin-top: 16px; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; }
          .docsHead { background: #0b1220; color: rgba(255,255,255,.92); padding: 12px 14px; font-size: 12px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; }
          .docsBody { padding: 14px; }

          .docItem { width: 100%; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; margin-top: 10px; }
          .docTop { font-size: 13px; font-weight: 800; color: #0f172a; }
          .docNum { font-size: 12px; color: #64748b; margin-top: 2px; }

          .note { margin-top: 14px; background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; border-radius: 12px; padding: 12px 14px; font-size: 12px; line-height: 1.6; }

          .footer { padding: 18px 22px; background: #0b1220; color: rgba(255,255,255,.82); font-family: Arial, sans-serif; }
          .footerSmall { font-size: 12px; line-height: 1.6; }
          .divider { height: 1px; background: rgba(255,255,255,.10); margin: 12px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <table role="presentation" class="card" width="680">
            <tr>
              <td class="header">
                <div class="brand">BAZAR ABEM</div>
                <div class="subtitle">Comprobantes de venta • Boleta y Factura en PDF</div>
              </td>
            </tr>
            <tr>
              <td class="content">
                <div class="row" style="margin-bottom: 10px;">
                  <div class="label">Cliente</div>
                  <div class="value">${venta.cliente}</div>
                </div>

                <div class="row" style="margin-bottom: 10px;">
                  <div class="label">Fecha / hora</div>
                  <div class="value">${new Date(venta.fecha_venta).toLocaleString('es-PE', {
                    timeZone: 'America/Lima',
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}</div>
                </div>

                <div class="row" style="margin-bottom: 10px;">
                  <div class="label">Método de pago</div>
                  <div class="value">${venta.metodo_pago}</div>
                </div>

                ${venta.usuarioRel ? `
                <div class="row" style="margin-bottom: 10px;">
                  <div class="label">Vendedor</div>
                  <div class="value">${venta.usuarioRel.nombre}</div>
                </div>
                ` : ''}

                <div class="totals">
                  <div class="totalsLabel">Total</div>
                  <div class="totalsValue">S/ ${Number(venta.precio_total).toFixed(2)}</div>
                </div>

                <div class="docs">
                  <div class="docsHead">Documentos adjuntos</div>
                  <div class="docsBody">
                    <div class="docItem">
                      <div class="docTop">📄 Boleta</div>
                      <div class="docNum">N° ${numeroBoletaDescarga}</div>
                    </div>
                    <div class="docItem">
                      <div class="docTop">📋 Factura</div>
                      <div class="docNum">N° ${numeroFacturaDescarga}</div>
                    </div>
                  </div>
                </div>

                <div class="note">
                  Adjuntamos la boleta y la factura en formato PDF.
                  Si no puede visualizarlas desde su correo, intente descargar los archivos.
                </div>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <div class="footerSmall">
                  <strong>Gracias por su compra.</strong>
                  <div class="divider"></div>
                  BAZAR ABEM • RUC: 20123456789<br />
                  Av. Principal 123, Lima, Perú • Tel: (01) 1234567
                </div>
              </td>
            </tr>
          </table>
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
