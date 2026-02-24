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
    staleTime: 1000 * 60 * 5,
  });

  const filteredProductos = productosDisponibles.filter((item) =>
    item.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => { setSearchTerm(value); }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        const dropdownElement = document.querySelector('[data-product-dropdown]');
        if (dropdownElement && !dropdownElement.contains(target)) setShowSuggestions(false);
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
      setDropdownPosition({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
    }
  };

  const handleFocus = () => { setShowSuggestions(true); updateDropdownPosition(); };

  const handleSelectProduct = (producto: Almacenamiento) => {
    setSearchTerm(producto.producto.nombre);
    onChange(producto.producto.nombre, producto);
    onProductSelect?.(producto);
    onStockChange?.(producto.stock);
    onProductSelectFull?.(producto);
    setShowSuggestions(false);
  };

  return (
    <>
      <div ref={wrapperRef} className="relative w-full">
        <input ref={inputRef} type="text" value={searchTerm} onChange={handleInputChange} onFocus={handleFocus}
          className="w-full px-3 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 placeholder-surface-400 dark:placeholder-surface-600 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all text-sm"
          placeholder={placeholder || 'Buscar producto...'} />
      </div>

      {showSuggestions && filteredProductos.length > 0 &&
        createPortal(
          <div data-product-dropdown
            className="fixed z-[9999] bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-xl max-h-80 overflow-y-auto"
            style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, width: `${dropdownPosition.width}px` }}>
            {filteredProductos.map((item) => (
              <button key={item.id} type="button" onClick={() => handleSelectProduct(item)}
                className="w-full text-left px-3 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors flex justify-between items-center border-b border-surface-100 dark:border-surface-700 last:border-b-0 group">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-900 dark:text-surface-50 group-hover:text-mint-600 dark:group-hover:text-mint-400 transition-colors truncate">
                    {item.producto.nombre}
                  </div>
                  <div className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
                    S/. <span className="font-semibold text-mint-600 dark:text-mint-400">{Number(item.producto.precio).toFixed(2)}</span>
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    item.stock > 5 ? 'bg-mint-500/10 text-mint-700 dark:text-mint-400'
                      : item.stock > 0 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'bg-red-500/10 text-red-700 dark:text-red-400'
                  }`}>
                    {item.stock} uds
                  </span>
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
