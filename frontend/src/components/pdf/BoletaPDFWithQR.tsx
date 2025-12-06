import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { VentaDetallada } from '@/types';
import { formatDate } from '@/utils/formatters';

// Estilos optimizados para impresora térmica 80mm
const styles = StyleSheet.create({
  page: {
    width: '80mm',
    padding: '5mm',
    fontFamily: 'Courier',
    fontSize: 9,
    backgroundColor: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '8mm',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: '4mm',
  },
  storeName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: '2mm',
  },
  storeInfo: {
    fontSize: 7,
    color: '#000',
    marginBottom: '1mm',
    lineHeight: 1.2,
  },
  receiptType: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: '3mm',
    marginBottom: '2mm',
    textAlign: 'center',
  },
  receiptNumber: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: '2mm',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: '3mm',
  },
  section: {
    marginBottom: '4mm',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: '2mm',
    textDecoration: 'underline',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '1.5mm',
    fontSize: 8,
  },
  label: {
    fontWeight: 'bold',
    width: '35%',
  },
  value: {
    width: '65%',
    wordBreak: 'break-word',
  },
  itemsTable: {
    marginBottom: '4mm',
  },
  itemHeader: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: '2mm',
    marginBottom: '2mm',
    fontSize: 7,
    fontWeight: 'bold',
  },
  itemCol1: {
    width: '50%',
  },
  itemCol2: {
    width: '15%',
    textAlign: 'right',
  },
  itemCol3: {
    width: '35%',
    textAlign: 'right',
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '2mm',
    fontSize: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    paddingBottom: '1mm',
  },
  itemName: {
    width: '50%',
    fontWeight: 'bold',
  },
  itemQty: {
    width: '15%',
    textAlign: 'right',
  },
  itemPrice: {
    width: '35%',
    textAlign: 'right',
  },
  totalsSection: {
    marginBottom: '4mm',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: '3mm',
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '2mm',
    fontSize: 9,
  },
  totalLabel: {
    width: '60%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totalValue: {
    width: '40%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotal: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '2mm',
    fontSize: 11,
    fontWeight: 'bold',
  },
  grandTotalLabel: {
    width: '50%',
    textAlign: 'right',
  },
  grandTotalValue: {
    width: '50%',
    textAlign: 'right',
  },
  footer: {
    textAlign: 'center',
    marginTop: '4mm',
    fontSize: 7,
    color: '#000',
  },
  footerText: {
    marginBottom: '1mm',
    lineHeight: 1.3,
  },
  qrSection: {
    textAlign: 'center',
    marginTop: '4mm',
    paddingTop: '3mm',
    borderTopWidth: 1,
    borderTopColor: '#000',
    alignItems: 'center',
  },
  qrImage: {
    width: '40mm',
    height: '40mm',
    marginHorizontal: 'auto',
  },
  qrLabel: {
    fontSize: 7,
    marginTop: '2mm',
    color: '#666',
  },
});

interface BoletaPDFWithQRProps {
  venta: VentaDetallada;
  qrDataUrl?: string;
}

export const BoletaPDFWithQR: React.FC<BoletaPDFWithQRProps> = ({ venta, qrDataUrl }) => {
  const totalAmount = Number(venta.precio_total);
  const hasDetailedProducts = venta.detalle_productos && venta.detalle_productos.length > 0;

  return (
    <Document>
      <Page size={[226.77, 841.89]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>BAZAR ABEM</Text>
          <Text style={styles.storeInfo}>RUC: 20123456789</Text>
          <Text style={styles.storeInfo}>Av. Principal 123</Text>
          <Text style={styles.storeInfo}>Lima, Perú</Text>
          <Text style={styles.storeInfo}>Tel: (01) 1234567</Text>
        </View>

        {/* Receipt Type */}
        <View style={styles.receiptType}>
          <Text>BOLETA DE VENTA</Text>
        </View>
        <View style={styles.receiptNumber}>
          <Text>Nº {String(venta.id).padStart(8, '0')}</Text>
        </View>

        <View style={styles.divider} />

        {/* Customer Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{venta.cliente}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{formatDate(venta.fecha_venta)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pago:</Text>
            <Text style={styles.value}>{venta.metodo_pago}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items */}
        <View style={styles.itemsTable}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemCol1}>Descripción</Text>
            <Text style={styles.itemCol2}>Cant.</Text>
            <Text style={styles.itemCol3}>Total</Text>
          </View>

          {hasDetailedProducts ? (
            venta.detalle_productos.map((producto, idx) => {
              const itemTotal = producto.cantidad * Number(producto.precio);
              const nombreProducto = producto.nombre || producto.producto || 'Producto';
              return (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{nombreProducto}</Text>
                  <Text style={styles.itemQty}>{producto.cantidad}</Text>
                  <Text style={styles.itemPrice}>S/ {itemTotal.toFixed(2)}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{venta.productos}</Text>
              <Text style={styles.itemQty}>1</Text>
              <Text style={styles.itemPrice}>S/ {totalAmount.toFixed(2)}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>S/ {totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Gracias por su compra</Text>
          <Text style={styles.footerText}>Conserve su boleta</Text>
          <Text style={styles.footerText}>para garantía</Text>
        </View>

        {/* QR Section */}
        <View style={styles.qrSection}>
          {qrDataUrl ? (
            <>
              <Image src={qrDataUrl} style={styles.qrImage} />
              <Text style={styles.qrLabel}>Boleta #{String(venta.id).padStart(8, '0')}</Text>
            </>
          ) : (
            <Text style={styles.qrLabel}>QR Code</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};
