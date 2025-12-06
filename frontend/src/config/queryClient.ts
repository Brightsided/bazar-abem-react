import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración optimizada de React Query
 * 
 * Características:
 * - Caché de 5 minutos (staleTime)
 * - Garbage collection de 10 minutos (gcTime)
 * - Reintentos automáticos con backoff exponencial
 * - Deduplicación de requests
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos"
      // Después de esto, React Query marcará como "stale" pero no refetch automático
      staleTime: 5 * 60 * 1000, // 5 minutos

      // Tiempo que los datos se mantienen en caché después de no usarse
      // Después de esto, se eliminan de memoria
      gcTime: 10 * 60 * 1000, // 10 minutos (antes: cacheTime)

      // Número de reintentos en caso de error
      retry: 2,

      // Delay entre reintentos (backoff exponencial)
      // 1er reintento: 1000ms
      // 2do reintento: 2000ms
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // No refetch automático en background
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      // Reintentos para mutaciones (POST, PUT, DELETE)
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
