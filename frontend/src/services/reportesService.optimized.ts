import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { DashboardStats, FiltroReporte, ReporteResponse, CalculoRUC } from '@/types';

/**
 * Servicio de Reportes Optimizado
 * 
 * Características:
 * - Caché inteligente
 * - Deduplicación de requests
 * - Reintentos automáticos
 * - Paginación
 */

// ============================================
// QUERIES (GET)
// ============================================

/**
 * Hook para obtener estadísticas del dashboard
 * Caché: 5 minutos
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/reportes/dashboard');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para obtener reportes de ventas con filtros
 * Caché: 5 minutos
 * 
 * @param filtro - Objeto con filtro, fecha_inicio, fecha_fin, page, limit
 * @param enabled - Si false, no ejecuta la query
 */
export const useReporteVentas = (filtro: FiltroReporte, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['reportes', 'ventas', filtro],
    queryFn: async () => {
      const response = await api.post<ReporteResponse>('/reportes/ventas', filtro);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled, // Permite desactivar la query condicionalmente
  });
};

/**
 * Hook para obtener reportes con paginación
 * Útil para tablas grandes
 * 
 * @param filtro - Objeto con filtro, fecha_inicio, fecha_fin
 * @param page - Número de página (default: 1)
 * @param limit - Registros por página (default: 50)
 */
export const useReporteVentasPaginado = (
  filtro: FiltroReporte,
  page: number = 1,
  limit: number = 50
) => {
  return useQuery({
    queryKey: ['reportes', 'ventas', 'paginated', filtro, page, limit],
    queryFn: async () => {
      const response = await api.post<ReporteResponse>('/reportes/ventas', {
        ...filtro,
        page,
        limit,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// ============================================
// MUTATIONS (POST, PUT, DELETE)
// ============================================

/**
 * Hook para calcular RUC
 * Invalida caché de dashboard después de completar
 */
export const useCalcularRUC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { mes: number; ano: number }) => {
      const response = await api.post<CalculoRUC>('/ruc/calcular', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida el caché del dashboard para refrescar
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

/**
 * Hook para generar PDF
 */
export const useGenerarPDF = () => {
  return useMutation({
    mutationFn: async (data: { ventaId: number; tipo: 'boleta' | 'factura' }) => {
      const response = await api.get(`/comprobantes/${data.ventaId}/pdf`, {
        params: { tipo: data.tipo },
        responseType: 'blob',
      });
      return response.data;
    },
  });
};

/**
 * Hook para enviar email
 */
export const useEnviarEmail = () => {
  return useMutation({
    mutationFn: async (data: {
      ventaId: number;
      email: string;
      tipo: 'boleta' | 'factura';
    }) => {
      await api.post(`/comprobantes/${data.ventaId}/email`, {
        email: data.email,
        tipo: data.tipo,
      });
    },
  });
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Función para invalidar caché de reportes
 * Útil cuando se crea una nueva venta
 */
export const invalidateReportesCache = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: ['reportes'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
};

/**
 * Función para prefetch de reportes
 * Carga datos en background antes de que el usuario los necesite
 */
export const prefetchReporteVentas = (
  queryClient: any,
  filtro: FiltroReporte
) => {
  queryClient.prefetchQuery({
    queryKey: ['reportes', 'ventas', filtro],
    queryFn: async () => {
      const response = await api.post<ReporteResponse>('/reportes/ventas', filtro);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
