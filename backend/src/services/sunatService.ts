import { create } from 'xmlbuilder2';
import crypto from 'crypto';
import { format } from 'date-fns';
import prisma from '../config/database.js';

/**
 * Servicio para generar y enviar comprobantes electrónicos a SUNAT
 * Ambiente: BETA (pruebas)
 */

// Configuración SUNAT BETA
const SUNAT_CONFIG = {
  wsdlUrl: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl',
  usuario: 'MODDATOS',
  password: 'MODDATOS',
  rucEmisor: '20000000001', // RUC de prueba
  razonSocialEmisor: 'BAZAR ABEM S.A.C.',
  direccionEmisor: 'Av. Principal 123, Lima, Perú',
};

/**
 * Genera un XML UBL 2.1 para una factura
 */
export const generarXmlFactura = async (ventaId: number) => {
  try {
    // Obtener datos de la venta
    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: {
        detalles: true,
        clienteRel: true,
        usuarioRel: true,
      },
    });

    if (!venta) {
      throw new Error(`Venta ${ventaId} no encontrada`);
    }

    // Validar que el cliente tenga RUC (tipo documento 6)
    // Por ahora usamos un RUC de prueba
    const rucCliente = '20000000002'; // RUC de prueba para cliente
    const tipoDocumento = '6'; // RUC

    // Crear documento XML UBL 2.1
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Invoice', {
        xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
      });

    // UBLVersionID
    doc.ele('cbc:UBLVersionID').txt('2.1');

    // CustomizationID
    doc.ele('cbc:CustomizationID').txt('1.1');

    // ID (Número de factura)
    const numeroFactura = `F001-${String(venta.id).padStart(8, '0')}`;
    doc.ele('cbc:ID').txt(numeroFactura);

    // IssueDate
    doc.ele('cbc:IssueDate').txt(format(venta.fecha_venta, 'yyyy-MM-dd'));

    // IssueTime
    doc.ele('cbc:IssueTime').txt(format(venta.fecha_venta, 'HH:mm:ss'));

    // InvoiceTypeCode
    doc.ele('cbc:InvoiceTypeCode').txt('01'); // 01 = Factura

    // DocumentCurrencyCode
    doc.ele('cbc:DocumentCurrencyCode').txt('PEN');

    // Signature (firma digital - simulada en BETA)
    const signatureNode = doc.ele('cac:Signature');
    signatureNode.ele('cbc:ID').txt('1');
    signatureNode.ele('cbc:SignatureMethod').txt('urn:digicert:signature:rsa-sha256');
    const signatureValueNode = signatureNode.ele('cac:SignatoryParty');
    signatureValueNode.ele('cac:PartyIdentification').ele('cbc:ID').txt(SUNAT_CONFIG.rucEmisor);

    // Accounting Supplier Party (Emisor)
    const supplierNode = doc.ele('cac:AccountingSupplierParty');
    supplierNode.ele('cbc:CustomerAssignedAccountID').txt(SUNAT_CONFIG.rucEmisor);
    const supplierPartyNode = supplierNode.ele('cac:Party');
    supplierPartyNode.ele('cbc:WebsiteURI').txt('https://bazarabem.com');
    
    const supplierNameNode = supplierPartyNode.ele('cac:PartyName');
    supplierNameNode.ele('cbc:Name').txt(SUNAT_CONFIG.razonSocialEmisor);

    const supplierAddressNode = supplierPartyNode.ele('cac:PostalAddress');
    supplierAddressNode.ele('cbc:StreetName').txt(SUNAT_CONFIG.direccionEmisor);
    supplierAddressNode.ele('cbc:CityName').txt('Lima');
    supplierAddressNode.ele('cbc:CountrySubentity').txt('Lima');
    supplierAddressNode.ele('cac:Country').ele('cbc:IdentificationCode').txt('PE');

    // Accounting Customer Party (Cliente)
    const customerNode = doc.ele('cac:AccountingCustomerParty');
    customerNode.ele('cbc:CustomerAssignedAccountID').txt(rucCliente);
    const customerPartyNode = customerNode.ele('cac:Party');
    
    const customerNameNode = customerPartyNode.ele('cac:PartyName');
    customerNameNode.ele('cbc:Name').txt(venta.cliente);

    const customerAddressNode = customerPartyNode.ele('cac:PostalAddress');
    customerAddressNode.ele('cbc:CityName').txt('Lima');
    customerAddressNode.ele('cac:Country').ele('cbc:IdentificationCode').txt('PE');

    // Delivery
    const deliveryNode = doc.ele('cac:Delivery');
    deliveryNode.ele('cbc:ActualDeliveryDate').txt(format(venta.fecha_venta, 'yyyy-MM-dd'));
    const deliveryLocationNode = deliveryNode.ele('cac:DeliveryLocation');
    deliveryLocationNode.ele('cbc:Description').txt('Entrega en tienda');

    // Payment Means
    const paymentNode = doc.ele('cac:PaymentMeans');
    paymentNode.ele('cbc:PaymentMeansCode').txt(mapMetodoPago(venta.metodo_pago));
    paymentNode.ele('cbc:PaymentDueDate').txt(format(venta.fecha_venta, 'yyyy-MM-dd'));

    // Tax Total
    const igv = Number(venta.precio_total) * 0.18;
    const taxTotalNode = doc.ele('cac:TaxTotal');
    taxTotalNode.ele('cbc:TaxAmount', { currencyID: 'PEN' }).txt(igv.toFixed(2));
    
    const taxSubtotalNode = taxTotalNode.ele('cac:TaxSubtotal');
    taxSubtotalNode.ele('cbc:TaxableAmount', { currencyID: 'PEN' }).txt((Number(venta.precio_total) - igv).toFixed(2));
    taxSubtotalNode.ele('cbc:TaxAmount', { currencyID: 'PEN' }).txt(igv.toFixed(2));
    taxSubtotalNode.ele('cac:TaxCategory').ele('cac:TaxScheme').ele('cbc:ID').txt('1000');

    // Legal Monetary Total
    const legalMonetaryNode = doc.ele('cac:LegalMonetaryTotal');
    legalMonetaryNode.ele('cbc:LineExtensionAmount', { currencyID: 'PEN' }).txt((Number(venta.precio_total) - igv).toFixed(2));
    legalMonetaryNode.ele('cbc:TaxInclusiveAmount', { currencyID: 'PEN' }).txt(Number(venta.precio_total).toFixed(2));
    legalMonetaryNode.ele('cbc:PayableAmount', { currencyID: 'PEN' }).txt(Number(venta.precio_total).toFixed(2));

    // Invoice Lines (Detalles de productos)
    venta.detalles.forEach((detalle, index) => {
      const lineNode = doc.ele('cac:InvoiceLine');
      lineNode.ele('cbc:ID').txt(String(index + 1));
      lineNode.ele('cbc:InvoicedQuantity', { unitCode: 'NIU' }).txt(String(detalle.cantidad));
      lineNode.ele('cbc:LineExtensionAmount', { currencyID: 'PEN' }).txt((Number(detalle.precio) * detalle.cantidad).toFixed(2));

      // Item
      const itemNode = lineNode.ele('cac:Item');
      itemNode.ele('cbc:Description').txt(detalle.producto);
      itemNode.ele('cac:SellersItemIdentification').ele('cbc:ID').txt(String(detalle.producto_id || index + 1));

      // Price
      const priceNode = lineNode.ele('cac:Price');
      priceNode.ele('cbc:PriceAmount', { currencyID: 'PEN' }).txt(Number(detalle.precio).toFixed(2));
    });

    const xmlString = doc.end({ prettyPrint: true });
    return xmlString;
  } catch (error) {
    console.error('Error generando XML:', error);
    throw error;
  }
};

