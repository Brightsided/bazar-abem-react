import { useState, useEffect } from 'react';

/**
 * Hook para debouncing de valores
 * Útil para filtros que hacen requests al servidor
 * 
 * @param value - Valor a debounce
 * @param delay - Delay en milisegundos (default: 500ms)
 * @returns Valor debounceado
 * 
 * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // Este effect solo se ejecuta después de 500ms sin cambios
 *   fetchResults(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crear timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout anterior si el valor cambia
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
