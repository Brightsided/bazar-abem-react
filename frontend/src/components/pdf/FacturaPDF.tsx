import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { VentaDetallada } from '@/types';
import { formatDate } from '@/utils/formatters';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#1f2937',
  },
  logoSection: {
    width: '30%',
  },
  companyInfo: {
    width: '70%',
    paddingLeft: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  titleBox: {
    width: '45%',
  },
  titleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#1f2937',
    padding: 8,
    textAlign: 'center',
    marginBottom: 5,
  },
  titleContent: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
  },
  titleSubcontent: {
    fontSize: 10,
    textAlign: 'center',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  infoBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
  },
  infoBoxTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 9,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: '40%',
  },
  infoValue: {
    width: '60%',
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    fontSize: 9,
    marginBottom: 5,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 5,
    fontSize: 9,
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  col1: {
    width: '50%',
  },
  col2: {
    width: '12%',
    textAlign: 'right',
  },
  col3: {
    width: '19%',
    textAlign: 'right',
  },
  col4: {
    width: '19%',
    textAlign: 'right',
  },
  summarySection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  summaryBox: {
    width: '40%',
  },
  summaryRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 10,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1f2937',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
  footerText: {
    marginBottom: 3,
  },
  notesSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderLeftWidth: 3,
    borderLeftColor: '#1f2937',
    fontSize: 9,
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

interface FacturaPDFProps {
  venta: VentaDetallada;
}

export const FacturaPDF: React.FC<FacturaPDFProps> = ({ venta }) => {
  const subtotal = Number(venta.precio_total) / 1.18;
  const igv = Number(venta.precio_total) - subtotal;
  const total = Number(venta.precio_total);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1f2937' }}>BAZAR</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1f2937' }}>ABEM</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>BAZAR ABEM</Text>
            <Text style={styles.companyDetails}>RUC: 20123456789</Text>
            <Text style={styles.companyDetails}>Av. Principal 123, Lima, Perú</Text>
            <Text style={styles.companyDetails}>Tel: (01) 1234567</Text>
            <Text style={styles.companyDetails}>Email: info@bazarabem.com</Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleBox}>
            <View style={styles.titleLabel}>FACTURA ELECTRÓNICA</View>
            <Text style={styles.titleContent}>F001-{String(venta.id).padStart(8, '0')}</Text>
            <Text style={styles.titleSubcontent}>Representación Impresa</Text>
          </View>
          <View style={styles.titleBox}>
            <View style={styles.titleLabel}>FECHA DE EMISIÓN</View>
            <Text style={styles.titleContent}>{formatDate(venta.fecha_venta)}</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>DATOS DEL CLIENTE</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Razón Social:</Text>
              <Text style={styles.infoValue}>{venta.cliente}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>RUC/DNI:</Text>
              <Text style={styles.infoValue}>-</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>-</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>DATOS DE LA FACTURA</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Método de Pago:</Text>
              <Text style={styles.infoValue}>{venta.metodo_pago}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Moneda:</Text>
              <Text style={styles.infoValue}>Soles (S/)</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vendedor:</Text>
              <Text style={styles.infoValue}>{venta.usuario?.nombre || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Descripción</Text>
            <Text style={styles.col2}>Cant.</Text>
            <Text style={styles.col3}>Precio Unit.</Text>
            <Text style={styles.col4}>Importe</Text>
          </View>

          {venta.detalle_productos && venta.detalle_productos.length > 0 ? (
            venta.detalle_productos.map((producto, idx) => {
              const itemTotal = producto.cantidad * Number(producto.precio);
              const isAlternate = idx % 2 === 0;
              const rowStyle = isAlternate ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow;
              return (
                <View key={idx} style={rowStyle}>
                  <Text style={styles.col1}>{producto.nombre}</Text>
                  <Text style={styles.col2}>{producto.cantidad}</Text>
                  <Text style={styles.col3}>S/ {Number(producto.precio).toFixed(2)}</Text>
                  <Text style={styles.col4}>S/ {itemTotal.toFixed(2)}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.col1}>{venta.productos}</Text>
              <Text style={styles.col2}>1</Text>
              <Text style={styles.col3}>S/ {total.toFixed(2)}</Text>
              <Text style={styles.col4}>S/ {total.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text>S/ {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IGV (18%):</Text>
              <Text>S/ {igv.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>TOTAL A PAGAR:</Text>
              <Text>S/ {total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>NOTAS:</Text>
          <Text>Esta es una representación impresa de la Factura Electrónica. Para validar la autenticidad de este documento, ingrese el código de autorización en el portal de SUNAT.</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Gracias por su compra</Text>
          <Text style={styles.footerText}>BAZAR ABEM - RUC: 20123456789</Text>
          <Text style={styles.footerText}>Documento generado automáticamente</Text>
        </View>
      </Page>
    </Document>
  );
};
