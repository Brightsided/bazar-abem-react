import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/services/reportesService';
import { facturacionService } from '@/services/facturacionService';
import { formatCurrency, formatDate, formatDateForInput } from '@/utils/formatters';
import { FiltroReporte, VentaDetallada } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { SalesChart } from '@/components/charts/SalesChart';
import { PaymentMethodChart } from '@/components/charts/PaymentMethodChart';
import { EmailModal } from '@/components/modals/EmailModal';
import { WhatsAppModal } from '@/components/modals/WhatsAppModal';
import { BolletaPrintModal } from '@/components/modals/BolletaPrintModal';
import { SunatModal } from '@/components/modals/SunatModal';
import SunatIcon from '@/assets/icons/sunat.svg';
import { TrendingUp, CreditCard } from 'lucide-react';

const Reports = () => {
  const [filtro, setFiltro] = useState<FiltroReporte>({ filtro: 'hoy' });
  const [selectedVenta, setSelectedVenta] = useState<VentaDetallada | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [bolletaModalOpen, setBolletaModalOpen] = useState(false);
  const [sunatModalOpen, setSunatModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadosComprobantes, setEstadosComprobantes] = useState<Record<number, string>>({});
  const debouncedFiltro = useDebounce(filtro, 300);

  const { data: reporte, isLoading } = useQuery({
    queryKey: ['reportes', debouncedFiltro],
    queryFn: () => reportesService.getReporteVentas(debouncedFiltro),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const obtenerEstadoComprobante = async (ventaId: number) => {
    try {
      const resultado = await facturacionService.obtenerEstado(ventaId);
      setEstadosComprobantes(prev => ({
        ...prev, [ventaId]: resultado.success && resultado.comprobante ? resultado.comprobante.estado : 'SIN ENVIAR',
      }));
    } catch {
      setEstadosComprobantes(prev => ({ ...prev, [ventaId]: 'ERROR' }));
    }
  };

  const handleSunatSuccess = async (ventaId: number) => {
    await obtenerEstadoComprobante(ventaId);
  };

  useEffect(() => {
    if (reporte?.ventas) {
      reporte.ventas.forEach(venta => {
        if (!estadosComprobantes[venta.id]) obtenerEstadoComprobante(venta.id);
      });
    }
  }, [reporte?.ventas, estadosComprobantes]);

  const handleFiltroChange = useCallback((nuevoFiltro: string) => {
    if (nuevoFiltro === 'personalizado') {
      const hoy = new Date();
      setFiltro({ filtro: 'personalizado', fecha_inicio: formatDateForInput(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), fecha_fin: formatDateForInput(hoy) });
    } else { setFiltro({ filtro: nuevoFiltro as any }); }
  }, []);

  const filterPeriods = [
    { value: 'hoy', label: 'Hoy', icon: 'fa-calendar-day' },
    { value: 'semana', label: 'Semana', icon: 'fa-calendar-week' },
    { value: 'mes', label: 'Mes', icon: 'fa-calendar-alt' },
    { value: 'ano', label: 'Año', icon: 'fa-calendar' },
    { value: 'personalizado', label: 'Personalizado', icon: 'fa-sliders-h' },
  ];

  const inputClass = "w-full px-3 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Reportes</h1>
        <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">Análisis detallado y estadísticas de ventas</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
        <p className="text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">Período</p>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {filterPeriods.map((p) => (
            <button key={p.value} onClick={() => handleFiltroChange(p.value)}
              className={`rounded-lg p-2.5 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 border ${
                filtro.filtro === p.value
                  ? 'bg-mint-500/10 dark:bg-mint-500/15 border-mint-500 text-mint-700 dark:text-mint-400'
                  : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600'
              }`}>
              <i className={`fas ${p.icon} text-[10px]`}></i>{p.label}
            </button>
          ))}
        </div>
        {filtro.filtro === 'personalizado' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
            <div>
              <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5">Inicio</label>
              <input type="date" value={filtro.fecha_inicio} onChange={(e) => setFiltro({ ...filtro, fecha_inicio: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5">Fin</label>
              <input type="date" value={filtro.fecha_fin} onChange={(e) => setFiltro({ ...filtro, fecha_fin: e.target.value })} className={inputClass} />
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-mint-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-surface-400 dark:text-surface-500">Cargando reportes...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Ventas', value: reporte?.ventas.length || 0, icon: 'fa-shopping-cart', color: 'text-mint-500 bg-mint-500/10', sub: 'Transacciones registradas' },
              { label: 'Ingresos Totales', value: formatCurrency(reporte?.totalVentas || 0), icon: 'fa-dollar-sign', color: 'text-emerald-500 bg-emerald-500/10', sub: 'Ingresos del período' },
              { label: 'Promedio por Venta', value: formatCurrency(reporte?.ventas.length ? (reporte?.totalVentas || 0) / reporte.ventas.length : 0), icon: 'fa-calculator', color: 'text-violet-500 bg-violet-500/10', sub: 'Por transacción' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{stat.label}</span>
                  <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <i className={`fas ${stat.icon} text-sm`}></i>
                  </div>
                </div>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{stat.value}</p>
                <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-mint-500" />Ventas por Fecha
                </h2>
                <span className="text-[10px] font-semibold text-mint-600 dark:text-mint-400 bg-mint-500/10 px-2 py-0.5 rounded-full">Tendencia</span>
              </div>
              {reporte && Object.keys(reporte.ventasPorFecha).length > 0 ? (
                <SalesChart data={reporte.ventasPorFecha} />
              ) : (
                <div className="h-72 flex items-center justify-center text-sm text-surface-400">No hay datos disponibles</div>
              )}
            </div>
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />Métodos de Pago
                </h2>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Distribución</span>
              </div>
              {reporte && Object.keys(reporte.metodosPago).length > 0 ? (
                <PaymentMethodChart data={reporte.metodosPago} />
              ) : (
                <div className="h-72 flex items-center justify-center text-sm text-surface-400">No hay datos disponibles</div>
              )}
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800">
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
                <i className="fas fa-list text-violet-500 text-xs"></i>Detalle de Ventas
              </h2>
              <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full">{reporte?.ventas?.length || 0} registros</span>
            </div>

            <div className="px-5 py-3 border-b border-surface-100 dark:border-surface-800">
              <div className="relative">
                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm"></i>
                <input type="text" placeholder="Buscar por ID, Cliente, Productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 text-sm placeholder-surface-400 dark:placeholder-surface-600 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-800">
                    {['ID', 'Cliente', 'Productos', 'Método', 'Total', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reporte?.ventas && reporte.ventas.length > 0 ? (
                    reporte.ventas
                      .filter((venta) => {
                        const raw = searchTerm.trim();
                        const searchLower = raw.toLowerCase();
                        if (searchLower.startsWith('#')) {
                          const idQuery = searchLower.replace(/^#+/, '').trim();
                          if (!idQuery) return true;
                          if (/^\d+$/.test(idQuery)) return venta.id === Number(idQuery);
                          return false;
                        }
                        return venta.id.toString().includes(searchLower) || venta.cliente.toLowerCase().includes(searchLower) || venta.productos.toLowerCase().includes(searchLower) || venta.metodo_pago.toLowerCase().includes(searchLower) || formatDate(venta.fecha_venta).toLowerCase().includes(searchLower);
                      })
                      .map((venta) => {
                        const metodoStyles: Record<string, string> = {
                          'Yape': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                          'Efectivo': 'bg-mint-500/10 text-mint-700 dark:text-mint-400',
                          'Tarjeta De Credito/Debito': 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
                        };
                        const estado = estadosComprobantes[venta.id] || 'SIN ENVIAR';
                        const estadoStyles: Record<string, { bg: string; icon: string }> = {
                          'ACEPTADO': { bg: 'bg-mint-500/10 text-mint-700 dark:text-mint-400', icon: 'fa-check-circle' },
                          'RECHAZADO': { bg: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: 'fa-times-circle' },
                          'ENVIADO': { bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', icon: 'fa-paper-plane' },
                          'FIRMADO': { bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', icon: 'fa-paper-plane' },
                          'PENDIENTE': { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: 'fa-hourglass-half' },
                          'SIN ENVIAR': { bg: 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400', icon: 'fa-circle-xmark' },
                          'ERROR': { bg: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: 'fa-exclamation-circle' },
                        };
                        const es = estadoStyles[estado] || estadoStyles['SIN ENVIAR'];
                        return (
                          <tr key={venta.id} className="border-b border-surface-50 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                            <td className="py-3 px-4 text-sm text-surface-900 dark:text-surface-100 font-medium">#{venta.id}</td>
                            <td className="py-3 px-4 text-sm text-surface-900 dark:text-surface-100">{venta.cliente}</td>
                            <td className="py-3 px-4 text-sm text-surface-500 dark:text-surface-400 max-w-[200px] truncate">{venta.productos}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${metodoStyles[venta.metodo_pago] || ''}`}>{venta.metodo_pago}</span>
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-mint-600 dark:text-mint-400">{formatCurrency(Number(venta.precio_total))}</td>
                            <td className="py-3 px-4 text-sm text-surface-400 dark:text-surface-500">
                              <span className="px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-xs">{formatDate(venta.fecha_venta)}</span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 w-fit ${es.bg}`}>
                                <i className={`fas ${es.icon} text-[9px]`}></i>{estado}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex gap-1">
                                <button onClick={() => { setSelectedVenta(venta); setSunatModalOpen(true); }} className="p-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" title="SUNAT">
                                  <img src={SunatIcon} alt="SUNAT" className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => { setSelectedVenta(venta); setEmailModalOpen(true); }} className="p-1.5 rounded-md bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition-colors" title="Email">
                                  <i className="fas fa-envelope text-xs"></i>
                                </button>
                                <button onClick={() => { setSelectedVenta(venta); setBolletaModalOpen(true); }} className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors" title="Boleta">
                                  <i className="fas fa-receipt text-xs"></i>
                                </button>
                                <button onClick={() => { setSelectedVenta(venta); setWhatsappModalOpen(true); }} className="p-1.5 rounded-md bg-mint-500/10 text-mint-500 hover:bg-mint-500/20 transition-colors" title="WhatsApp">
                                  <i className="fab fa-whatsapp text-xs"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <i className="fas fa-inbox text-3xl text-surface-300 dark:text-surface-700 mb-2 block"></i>
                        <p className="text-sm text-surface-400 dark:text-surface-500">No hay ventas en este período</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Seller Ranking */}
          {reporte?.ranking && reporte.ranking.length > 0 && (
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
                  <i className="fas fa-trophy text-amber-500 text-xs"></i>Ranking de Vendedores
                </h2>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Top {reporte.ranking.length}</span>
              </div>
              <div className="space-y-2">
                {(() => {
                  const maxTotal = Math.max(...reporte.ranking.map((v) => v.total || 0), 1);
                  return reporte.ranking.map((vendedor, index) => {
                    const percent = Math.round(((vendedor.total || 0) / maxTotal) * 100);
                    const medals = ['🥇', '🥈', '🥉'];
                    return (
                      <div key={vendedor.id} className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center font-bold text-sm">
                            {medals[index] || `#${index + 1}`}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-surface-900 dark:text-surface-50 truncate">{vendedor.nombre}</p>
                                <p className="text-[11px] text-surface-400 dark:text-surface-500">{vendedor.cantidad} ventas</p>
                              </div>
                              <p className="text-sm font-bold text-mint-600 dark:text-mint-400">{formatCurrency(vendedor.total)}</p>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
                              <div className="h-full rounded-full bg-mint-500" style={{ width: `${percent}%` }} />
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

          {/* Modals */}
          <EmailModal isOpen={emailModalOpen} onClose={() => { setEmailModalOpen(false); setSelectedVenta(null); }} venta={selectedVenta} />
          <WhatsAppModal isOpen={whatsappModalOpen} onClose={() => { setWhatsappModalOpen(false); setSelectedVenta(null); }} venta={selectedVenta} />
          <BolletaPrintModal isOpen={bolletaModalOpen} onClose={() => { setBolletaModalOpen(false); setSelectedVenta(null); }} venta={selectedVenta} />
          <SunatModal isOpen={sunatModalOpen} onClose={() => { setSunatModalOpen(false); setSelectedVenta(null); }} venta={selectedVenta}
            onSuccess={async (ventaId) => { await handleSunatSuccess(ventaId); setSunatModalOpen(false); setSelectedVenta(null); }} />
        </>
      )}
    </div>
  );
};

export default Reports;
