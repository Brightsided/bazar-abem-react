import PDFDocument from 'pdfkit';
import { Venta, DetalleVenta } from '@prisma/client';
import { generateQRCode } from './qrService.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para obtener el logo PNG
const getLogoPNG = (): Buffer => {
  try {
    const logoPath = join(__dirname, '../../..', 'frontend/src/assets/images/Logo.png');
    const logoBuffer = readFileSync(logoPath);
    return logoBuffer;
  } catch (error) {
    console.error('Error loading logo:', error);
    return Buffer.alloc(0);
  }
};

interface VentaConDetalles extends Venta {
  detalles: DetalleVenta[];
  usuarioRel?: {
    nombre: string;
    username: string;
  } | null;
}

export const generateBoletaPDF = async (venta: VentaConDetalles): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tamaño de página para impresora térmica 80mm
      // Importante: usar altura dinámica para evitar espacios enormes y layouts "rotos" en visores PDF (como Gmail)
      const pageWidth = 226.77; // 80mm en puntos
      const margin = 14.17; // 5mm en puntos

      // Estimar alto en base a contenido (header + info + items + total + footer + QR)
      // Nota: el alto real se auto-recorta al final usando buffered pages.
      const baseHeight = 320;
      const perItemHeight = 16;
      const qrBlockHeight = 150;
      const estimatedHeight = Math.max(
        520,
        baseHeight + venta.detalles.length * perItemHeight + qrBlockHeight
      );

      const doc = new PDFDocument({
        size: [pageWidth, estimatedHeight],
        margin,
        bufferPages: true,
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageContentWidth = pageWidth - margin * 2;

      // Header
      doc.fontSize(14).font('Courier-Bold').text('BAZAR ABEM', { align: 'center' });
      doc.fontSize(7).font('Courier').text('RUC: 20123456789', { align: 'center' });
      doc.fontSize(7).text('Av. Principal 123', { align: 'center' });
      doc.fontSize(7).text('Lima, Perú', { align: 'center' });
      doc.fontSize(7).text('Tel: (01) 1234567', { align: 'center' });
      
      doc.moveTo(margin, doc.y + 2).lineTo(pageWidth - margin, doc.y + 2).stroke();
      doc.moveDown(0.5);

      // Tipo de comprobante
      doc.fontSize(10).font('Courier-Bold').text('BOLETA DE VENTA', { align: 'center' });
      doc.fontSize(9).font('Courier').text(`Nº ${String(venta.id).padStart(8, '0')}`, { align: 'center' });
      
      doc.moveTo(margin, doc.y + 2).lineTo(pageWidth - margin, doc.y + 2).stroke();
      doc.moveDown(0.5);

      // Información del cliente
      doc.fontSize(8).font('Courier');
      doc.text(`Cliente: ${venta.cliente}`);
      doc.text(`Fecha: ${new Date(venta.fecha_venta).toLocaleString('es-PE', { 
        timeZone: 'America/Lima',
        dateStyle: 'short',
        timeStyle: 'short'
      })}`);
      doc.text(`Pago: ${venta.metodo_pago}`);
      
      doc.moveTo(margin, doc.y + 2).lineTo(pageWidth - margin, doc.y + 2).stroke();
      doc.moveDown(0.5);

      // Tabla de productos - Headers
      doc.fontSize(7).font('Courier-Bold');
      const colDescX = margin;
      const colCantX = margin + pageContentWidth * 0.62;
      const colTotalX = margin + pageContentWidth * 0.78;

      const headerY = doc.y;
      doc.text('Descripción', colDescX, headerY, { width: pageContentWidth * 0.60 });
      doc.text('Cant.', colCantX, headerY, { width: pageContentWidth * 0.16, align: 'right' });
      doc.text('Total', colTotalX, headerY, { width: pageContentWidth * 0.22, align: 'right' });

      doc.y = headerY + 10;

      doc.moveTo(margin, doc.y + 2).lineTo(pageWidth - margin, doc.y + 2).stroke();
      doc.moveDown(0.5);

      // Items
      doc.font('Courier').fontSize(8);
      for (const detalle of venta.detalles) {
        const subtotal = Number(detalle.precio) * detalle.cantidad;
        const nombreProducto = detalle.producto || 'Producto';

        const lineY = doc.y;
        // 2 líneas máx para evitar desbordes en boleta térmica
        const wrapped = doc.heightOfString(nombreProducto, { width: pageContentWidth * 0.60 }) > 10;

        doc.text(nombreProducto, colDescX, lineY, { width: pageContentWidth * 0.60 });
        doc.text(detalle.cantidad.toString(), colCantX, lineY, { width: pageContentWidth * 0.16, align: 'right' });
        doc.text(`S/ ${subtotal.toFixed(2)}`, colTotalX, lineY, { width: pageContentWidth * 0.22, align: 'right' });

        // Si el nombre se envuelve, damos más espacio
        doc.y = lineY + (wrapped ? 18 : 12);
      }

      doc.moveTo(margin, doc.y + 2).lineTo(pageWidth - margin, doc.y + 2).stroke();
      doc.moveDown(0.5);

      // Total (una sola línea, sin saltos ni columnas que provoquen "TOTA" / "L:")
      doc.fontSize(11).font('Courier-Bold');
      const totalText = `TOTAL: S/ ${Number(venta.precio_total).toFixed(2)}`;
      doc.text(totalText, margin, doc.y, { width: pageContentWidth, align: 'right' });

      doc.moveDown(0.8);

      // Footer (forzar centrado y bloquear cualquier desplazamiento)
      doc.fontSize(7).font('Courier');
      doc.text('Gracias por su compra', margin, doc.y, { width: pageContentWidth, align: 'center' });
      doc.text('Conserve su boleta', margin, doc.y, { width: pageContentWidth, align: 'center' });
      doc.text('para garantía', margin, doc.y, { width: pageContentWidth, align: 'center' });

      doc.moveDown(0.6);
      doc.moveTo(margin, doc.y).lineTo(pageWidth - margin, doc.y).stroke();
      doc.moveDown(0.6);

      // QR Code
      const qrData = `BOLETA#${String(venta.id).padStart(8, '0')}|${venta.cliente}|S/ ${Number(venta.precio_total).toFixed(2)}|${new Date(venta.fecha_venta).toLocaleDateString('es-PE')}`;
      const qrImage = await generateQRCode(qrData);

      // Centrar QR (más pequeño para boleta térmica)
      const qrSize = 78;
      const qrX = (pageWidth - qrSize) / 2;
      doc.image(qrImage, qrX, doc.y, { width: qrSize });
      doc.moveDown(0.3);

      doc.fontSize(7).font('Courier').text(`Boleta #${String(venta.id).padStart(8, '0')}`, margin, doc.y, {
        width: pageContentWidth,
        align: 'center',
      });

      // Auto-recortar la página al contenido real para que el PDF no quede con altura gigante.
      const usedHeight = Math.min(Math.max(doc.y + margin, 520), estimatedHeight);
      doc.flushPages();
      doc.page.height = usedHeight;

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateFacturaPDF = async (venta: VentaConDetalles): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);

      // ===== HEADER CON LOGO Y DATOS EMPRESA =====
      const headerY = margin;
      
      // Obtener e insertar logo PNG
      try {
        const logoPNG = getLogoPNG();
        if (logoPNG.length > 0) {
          doc.image(logoPNG, margin, headerY, { width: 80, height: 80 });
        }
      } catch (logoError) {
        console.error('Error inserting logo:', logoError);
      }
      
      // Datos de la empresa
      doc.fontSize(9).font('Helvetica');
      doc.text('RUC: 20123456789', margin + 100, headerY);
      doc.text('Av. Principal 123', margin + 100, headerY + 15);
      doc.text('Lima, Perú', margin + 100, headerY + 30);
      doc.text('Tel: (01) 1234567', margin + 100, headerY + 45);

      // Línea separadora
      doc.moveTo(margin, headerY + 85).lineTo(pageWidth - margin, headerY + 85).stroke();

      // ===== TÍTULO Y NÚMERO DE FACTURA =====
      let currentY = headerY + 100;
      
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e40af').text('FACTURA ELECTRÓNICA DE VENTA', margin, currentY, { align: 'center' });
      doc.fillColor('#000000');
      
      currentY += 25;
      doc.fontSize(11).font('Helvetica-Bold').text(`No. FES-${String(venta.id).padStart(5, '0')}`, margin, currentY, { align: 'center' });
      
      // Línea separadora
      currentY += 20;
      doc.moveTo(margin, currentY).lineTo(pageWidth - margin, currentY).stroke();

      // ===== INFORMACIÓN DEL CLIENTE =====
      currentY += 15;
      
      // Sección Cliente - Fila 1
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e40af').text('CLIENTE:', margin, currentY);
      doc.fillColor('#000000').font('Helvetica').fontSize(9);
      doc.text(venta.cliente, margin + 70, currentY);
      
      // Columna derecha - Fila 1
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e40af').text('FECHA EMISIÓN:', pageWidth - margin - 200, currentY);
      doc.fillColor('#000000').font('Helvetica').fontSize(9);
      const fechaEmision = new Date(venta.fecha_venta).toLocaleDateString('es-PE', { 
        timeZone: 'America/Lima'
      });
      doc.text(fechaEmision, pageWidth - margin - 80, currentY);

      currentY += 15;
      
      // Sección Vendedor - Fila 2
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e40af').text('VENDEDOR:', margin, currentY);
      doc.fillColor('#000000').font('Helvetica').fontSize(9);
      doc.text(venta.usuarioRel?.nombre || 'N/A', margin + 70, currentY);

      // Columna derecha - Fila 2
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e40af').text('FORMA DE PAGO:', pageWidth - margin - 200, currentY);
      doc.fillColor('#000000').font('Helvetica').fontSize(9);
      doc.text(venta.metodo_pago, pageWidth - margin - 80, currentY);

      // Línea separadora
      currentY += 25;
      doc.moveTo(margin, currentY).lineTo(pageWidth - margin, currentY).stroke();

      // ===== TABLA DE PRODUCTOS =====
      currentY += 15;

      // Headers de tabla - Ajustados sin DCTO
      const col1X = margin;
      const col2X = margin + 300;
      const col3X = margin + 360;
      const col4X = margin + 450;

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
      doc.rect(margin, currentY, contentWidth, 20).fill('#1e40af');
      
      doc.fillColor('#ffffff').text('DESCRIPCIÓN', col1X + 5, currentY + 4);
      doc.text('V.R. UNI', col2X + 5, currentY + 4);
      doc.text('CANT.', col3X + 5, currentY + 4);
      doc.text('TOTAL', col4X + 5, currentY + 4);

      currentY += 25;
      doc.fillColor('#000000');

      // Items
      doc.font('Helvetica').fontSize(8);
      let itemY = currentY;
      
      for (const detalle of venta.detalles) {
        const subtotal = Number(detalle.precio) * detalle.cantidad;
        
        doc.text(detalle.producto || 'Producto', col1X + 5, itemY, { width: 280 });
        doc.text(`S/ ${Number(detalle.precio).toFixed(2)}`, col2X + 5, itemY, { align: 'right', width: 50 });
        doc.text(detalle.cantidad.toString(), col3X + 5, itemY, { align: 'right', width: 50 });
        doc.text(`S/ ${subtotal.toFixed(2)}`, col4X + 5, itemY, { align: 'right', width: 50 });
        
        itemY += 15;
      }

      // Línea separadora
      doc.moveTo(margin, itemY).lineTo(pageWidth - margin, itemY).stroke();
      itemY += 10;

      // ===== TOTALES =====
      const subtotalAmount = Number(venta.precio_total) / 1.18;
      const igvAmount = Number(venta.precio_total) - subtotalAmount;

      doc.fontSize(9).font('Helvetica');
      
      // Subtotal
      doc.text('Subtotal:', col3X, itemY);
      doc.text(`S/ ${subtotalAmount.toFixed(2)}`, col4X + 5, itemY, { align: 'right', width: 50 });
      
      itemY += 15;
      doc.text('IGV (18%):', col3X, itemY);
      doc.text(`S/ ${igvAmount.toFixed(2)}`, col4X + 5, itemY, { align: 'right', width: 50 });
      
      itemY += 15;
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af');
      doc.text('TOTAL:', col3X, itemY);
      doc.fillColor('#000000').text(`S/ ${Number(venta.precio_total).toFixed(2)}`, col4X + 5, itemY, { align: 'right', width: 50 });

      // ===== QR CODE =====
      itemY += 30;
      const qrData = `Factura N° FES-${String(venta.id).padStart(5, '0')}\nFecha: ${fechaEmision}\nTotal: S/ ${Number(venta.precio_total).toFixed(2)}`;
      const qrImage = await generateQRCode(qrData);
      
      const qrSize = 80;
      const qrX = (pageWidth - qrSize) / 2;
      doc.image(qrImage, qrX, itemY, { width: qrSize });

      // ===== FOOTER =====
      doc.fontSize(7).font('Helvetica').fillColor('#666666');
      doc.text(
        'Esta factura por su sola suscripción tiene efectos tributarios. Conserve el original para su archivo.',
        margin,
        pageHeight - 40,
        { align: 'center', width: contentWidth }
      );
      doc.text(
        'Representación impresa de la Factura Electrónica',
        margin,
        pageHeight - 25,
        { align: 'center', width: contentWidth }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
