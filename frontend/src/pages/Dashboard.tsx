import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/services/reportesService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import StatsCard from '@/components/common/StatsCard';
import Calculator from '@/components/common/Calculator';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: reportesService.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 animate-spin">
            <i className="fas fa-spinner text-2xl text-white"></i>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-xl blur-xl"></div>
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            <i className="fas fa-chart-line mr-3"></i>
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center">
            <i className="fas fa-calendar-today mr-2 text-blue-500"></i>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Ventas Hoy"
          value={stats?.ventasHoy || 0}
          icon="fa-shopping-cart"
          color="primary"
        />
        <StatsCard
          title="Ingresos Hoy"
          value={formatCurrency(stats?.totalHoy || 0)}
          icon="fa-dollar-sign"
          color="success"
        />
        <StatsCard
          title="Ventas Semana"
          value={stats?.ventasSemana || 0}
          icon="fa-calendar-week"
          color="secondary"
        />
        <StatsCard
          title="Promedio por Venta"
          value={formatCurrency(stats?.promedioVenta || 0)}
          icon="fa-chart-line"
          color="info"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas Ventas */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <i className="fas fa-history mr-3 text-blue-500"></i>
                Últimas 7 Ventas
              </h2>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                {stats?.ultimasVentas?.length || 0} registros
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 dark:border-white/5">
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.ultimasVentas && stats.ultimasVentas.length > 0 ? (
                    stats.ultimasVentas.map((venta) => (
                      <tr
                        key={venta.id}
                        className="border-b border-white/5 dark:border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200 group"
                      >
                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-white font-medium">
                          <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></span>
                            {venta.cliente}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {venta.productos}
                        </td>
                        <td className="py-4 px-4 text-sm font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(Number(venta.precio_total))}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-xs">
                            {formatDate(venta.fecha_venta)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <i className="fas fa-inbox text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                          <p className="text-gray-500 dark:text-gray-400">No hay ventas registradas</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Calculadora */}
        <div className="lg:col-span-1">
          <Calculator />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
