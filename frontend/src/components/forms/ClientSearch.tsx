import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientesService } from '@/services/clientesService';
import { Cliente } from '@/types';

interface ClientSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClientSelect?: (client: Cliente | null) => void;
  placeholder?: string;
}

const ClientSearch = ({ value, onChange, onClientSelect, placeholder = 'Buscar o crear cliente...' }: ClientSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Cliente[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.getClientes,
  });

  useEffect(() => {
    if (value.toLowerCase() === 'cliente casual') {
      setFilteredClients([]);
      const clienteCasual = clientes.find(c => c.nombre.toLowerCase() === 'cliente casual');
      onClientSelect?.(clienteCasual || null);
      return;
    }
    const filtered = clientes.filter(client => client.nombre.toLowerCase().includes(value.toLowerCase()));
    setFilteredClients(filtered);
  }, [value, clientes, onClientSelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (client: Cliente) => {
    onChange(client.nombre);
    onClientSelect?.(client);
    setIsOpen(false);
  };

  const handleClientCasualSelect = () => {
    onChange('Cliente Casual');
    const clienteCasual = clientes.find(c => c.nombre.toLowerCase() === 'cliente casual');
    onClientSelect?.(clienteCasual || null);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    if (value.trim() && value.toLowerCase() !== 'cliente casual') {
      onChange(value);
      onClientSelect?.(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-full px-4 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 placeholder-surface-400 dark:placeholder-surface-600 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all text-sm"
        placeholder={placeholder}
        autoComplete="off"
      />

      {isOpen && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <button type="button" onClick={handleClientCasualSelect}
            className="w-full text-left px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors border-b border-surface-100 dark:border-surface-700 flex items-center gap-2">
            <i className="fas fa-user-secret text-surface-400 text-xs"></i>
            <span className="text-sm text-surface-900 dark:text-surface-50 font-medium">Cliente Casual</span>
          </button>

          {filteredClients.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-[10px] font-semibold text-surface-400 dark:text-surface-500 bg-surface-50 dark:bg-surface-800 uppercase tracking-wider">Existentes</div>
              {filteredClients.map((client) => (
                <button key={client.id} type="button" onClick={() => handleSelect(client)}
                  className="w-full text-left px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors border-b border-surface-50 dark:border-surface-700 last:border-b-0 flex items-center gap-2">
                  <i className="fas fa-user text-mint-500 text-xs"></i>
                  <div>
                    <div className="text-sm text-surface-900 dark:text-surface-50 font-medium">{client.nombre}</div>
                    <div className="text-[11px] text-surface-400 dark:text-surface-500">ID: {client.id}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {value.trim() && value.toLowerCase() !== 'cliente casual' && !filteredClients.some(c => c.nombre.toLowerCase() === value.toLowerCase()) && (
            <button type="button" onClick={handleCreateNew}
              className="w-full text-left px-4 py-2.5 hover:bg-mint-50 dark:hover:bg-mint-500/10 transition-colors border-t border-surface-100 dark:border-surface-700 flex items-center gap-2">
              <i className="fas fa-plus text-mint-500 text-xs"></i>
              <span className="text-sm text-surface-900 dark:text-surface-50 font-medium">Crear: <span className="font-bold">{value}</span></span>
            </button>
          )}

          {filteredClients.length === 0 && (!value.trim() || value.toLowerCase() === 'cliente casual') && (
            <div className="px-4 py-6 text-center text-surface-400 dark:text-surface-500">
              <i className="fas fa-search text-lg mb-1 block opacity-40"></i>
              <p className="text-xs">Escribe para buscar o crear un cliente</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearch;
