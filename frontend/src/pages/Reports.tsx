import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/services/reportesService';
import { facturacionService } from '@/services/facturacionService';
import { formatCurrency, formatDate, formatDateForInput } from '@/utils/formatters';
import { FiltroReporte, VentaDetallada, ComprobanteElectronico } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { SalesChart } from '@/components/charts/SalesChart';
import { PaymentMethodChart } from '@/components/charts/PaymentMethodChart';
import { EmailModal } from '@/components/modals/EmailModal';
import { WhatsAppModal } from '@/components/modals/WhatsAppModal';
import { BolletaPrintModal } from '@/components/modals/BolletaPrintModal';
import { SunatModal } from '@/components/modals/SunatModal';
import { TrendingUp, CreditCard } from 'lucide-react';

const Reports = () => {
  const [filtro, setFiltro] = useState<FiltroReporte>({
    filtro: 'hoy',
  });

  // Estados para los modales
  const [selectedVenta, setSelectedVenta] = useState<VentaDetallada | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [bolletaModalOpen, setBolletaModalOpen] = useState(false);
  const [sunatModalOpen, setSunatModalOpen] = useState(false);
  
  // Estado para búsqueda en tabla
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para almacenar estados de comprobantes
  const [estadosComprobantes, setEstadosComprobantes] = useState<Record<number, string>>({});

  // ✅ Agregar debouncing para evitar múltiples requests
  const debouncedFiltro = useDebounce(filtro, 300);

  const { data: reporte, isLoading } = useQuery({
    queryKey: ['reportes', debouncedFiltro],
    queryFn: () => reportesService.getReporteVentas(debouncedFiltro),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
  });

  // Función para obtener estado del comprobante
  const obtenerEstadoComprobante = async (ventaId: number) => {
    try {
      const resultado = await facturacionService.obtenerEstado(ventaId);
      if (resultado.success && resultado.comprobante) {
        setEstadosComprobantes(prev => ({
          ...prev,
          [ventaId]: resultado.comprobante!.estado
        }));
      } else {
        setEstadosComprobantes(prev => ({
          ...prev,
          [ventaId]: 'SIN ENVIAR'
        }));
      }
    } catch (error) {
      setEstadosComprobantes(prev => ({
        ...prev,
        [ventaId]: 'ERROR'
      }));
    }
  };

  // Cargar estados cuando cambian las ventas
  useEffect(() => {
    if (reporte?.ventas) {
      reporte.ventas.forEach(venta => {
        if (!estadosComprobantes[venta.id]) {
          obtenerEstadoComprobante(venta.id);
        }
      });
    }
  }, [reporte?.ventas, estadosComprobantes]);

  const handleFiltroChange = useCallback((nuevoFiltro: string) => {
    if (nuevoFiltro === 'personalizado') {
      const hoy = new Date();
      setFiltro({
        filtro: 'personalizado',
        fecha_inicio: formatDateForInput(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
        fecha_fin: formatDateForInput(hoy),
      });
    } else {
      setFiltro({ filtro: nuevoFiltro as any });
    }
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-xl blur-xl"></div>
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            <i className="fas fa-chart-line mr-3"></i>
            Reportes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>
            Análisis detallado y estadísticas de ventas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            <i className="fas fa-filter mr-2 text-blue-500"></i>
            Período de Análisis
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => handleFiltroChange('hoy')}
            className={`relative overflow-hidden rounded-lg p-3 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
              filtro.filtro === 'hoy'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400'
                : 'bg-white/50 dark:bg-white/5 border-2 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-white/40 dark:hover:border-white/20'
            }`}
          >
            <i className="fas fa-calendar-day text-sm"></i>
            <span className="text-sm">Hoy</span>
          </button>
          <button
            onClick={() => handleFiltroChange('semana')}
            className={`relative overflow-hidden rounded-lg p-3 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
              filtro.filtro === 'semana'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400'
                : 'bg-white/50 dark:bg-white/5 border-2 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-white/40 dark:hover:border-white/20'
            }`}
          >
            <i className="fas fa-calendar-week text-sm"></i>
            <span className="text-sm">Semana</span>
          </button>
          <button
            onClick={() => handleFiltroChange('mes')}
            className={`relative overflow-hidden rounded-lg p-3 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
              filtro.filtro === 'mes'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400'
                : 'bg-white/50 dark:bg-white/5 border-2 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-white/40 dark:hover:border-white/20'
            }`}
          >
            <i className="fas fa-calendar-alt text-sm"></i>
            <span className="text-sm">Mes</span>
          </button>
          <button
            onClick={() => handleFiltroChange('ano')}
            className={`relative overflow-hidden rounded-lg p-3 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
              filtro.filtro === 'ano'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400'
                : 'bg-white/50 dark:bg-white/5 border-2 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-white/40 dark:hover:border-white/20'
            }`}
          >
            <i className="fas fa-calendar text-sm"></i>
            <span className="text-sm">Año</span>
          </button>
          <button
            onClick={() => handleFiltroChange('personalizado')}
            className={`relative overflow-hidden rounded-lg p-3 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
              filtro.filtro === 'personalizado'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400'
                : 'bg-white/50 dark:bg-white/5 border-2 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-white/40 dark:hover:border-white/20'
            }`}
          >
            <i className="fas fa-sliders-h text-sm"></i>
            <span className="text-sm">Personalizado</span>
          </button>
        </div>

        {filtro.filtro === 'personalizado' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <i className="fas fa-calendar-check mr-2 text-green-500"></i>
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filtro.fecha_inicio}
                onChange={(e) => setFiltro({ ...filtro, fecha_inicio: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <i className="fas fa-calendar-times mr-2 text-red-500"></i>
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtro.fecha_fin}
                onChange={(e) => setFiltro({ ...filtro, fecha_fin: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
              />
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 animate-spin">
              <i className="fas fa-spinner text-2xl text-white"></i>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando reportes...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Resumen - Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Ventas */}
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-blue-600/20 to-blue-600/10 dark:from-blue-600/10 dark:to-blue-600/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Ventas</h3>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <i className="fas fa-shopping-cart text-blue-500 text-lg"></i>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reporte?.ventas.length || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <i className="fas fa-arrow-up text-green-500 mr-1"></i>
                  Transacciones registradas
                </p>
              </div>
            </div>

            {/* Ingresos Totales */}
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-green-600/20 to-green-600/10 dark:from-green-600/10 dark:to-green-600/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ingresos Totales</h3>
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <i className="fas fa-dollar-sign text-green-500 text-lg"></i>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(reporte?.totalVentas || 0)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <i className="fas fa-chart-line text-green-500 mr-1"></i>
                  Ingresos del período
                </p>
              </div>
            </div>

            {/* Promedio por Venta */}
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-purple-600/20 to-purple-600/10 dark:from-purple-600/10 dark:to-purple-600/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Promedio por Venta</h3>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <i className="fas fa-calculator text-purple-500 text-lg"></i>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(
                    reporte?.ventas.length
                      ? (reporte?.totalVentas || 0) / reporte.ventas.length
                      : 0
                  )}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <i className="fas fa-divide text-purple-500 mr-1"></i>
                  Por transacción
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ventas por Fecha */}
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-3 text-blue-500" />
                  Ventas por Fecha
                </h2>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  Tendencia
                </span>
              </div>
              {reporte && Object.keys(reporte.ventasPorFecha).length > 0 ? (
                <SalesChart data={reporte.ventasPorFecha} />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No hay datos disponibles
                </div>
              )}
            </div>

            {/* Métodos de Pago */}
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-3 text-green-500" />
                  Métodos de Pago
                </h2>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">
                  Distribución
                </span>
              </div>
              {reporte && Object.keys(reporte.metodosPago).length > 0 ? (
                <PaymentMethodChart data={reporte.metodosPago} />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>

          {/* Tabla de Ventas */}
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <i className="fas fa-list mr-3 text-purple-500"></i>
                Detalle de Ventas
              </h2>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                {reporte?.ventas?.length || 0} registros
              </span>
            </div>
            
            {/* Buscador */}
            <div className="mb-6">
              <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Buscar por ID Cliente, Productos, Método o Fecha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 dark:border-white/5">
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-hashtag mr-2"></i>ID
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-user mr-2"></i>Cliente
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-box mr-2"></i>Productos
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-credit-card mr-2"></i>Método
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-dollar-sign mr-2"></i>Total
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-calendar mr-2"></i>Fecha
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-file-check mr-2"></i>Estado
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-cog mr-2"></i>Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reporte?.ventas && reporte.ventas.length > 0 ? (
                    reporte.ventas
                      .filter((venta) => {
                        const raw = searchTerm.trim();
                        const searchLower = raw.toLowerCase();

                        // Permite buscar por ID usando el formato que se muestra en UI: "#5"
                        // Si el usuario escribe "#", interpretamos búsqueda exacta por ID.
                        if (searchLower.startsWith('#')) {
                          const idQuery = searchLower.replace(/^#+/, '').trim();
                          if (!idQuery) return true;

                          // Si es numérico: match exacto por ID
                          if (/^\d+$/.test(idQuery)) {
                            return venta.id === Number(idQuery);
                          }

                          // Si no es numérico, no matchea nada (evita false positives)
                          return false;
                        }

                        return (
                          venta.id.toString().includes(searchLower) ||
                          venta.cliente.toLowerCase().includes(searchLower) ||
                          venta.productos.toLowerCase().includes(searchLower) ||
                          venta.metodo_pago.toLowerCase().includes(searchLower) ||
                          formatDate(venta.fecha_venta).toLowerCase().includes(searchLower)
                        );
                      })
                      .map((venta) => {
                        // Determinar color según método de pago
                        let metodoBgColor = 'bg-blue-500/20';
                        let metodoTextColor = 'text-blue-600 dark:text-blue-400';
                        
                        if (venta.metodo_pago === 'Yape') {
                          metodoBgColor = 'bg-purple-500/20';
                          metodoTextColor = 'text-purple-600 dark:text-purple-400';
                        } else if (venta.metodo_pago === 'Efectivo') {
                          metodoBgColor = 'bg-green-500/20';
                          metodoTextColor = 'text-green-600 dark:text-green-400';
                        }
                        
                        return (
                          <tr
                            key={venta.id}
                            className="border-b border-white/5 dark:border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200 group"
                          >
                            <td className="py-4 px-4 text-sm text-gray-900 dark:text-white font-medium">
                              <span className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></span>
                                #{venta.id}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{venta.cliente}</td>
                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{venta.productos}</td>
                            <td className="py-4 px-4 text-sm">
                              <span className={`px-2 py-1 rounded-md ${metodoBgColor} ${metodoTextColor} text-xs font-semibold`}>
                                {venta.metodo_pago}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(Number(venta.precio_total))}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-xs">
                                {formatDate(venta.fecha_venta)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm">
                              {(() => {
                                const estado = estadosComprobantes[venta.id] || 'SIN ENVIAR';
                                let bgColor = 'bg-gray-500/20';
                                let textColor = 'text-gray-600 dark:text-gray-400';
                                let icon = 'fa-circle-xmark';
                                
                                if (estado === 'ACEPTADO') {
                                  bgColor = 'bg-green-500/20';
                                  textColor = 'text-green-600 dark:text-green-400';
                                  icon = 'fa-check-circle';
                                } else if (estado === 'RECHAZADO') {
                                  bgColor = 'bg-red-500/20';
                                  textColor = 'text-red-600 dark:text-red-400';
                                  icon = 'fa-times-circle';
                                } else if (estado === 'ENVIADO' || estado === 'FIRMADO') {
                                  bgColor = 'bg-blue-500/20';
                                  textColor = 'text-blue-600 dark:text-blue-400';
                                  icon = 'fa-paper-plane';
                                } else if (estado === 'PENDIENTE') {
                                  bgColor = 'bg-yellow-500/20';
                                  textColor = 'text-yellow-600 dark:text-yellow-400';
                                  icon = 'fa-hourglass-half';
                                }
                                
                                return (
                                  <span className={`px-2 py-1 rounded-md ${bgColor} ${textColor} text-xs font-semibold flex items-center gap-1 w-fit`}>
                                    <i className={`fas ${icon}`}></i>
                                    {estado}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="py-4 px-4 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedVenta(venta);
                                    setSunatModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 transition"
                                  title="Enviar a SUNAT"
                                >
                                  <i className="fas fa-file-invoice text-sm"></i>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedVenta(venta);
                                    setEmailModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 transition"
                                  title="Enviar por Email"
                                >
                                  <i className="fas fa-envelope text-sm"></i>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedVenta(venta);
                                    setBolletaModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30 transition"
                                  title="Ver Boleta"
                                >
                                  <i className="fas fa-receipt text-sm"></i>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedVenta(venta);
                                    setWhatsappModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 transition"
                                  title="Enviar por WhatsApp"
                                >
                                  <i className="fab fa-whatsapp text-sm"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <i className="fas fa-inbox text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                          <p className="text-gray-500 dark:text-gray-400">No hay ventas en este período</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ranking de Vendedores */}
          {reporte?.ranking && reporte.ranking.length > 0 && (
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <i className="fas fa-trophy mr-3 text-yellow-500"></i>
                  Ranking de Vendedores
                </h2>
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 text-xs font-semibold">
                  Top {reporte.ranking.length}
                </span>
              </div>

              {/* Lista */}
              <div className="space-y-3">
                {(() => {
                  const maxTotal = Math.max(...reporte.ranking.map((v) => v.total || 0), 1);

                  return reporte.ranking.map((vendedor, index) => {
                    const percent = Math.round(((vendedor.total || 0) / maxTotal) * 100);

                    const medalLabel =
                      index === 0 ? 'Líder' : index === 1 ? '2do lugar' : index === 2 ? '3er lugar' : `#${index + 1}`;

                    const badgeClass =
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/40'
                        : index === 1
                        ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-400/40'
                        : index === 2
                        ? 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-500/40'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/40';

                    const pillClass =
                      index === 0
                        ? 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-300'
                        : index === 1
                        ? 'bg-slate-500/10 text-slate-700 dark:text-slate-300'
                        : index === 2
                        ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                        : 'bg-blue-500/10 text-blue-700 dark:text-blue-300';

                    return (
                      <div
                        key={vendedor.id}
                        className="relative overflow-hidden rounded-xl backdrop-blur-sm bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 p-4 hover:border-white/60 dark:hover:border-white/20 transition-all duration-300 group"
                      >
                        {/* hover glow */}
                        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-yellow-500/10 via-purple-500/5 to-blue-500/10" />

                        <div className="relative flex items-center gap-4">
                          {/* Rank badge */}
                          <div className="relative">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-lg ${badgeClass}`}
                            >
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  {vendedor.nombre}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${pillClass}`}>
                                    {medalLabel}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400 inline-flex items-center">
                                    <i className="fas fa-shopping-bag mr-1 text-blue-500"></i>
                                    {vendedor.cantidad} ventas
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-xl font-bold text-green-700 dark:text-green-400 leading-none">
                                  {formatCurrency(vendedor.total)}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {percent}% del líder
                                </p>
                              </div>
                            </div>

                            {/* progress */}
                            <div className="mt-3">
                              <div className="h-2 rounded-full bg-gray-200/70 dark:bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Modales */}
          <EmailModal
            isOpen={emailModalOpen}
            onClose={() => {
              setEmailModalOpen(false);
              setSelectedVenta(null);
            }}
            venta={selectedVenta}
          />
          <WhatsAppModal
            isOpen={whatsappModalOpen}
            onClose={() => {
              setWhatsappModalOpen(false);
              setSelectedVenta(null);
            }}
            venta={selectedVenta}
          />
          <BolletaPrintModal
            isOpen={bolletaModalOpen}
            onClose={() => {
              setBolletaModalOpen(false);
              setSelectedVenta(null);
            }}
            venta={selectedVenta}
          />
          <SunatModal
            isOpen={sunatModalOpen}
            onClose={() => {
              setSunatModalOpen(false);
              setSelectedVenta(null);
            }}
            venta={selectedVenta}
            onSuccess={() => {
              setSunatModalOpen(false);
              setSelectedVenta(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default Reports;
