import { useEffect, useState } from 'react';
import { AlertCircle, TrendingDown } from 'lucide-react';
import { getAlertasStock, AlertaStock } from '@/services/almacenamientoService';

export default function StockAlertsWidget() {
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAlertas();
    const interval = setInterval(cargarAlertas, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const cargarAlertas = async () => {
    try {
      const data = await getAlertasStock('ACTIVA');
      setAlertas(data.slice(0, 5)); // Mostrar solo las 5 primeras
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          Alertas de Stock
        </h3>
        {alertas.length > 0 && (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {alertas.length}
          </span>
        )}
      </div>

      {alertas.length === 0 ? (
        <div className="text-center py-8">
          <TrendingDown className="mx-auto text-green-600 mb-2" size={32} />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No hay alertas de stock bajo
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {alerta.producto.nombre}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Stock: {alerta.stock_actual} / Mínimo: {alerta.stock_minimo}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {alertas.length > 0 && (
        <a
          href="/almacenamiento"
          className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Ver todas las alertas →
        </a>
      )}
    </div>
  );
}
