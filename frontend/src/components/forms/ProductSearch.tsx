import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productosService } from '@/services/productosService';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ProductSearch = ({ value, onChange, placeholder }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: productos } = useQuery({
    queryKey: ['productos-search', searchTerm],
    queryFn: () => productosService.searchProductos(searchTerm),
    enabled: searchTerm.length > 0,
  });

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSelectProduct = (nombre: string) => {
    setSearchTerm(nombre);
    onChange(nombre);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        className="input"
        placeholder={placeholder || 'Buscar producto...'}
      />
      
      {showSuggestions && productos && productos.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {productos.map((producto) => (
            <button
              key={producto.id}
              type="button"
              onClick={() => handleSelectProduct(producto.nombre)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {producto.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
