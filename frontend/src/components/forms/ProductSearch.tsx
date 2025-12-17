import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductosDisponibles, Almacenamiento } from '@/services/almacenamientoService';
import { createPortal } from 'react-dom';

interface ProductSearchProps {
  value: string;
  onChange: (value: string, producto?: Almacenamiento) => void;
  placeholder?: string;
  onProductSelect?: (producto: Almacenamiento) => void;
  onStockChange?: (stock: number) => void;
  onProductSelectFull?: (producto: Almacenamiento) => void;
}

const ProductSearch = ({ value, onChange, placeholder, onProductSelect, onStockChange, onProductSelectFull }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const { data: productosDisponibles = [] } = useQuery({
    queryKey: ['productos-disponibles'],
    queryFn: () => getProductosDisponibles(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const filteredProductos = productosDisponibles.filter((item) =>
    item.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // No cerrar si el click es en el wrapper o en el portal
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        // Verificar si el click es en el dropdown del portal
        const dropdownElement = document.querySelector('[data-product-dropdown]');
        if (dropdownElement && !dropdownElement.contains(target)) {
          setShowSuggestions(false);
        }
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
    updateDropdownPosition();
  };

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    updateDropdownPosition();
  };

  const handleSelectProduct = (producto: Almacenamiento) => {
    setSearchTerm(producto.producto.nombre);
    onChange(producto.producto.nombre, producto);
    if (onProductSelect) {
      onProductSelect(producto);
    }
    if (onStockChange) {
      onStockChange(producto.stock);
    }
    if (onProductSelectFull) {
      onProductSelectFull(producto);
    }
    setShowSuggestions(false);
  };

  return (
    <>
      <div ref={wrapperRef} className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
          placeholder={placeholder || 'Buscar producto...'}
        />
      </div>

      {showSuggestions && filteredProductos.length > 0 &&
        createPortal(
          <div
            data-product-dropdown
            className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            {filteredProductos.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectProduct(item)}
                className="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors flex justify-between items-center border-b border-gray-100 dark:border-gray-700 last:border-b-0 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {item.producto.nombre}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Precio: <span className="font-bold text-green-600 dark:text-green-400">S/. {Number(item.producto.precio).toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <div className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                    item.stock > 5 
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                      : item.stock > 0
                      ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                  }`}>
                    📦 {item.stock}
                  </div>
                </div>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default ProductSearch;
