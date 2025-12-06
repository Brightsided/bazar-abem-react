import api from './api';
import { DashboardStats, FiltroReporte, ReporteResponse, CalculoRUC } from '@/types';

export const reportesService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/reportes/dashboard');
    return response.data;
  },

  async getReporteVentas(filtro: FiltroReporte): Promise<ReporteResponse> {
    const response = await api.post<ReporteResponse>('/reportes/ventas', filtro);
    return response.data;
  },

  async calcularRUC(mes: number, ano: number): Promise<CalculoRUC> {
    const response = await api.post<CalculoRUC>('/ruc/calcular', { mes, ano });
    return response.data;
  },

  async generarPDF(ventaId: number, tipo: 'boleta' | 'factura'): Promise<Blob> {
    const response = await api.get(`/comprobantes/${ventaId}/pdf`, {
      params: { tipo },
      responseType: 'blob',
    });
    return response.data;
  },

  async enviarEmail(ventaId: number, email: string, tipo: 'boleta' | 'factura'): Promise<void> {
    await api.post(`/comprobantes/${ventaId}/email`, { email, tipo });
  },

  async enviarEmailConBoleta(ventaId: number, email: string): Promise<void> {
    await api.post(`/comprobantes/${ventaId}/enviar-boleta-factura`, { email });
  },
};
