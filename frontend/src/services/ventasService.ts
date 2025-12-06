import api from './api';
import { Venta, VentaDetallada, NuevaVenta } from '@/types';

export const ventasService = {
  async getVentas(): Promise<Venta[]> {
    const response = await api.get<Venta[]>('/ventas');
    return response.data;
  },

  async getVenta(id: number): Promise<VentaDetallada> {
    const response = await api.get<VentaDetallada>(`/ventas/${id}`);
    return response.data;
  },

  async createVenta(venta: NuevaVenta): Promise<Venta> {
    const response = await api.post<Venta>('/ventas', venta);
    return response.data;
  },

  async deleteVenta(id: number): Promise<void> {
    await api.delete(`/ventas/${id}`);
  },
};