/**
 * Mapea métodos de pago a códigos SUNAT
 */
const mapMetodoPago = (metodo: string): string => {
  const mapeo: Record<string, string> = {
    'Efectivo': '01',
    'Tarjeta De Credito/Debito': '02',
    'Yape': '03',
    'Transferencia': '04',
  };
  return mapeo[metodo] || '01';
};

/**
 * Genera un hash del comprobante (simulado en BETA)
 */
export const generarHashCpe = (xmlContent: string): string => {
  return crypto.createHash('sha256').update(xmlContent).digest('hex');
};

/**
 * Simula la firma digital del XML (en BETA no se requiere certificado real)
 */
export const firmarXml = async (xmlContent: string): Promise<string> => {
  try {
    // En ambiente BETA, simulamos la firma
    // En producción, se usaría un certificado digital real
    const hash = generarHashCpe(xmlContent);
    
    // Agregar firma simulada al XML
    const xmlFirmado = xmlContent.replace(
      '</Invoice>',
      `<cac:Signature>
        <cbc:ID>1</cbc:ID>
        <cbc:SignatureMethod>urn:digicert:signature:rsa-sha256</cbc:SignatureMethod>
        <cbc:SignatureValue>${hash}</cbc:SignatureValue>
      </cac:Signature>
    </Invoice>`
    );

    return xmlFirmado;
  } catch (error) {
    console.error('Error firmando XML:', error);
    throw error;
  }
};

/**
 * Envía el comprobante a SUNAT BETA
 * En ambiente real, se usaría SOAP con certificado digital
 */
