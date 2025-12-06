import { VentaDetallada } from '@/types';
import { formatDate } from './formatters';

export const generateBoletaHTML = (venta: VentaDetallada, qrDataUrl: string): string => {
  const totalAmount = Number(venta.precio_total);
  const hasDetailedProducts = venta.detalle_productos && venta.detalle_productos.length > 0;

  const productsHTML = hasDetailedProducts
    ? venta.detalle_productos
        .map((producto) => {
          const itemTotal = producto.cantidad * Number(producto.precio);
          const nombreProducto = producto.nombre || producto.producto || 'Producto';
          return `
        <tr>
          <td style="text-align: left; padding: 4px 0; font-size: 8pt; border-bottom: 0.5pt solid #ddd;">${nombreProducto}</td>
          <td style="text-align: right; padding: 4px 0; font-size: 8pt; border-bottom: 0.5pt solid #ddd;">${producto.cantidad}</td>
          <td style="text-align: right; padding: 4px 0; font-size: 8pt; border-bottom: 0.5pt solid #ddd;">S/ ${itemTotal.toFixed(2)}</td>
        </tr>
      `;
        })
        .join('')
    : `
      <tr>
        <td style="text-align: left; padding: 4px 0; font-size: 8pt; border-bottom: 0.5pt solid #ddd;">${venta.productos}</td>
        <td style="text-align: right; padding: 4px 0; font-size: 8pt; border-bottom: 0.5pt solid #ddd;">1</td>
        <td style="text-align: right; padding: 4px 0; font-size: 8pt; border-bottom: 0.5pt solid #ddd;">S/ ${totalAmount.toFixed(2)}</td>
      </tr>
    `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Boleta #${String(venta.id).padStart(8, '0')}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 9pt;
          line-height: 1.2;
          width: 80mm;
          margin: 0 auto;
          padding: 5mm;
          background: white;
          color: black;
        }
        
        @media print {
          body {
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 8mm;
          border-bottom: 1pt solid black;
          padding-bottom: 4mm;
        }
        
        .store-name {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 2mm;
        }
        
        .store-info {
          font-size: 7pt;
          margin-bottom: 1mm;
          line-height: 1.2;
        }
        
        .receipt-type {
          font-size: 10pt;
          font-weight: bold;
          text-align: center;
          margin: 3mm 0 2mm 0;
        }
        
        .receipt-number {
          font-size: 9pt;
          text-align: center;
          margin-bottom: 2mm;
        }
        
        .divider {
          border-bottom: 1pt solid black;
          margin: 3mm 0;
        }
        
        .section {
          margin-bottom: 4mm;
        }
        
        .row {
          display: flex;
          margin-bottom: 1.5mm;
          font-size: 8pt;
        }
        
        .label {
          font-weight: bold;
          width: 35%;
        }
        
        .value {
          width: 65%;
          word-break: break-word;
        }
        
        .items-table {
          width: 100%;
          margin-bottom: 4mm;
          border-collapse: collapse;
        }
        
        .items-table thead {
          border-bottom: 1pt solid black;
          font-size: 7pt;
          font-weight: bold;
        }
        
        .items-table th {
          padding: 2mm 0;
          text-align: left;
        }
        
        .items-table th:nth-child(2),
        .items-table th:nth-child(3) {
          text-align: right;
        }
        
        .items-table tbody tr {
          border-bottom: 0.5pt solid #ddd;
        }
        
        .items-table td {
          padding: 2mm 0;
          font-size: 8pt;
        }
        
        .items-table td:nth-child(2),
        .items-table td:nth-child(3) {
          text-align: right;
        }
        
        .totals-section {
          margin-bottom: 4mm;
          border-top: 1pt solid black;
          border-bottom: 1pt solid black;
          padding: 3mm 0;
        }
        
        .grand-total {
          display: flex;
          font-size: 11pt;
          font-weight: bold;
        }
        
        .grand-total-label {
          width: 50%;
          text-align: right;
        }
        
        .grand-total-value {
          width: 50%;
          text-align: right;
        }
        
        .footer {
          text-align: center;
          margin-top: 4mm;
          font-size: 7pt;
          color: black;
        }
        
        .footer-text {
          margin-bottom: 1mm;
          line-height: 1.3;
        }
        
        .qr-section {
          text-align: center;
          margin-top: 4mm;
          padding-top: 3mm;
          border-top: 1pt solid black;
        }
        
        .qr-image {
          width: 40mm;
          height: 40mm;
          margin: 0 auto;
        }
        
        .qr-label {
          font-size: 7pt;
          margin-top: 2mm;
          color: #666;
        }
        
        .print-button {
          margin-top: 10mm;
          text-align: center;
        }
        
        .print-button button {
          padding: 8px 16px;
          font-size: 14px;
          background-color: #ff6b35;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .print-button button:hover {
          background-color: #e55a2b;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-name">BAZAR ABEM</div>
        <div class="store-info">RUC: 20123456789</div>
        <div class="store-info">Av. Principal 123</div>
        <div class="store-info">Lima, Perú</div>
        <div class="store-info">Tel: (01) 1234567</div>
      </div>
      
      <div class="receipt-type">BOLETA DE VENTA</div>
      <div class="receipt-number">Nº ${String(venta.id).padStart(8, '0')}</div>
      
      <div class="divider"></div>
      
      <div class="section">
        <div class="row">
          <div class="label">Cliente:</div>
          <div class="value">${venta.cliente}</div>
        </div>
        <div class="row">
          <div class="label">Fecha:</div>
          <div class="value">${formatDate(venta.fecha_venta)}</div>
        </div>
        <div class="row">
          <div class="label">Pago:</div>
          <div class="value">${venta.metodo_pago}</div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 50%;">Descripción</th>
            <th style="width: 15%;">Cant.</th>
            <th style="width: 35%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${productsHTML}
        </tbody>
      </table>
      
      <div class="divider"></div>
      
      <div class="totals-section">
        <div class="grand-total">
          <div class="grand-total-label">TOTAL:</div>
          <div class="grand-total-value">S/ ${totalAmount.toFixed(2)}</div>
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-text">Gracias por su compra</div>
        <div class="footer-text">Conserve su boleta</div>
        <div class="footer-text">para garantía</div>
      </div>
      
      <div class="qr-section">
        <img src="${qrDataUrl}" class="qr-image" alt="QR Code">
        <div class="qr-label">Boleta #${String(venta.id).padStart(8, '0')}</div>
      </div>
      
      <div class="print-button no-print">
        <button onclick="window.print()">Imprimir Boleta</button>
      </div>
      
      <script>
        // Auto-print si se abre desde el modal
        if (window.location.hash === '#autoprint') {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
};

export const printBoleta = (venta: VentaDetallada, qrDataUrl: string) => {
  const html = generateBoletaHTML(venta, qrDataUrl);
  const printWindow = window.open('', '', 'width=800,height=600');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Esperar a que se carguen las imágenes antes de imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
};
