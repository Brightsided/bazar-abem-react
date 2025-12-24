import api from './api';

export interface CierreCaja {
  id: number;
  usuario_id: number;
  fecha_apertura: string;
  fecha_cierre?: string | null;
  estado: 'ABIERTO' | 'CERRADO' | string;

  monto_inicial: string; // Prisma Decimal llega como string
  monto_final: string;
  total_ventas: string;
  total_efectivo: string;
  total_yape: string;
  total_plin: string;
  total_tarjeta: string;
  total_transferencia: string;
  total_otro: string;
  total_anulaciones: string;
  total_descuentos: string;
  observaciones?: string | null;

  usuario?: {
    id: number;
    nombre: string;
    username: string;
    rol: string;
  };
}

export interface EstadoCajaResponse {
  abierto: CierreCaja | null;
}

export interface PreviewTotales {
  total_ventas: number;
  total_efectivo: number;
  total_yape: number;
  total_plin: number;
  total_tarjeta: number;
  total_transferencia: number;
  total_otro: number;
  cantidad_ventas: number;
}

export interface PreviewResponse {
  rango: { desde: string; hasta: string };
  cierre_abierto: CierreCaja | null;
  totales: PreviewTotales;
  estimado_monto_final: number;
}

export const cierreCajaService = {
  async getEstado(): Promise<EstadoCajaResponse> {
    const response = await api.get<EstadoCajaResponse>('/cierre-caja/estado');
    return response.data;
  },

  async preview(): Promise<PreviewResponse> {
    const response = await api.get<PreviewResponse>('/cierre-caja/preview');
    return response.data;
  },

  async abrir(data: { monto_inicial: number; observaciones?: string }): Promise<{ cierre: CierreCaja }> {
    const response = await api.post<{ cierre: CierreCaja }>('/cierre-caja/abrir', data);
    return response.data;
  },

  async cerrar(data: { monto_final: number; observaciones?: string }): Promise<any> {
    const response = await api.post('/cierre-caja/cerrar', data);
    return response.data;
  },

  async listar(params?: { desde?: string; hasta?: string; usuario_id?: number }): Promise<{ cierres: CierreCaja[] }> {
    const response = await api.get<{ cierres: CierreCaja[] }>('/cierre-caja', { params });
    return response.data;
  },
};