export const enviarASunatBeta = async (
  ventaId: number,
  xmlFirmado: string
): Promise<{ success: boolean; codigoSunat?: string; mensajeSunat?: string; cdrXml?: string }> => {
  try {
    // En ambiente BETA, simulamos la respuesta de SUNAT
    // En producción, se haría una llamada SOAP real
    
    console.log(`Enviando comprobante de venta ${ventaId} a SUNAT BETA...`);

    // Simular respuesta exitosa de SUNAT
    const codigoSunat = '0'; // 0 = Aceptado
    const mensajeSunat = 'Comprobante recibido correctamente';
    
    // Generar CDR simulado
    const cdrXml = generarCdrSimulado(ventaId, codigoSunat);

    // Guardar en base de datos
    await prisma.comprobanteElectronico.update({
      where: { venta_id: ventaId },
      data: {
        estado: 'ACEPTADO',
        codigoSunat,
        mensajeSunat,
        cdrXml,
        fechaEnvio: new Date(),
        fechaRespuesta: new Date(),
        intentosEnvio: 1,
      },
    });

    return {
      success: true,
      codigoSunat,
      mensajeSunat,
      cdrXml,
    };
  } catch (error) {
    console.error('Error enviando a SUNAT:', error);
    
    // Registrar error
    await prisma.comprobanteElectronico.update({
      where: { venta_id: ventaId },
      data: {
        estado: 'RECHAZADO',
        ultimoError: String(error),
        intentosEnvio: {
          increment: 1,
        },
      },
    });

    return {
      success: false,
      mensajeSunat: String(error),
    };
  }
};

/**
 * Genera un CDR simulado (Comprobante de Recepción)
 */
const generarCdrSimulado = (ventaId: number, codigoSunat: string): string => {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('ApplicationResponse', {
      xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2',
      'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
      'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
    });

  doc.ele('cbc:UBLVersionID').txt('2.1');
  doc.ele('cbc:CustomizationID').txt('1.1');
  doc.ele('cbc:ID').txt(`CDR-${ventaId}`);
  doc.ele('cbc:IssueDate').txt(format(new Date(), 'yyyy-MM-dd'));
  doc.ele('cbc:IssueTime').txt(format(new Date(), 'HH:mm:ss'));
  doc.ele('cbc:ResponseCode').txt(codigoSunat);
  doc.ele('cbc:Description').txt('Comprobante recibido correctamente');

  return doc.end({ prettyPrint: true });
};

/**
 * Obtiene el estado de un comprobante
 */
export const obtenerEstadoComprobante = async (ventaId: number) => {
  try {
    const comprobante = await prisma.comprobanteElectronico.findUnique({
      where: { venta_id: ventaId },
    });

    if (!comprobante) {
      return {
        success: false,
        message: 'Comprobante no encontrado',
      };
    }

    return {
      success: true,
      comprobante,
    };
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    return {
      success: false,
      message: String(error),
    };
  }
};

/**
 * Reintenta enviar un comprobante rechazado
 */
export const reenviarComprobante = async (ventaId: number) => {
  try {
    const comprobante = await prisma.comprobanteElectronico.findUnique({
      where: { venta_id: ventaId },
    });

    if (!comprobante) {
      return {
        success: false,
        message: 'Comprobante no encontrado',
      };
    }

    if (comprobante.intentosEnvio >= 3) {
      return {
        success: false,
        message: 'Máximo número de intentos alcanzado',
      };
    }

    // Reenviar
    return await enviarASunatBeta(ventaId, comprobante.xmlFirmado || comprobante.xmlSinFirma);
  } catch (error) {
    console.error('Error reenviando:', error);
    return {
      success: false,
      message: String(error),
    };
  }
};

/**
 * Lista comprobantes electrónicos con filtros
 */
export const listarComprobantes = async (filtros?: {
  estado?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  ventaId?: number;
}) => {
  try {
    const where: any = {};

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    if (filtros?.ventaId) {
      where.venta_id = filtros.ventaId;
    }

    if (filtros?.fechaInicio || filtros?.fechaFin) {
      where.fecha_creacion = {};
      if (filtros.fechaInicio) {
        where.fecha_creacion.gte = filtros.fechaInicio;
      }
      if (filtros.fechaFin) {
        where.fecha_creacion.lte = filtros.fechaFin;
      }
    }

    const comprobantes = await prisma.comprobanteElectronico.findMany({
      where,
      include: {
        venta: {
          include: {
            detalles: true,
            clienteRel: true,
          },
        },
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return {
      success: true,
      comprobantes,
      total: comprobantes.length,
    };
  } catch (error) {
    console.error('Error listando comprobantes:', error);
    return {
      success: false,
      message: String(error),
    };
  }
};
