import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/services/reportesService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import StatsCard from '@/components/common/StatsCard';
import Calculator from '@/components/common/Calculator';
import StockAlertsWidget from '@/components/common/StockAlertsWidget';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: reportesService.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-mint-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-surface-400 dark:text-surface-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Dashboard
        </h1>
        <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Ventas Hoy" value={stats?.ventasHoy || 0} icon="fa-shopping-cart" color="primary" />
        <StatsCard title="Ingresos Hoy" value={formatCurrency(stats?.totalHoy || 0)} icon="fa-dollar-sign" color="success" />
        <StatsCard title="Ventas Semana" value={stats?.ventasSemana || 0} icon="fa-calendar-week" color="secondary" />
        <StatsCard title="Promedio por Venta" value={formatCurrency(stats?.promedioVenta || 0)} icon="fa-chart-line" color="info" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800">
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
                <i className="fas fa-history text-mint-500 text-xs"></i>
                Últimas 7 Ventas
              </h2>
              <span className="text-[11px] font-semibold text-mint-600 dark:text-mint-400 bg-mint-500/10 px-2.5 py-1 rounded-full">
                {stats?.ultimasVentas?.length || 0} registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-800">
                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Cliente</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Productos</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Total</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.ultimasVentas && stats.ultimasVentas.length > 0 ? (
                    stats.ultimasVentas.map((venta) => (
                      <tr key={venta.id} className="border-b border-surface-50 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                        <td className="py-3 px-5 text-sm text-surface-900 dark:text-surface-100 font-medium">
                          {venta.cliente}
                        </td>
                        <td className="py-3 px-5 text-sm text-surface-500 dark:text-surface-400">
                          {venta.productos}
                        </td>
                        <td className="py-3 px-5 text-sm font-semibold text-mint-600 dark:text-mint-400">
                          {formatCurrency(Number(venta.precio_total))}
                        </td>
                        <td className="py-3 px-5 text-sm text-surface-400 dark:text-surface-500">
                          <span className="px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-xs">
                            {formatDate(venta.fecha_venta)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <i className="fas fa-inbox text-3xl text-surface-300 dark:text-surface-700 mb-2 block"></i>
                        <p className="text-sm text-surface-400 dark:text-surface-500">No hay ventas registradas</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <Calculator />
          <StockAlertsWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
