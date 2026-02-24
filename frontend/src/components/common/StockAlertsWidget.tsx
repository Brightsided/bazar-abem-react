import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { getAlertasStock, AlertaStock } from '@/services/almacenamientoService';

export default function StockAlertsWidget() {
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAlertas();
    const interval = setInterval(cargarAlertas, 60000);
    return () => clearInterval(interval);
  }, []);

  const cargarAlertas = async () => {
    try {
      const data = await getAlertasStock('ACTIVA');
      setAlertas(data.slice(0, 5));
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-surface-100 dark:bg-surface-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
          <AlertCircle className="text-red-500" size={16} />
          Alertas de Stock
        </h3>
        {alertas.length > 0 && (
          <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
            {alertas.length}
          </span>
        )}
      </div>

      {alertas.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-mint-500/10 flex items-center justify-center mx-auto mb-2">
            <i className="fas fa-check text-mint-500"></i>
          </div>
          <p className="text-xs text-surface-400 dark:text-surface-500">
            No hay alertas de stock bajo
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="flex items-start gap-2.5 p-2.5 bg-red-500/5 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-lg"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                  {alerta.producto.nombre}
                </p>
                <p className="text-[11px] text-surface-500 dark:text-surface-400">
                  Stock: <span className="font-semibold text-red-600 dark:text-red-400">{alerta.stock_actual}</span> / Mín: {alerta.stock_minimo}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {alertas.length > 0 && (
        <a
          href="/almacenamiento"
          className="mt-3 block text-center text-xs font-semibold text-mint-600 dark:text-mint-400 hover:text-mint-700 dark:hover:text-mint-300 transition-colors"
        >
          Ver todas las alertas →
        </a>
      )}
    </div>
  );
}
