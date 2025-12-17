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
      // Buscar el cliente "Cliente Casual" en la lista
      const clienteCasual = clientes.find(c => c.nombre.toLowerCase() === 'cliente casual');
      onClientSelect?.(clienteCasual || null);
      return;
    }

    const filtered = clientes.filter(client =>
      client.nombre.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [value, clientes, onClientSelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
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
    // Buscar el cliente "Cliente Casual" en la lista
    const clienteCasual = clientes.find(c => c.nombre.toLowerCase() === 'cliente casual');
    onClientSelect?.(clienteCasual || null);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    if (value.trim() && value.toLowerCase() !== 'cliente casual') {
      onChange(value);
      onClientSelect?.(null); // null indica que es un cliente nuevo
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
        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
        placeholder={placeholder}
        autoComplete="off"
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {/* Cliente Casual Option */}
          <button
            type="button"
            onClick={handleClientCasualSelect}
            className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center gap-2">
              <i className="fas fa-user-secret text-gray-400"></i>
              <span className="text-gray-900 dark:text-white font-medium">Cliente Casual</span>
            </div>
          </button>

          {/* Existing Clients */}
          {filteredClients.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                Clientes Existentes
              </div>
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelect(client)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <i className="fas fa-user text-blue-500"></i>
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">{client.nombre}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {client.id}</div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Create New Client Option */}
          {value.trim() && value.toLowerCase() !== 'cliente casual' && !filteredClients.some(c => c.nombre.toLowerCase() === value.toLowerCase()) && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors border-t border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-2">
                <i className="fas fa-plus text-green-500"></i>
                <span className="text-gray-900 dark:text-white font-medium">
                  Crear cliente: <span className="font-bold">{value}</span>
                </span>
              </div>
            </button>
          )}

          {/* No Results */}
          {filteredClients.length === 0 && (!value.trim() || value.toLowerCase() === 'cliente casual') && (
            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              <i className="fas fa-search text-2xl mb-2 block opacity-50"></i>
              <p className="text-sm">Escribe para buscar o crear un cliente</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearch;
