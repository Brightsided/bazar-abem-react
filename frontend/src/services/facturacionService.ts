import api from './api';
import { ComprobanteElectronico, ResultadoFacturacion, EstadoComprobante } from '@/types';

/**
 * Servicio para interactuar con la API de Facturación Electrónica SUNAT
 */

export const facturacionService = {
  /**
   * Genera un comprobante electrónico para una venta
   */
  generarComprobante: async (ventaId: number, tipo: 'FACTURA' | 'BOLETA' = 'FACTURA'): Promise<ResultadoFacturacion> => {
    try {
      const response = await api.post('/facturacion/generar', {
        ventaId,
        tipo,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al generar comprobante',
        error: error.message,
      };
    }
  },

  /**
   * Firma un comprobante electrónico
   */
  firmarComprobante: async (ventaId: number): Promise<ResultadoFacturacion> => {
    try {
      const response = await api.post(`/facturacion/firmar/${ventaId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al firmar comprobante',
        error: error.message,
      };
    }
  },

  /**
   * Envía un comprobante a SUNAT
   */
  enviarComprobante: async (ventaId: number): Promise<ResultadoFacturacion> => {
    try {
      const response = await api.post(`/facturacion/enviar/${ventaId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al enviar comprobante',
        error: error.message,
      };
    }
  },

  /**
   * Reintenta enviar un comprobante
   */
  reenviarComprobante: async (ventaId: number): Promise<ResultadoFacturacion> => {
    try {
      const response = await api.post(`/facturacion/reenviar/${ventaId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al reenviar comprobante',
        error: error.message,
      };
    }
  },

  /**
   * Procesa un comprobante (generar, firmar y enviar en un solo paso)
   */
  procesarComprobante: async (ventaId: number, tipo: 'FACTURA' | 'BOLETA' = 'FACTURA'): Promise<ResultadoFacturacion> => {
    try {
      const response = await api.post(`/facturacion/procesar/${ventaId}`, {
        tipo,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al procesar comprobante',
        error: error.message,
      };
    }
  },

  /**
   * Obtiene el estado de un comprobante
   */
  obtenerEstado: async (ventaId: number): Promise<EstadoComprobante> => {
    try {
      const response = await api.get(`/facturacion/estado/${ventaId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estado',
      };
    }
  },

  /**
   * Lista comprobantes electrónicos
   */
  listarComprobantes: async (filtros?: {
    estado?: string;
    ventaId?: number;
  }): Promise<{ success: boolean; comprobantes?: ComprobanteElectronico[]; total?: number; message?: string }> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.ventaId) params.append('ventaId', String(filtros.ventaId));

      const response = await api.get(`/facturacion/listar?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al listar comprobantes',
      };
    }
  },

  /**
   * Obtiene el XML de un comprobante
   */
  descargarXml: async (ventaId: number): Promise<void> => {
    try {
      const response = await api.get(`/facturacion/xml/${ventaId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprobante-${ventaId}.xml`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error descargando XML:', error);
      throw error;
    }
  },

  /**
   * Obtiene el CDR de un comprobante
   */
  descargarCdr: async (ventaId: number): Promise<void> => {
    try {
      const response = await api.get(`/facturacion/cdr/${ventaId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cdr-${ventaId}.xml`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error descargando CDR:', error);
      throw error;
    }
  },

  /**
   * Obtiene detalles completos de un comprobante
   */
  obtenerDetalles: async (ventaId: number): Promise<{ success: boolean; comprobante?: ComprobanteElectronico; message?: string }> => {
    try {
      const response = await api.get(`/facturacion/detalles/${ventaId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener detalles',
      };
    }
  },
};
