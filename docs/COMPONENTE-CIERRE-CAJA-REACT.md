# 🎨 Componente React - Cierre de Caja

## Crear Página Principal

Crea el archivo `frontend/src/pages/CierreCaja.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cierreCajaService } from '@/services/cierreCajaService';
import { showSuccess, showError } from '@/utils/alerts';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useAuthStore } from '@/store/authStore';

const CierreCaja = () => {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'resumen' | 'historial'>('resumen');
  const [cierreCajaActual, setCierreCajaActual] = useState<any>(null);
  const [dineroReal, setDineroReal] = useState('');
  const [notas, setNotas] = useState('');
  const [showCerrarModal, setShowCerrarModal] = useState(false);

  // Obtener resumen del día
  const { data: resumen, isLoading: loadingResumen } = useQuery({
    queryKey: ['cierre-caja-resumen'],
    queryFn: () => cierreCajaService.obtenerResumen(),
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  // Obtener historial de cierres
  const { data: historial, isLoading: loadingHistorial } = useQuery({
    queryKey: ['cierre-caja-historial'],
    queryFn: () => cierreCajaService.obtenerCierres(),
  });

  // Mutation para abrir caja
  const abrirCajaMutation = useMutation({
    mutationFn: cierreCajaService.abrirCaja,
    onSuccess: (data) => {
      showSuccess('Caja abierta exitosamente');
      setCierreCajaActual(data.cierre_caja);
      queryClient.invalidateQueries({ queryKey: ['cierre-caja-resumen'] });
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || 'Error al abrir caja');
    },
  });

  // Mutation para cerrar caja
  const cerrarCajaMutation = useMutation({
    mutationFn: (data: {
      cierre_caja_id: number;
      dinero_real_efectivo: number;
      notas?: string;
    }) => cierreCajaService.cerrarCaja(data.cierre_caja_id, data.dinero_real_efectivo, data.notas),
    onSuccess: (data) => {
      showSuccess('Caja cerrada exitosamente');
      setShowCerrarModal(false);
      setDineroReal('');
      setNotas('');
      queryClient.invalidateQueries({ queryKey: ['cierre-caja-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['cierre-caja-historial'] });
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || 'Error al cerrar caja');
    },
  });

  const handleAbrirCaja = () => {
    abrirCajaMutation.mutate();
  };

  const handleCerrarCaja = () => {
    if (!dineroReal) {
      showError('Ingresa el dinero real contado');
      return;
    }

    if (!resumen?.cierre_caja?.id) {
      showError('No hay caja abierta');
      return;
    }

    cerrarCajaMutation.mutate({
      cierre_caja_id: resumen.cierre_caja.id,
      dinero_real_efectivo: parseFloat(dineroReal),
      notas,
    });
  };

  if (loadingResumen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 animate-spin">
            <i className="fas fa-spinner text-2xl text-white"></i>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando cierre de caja...</p>
        </div>
      </div>
    );
  }

  const caja = resumen?.cierre_caja;
  const estado = caja?.estado;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-xl blur-xl"></div>
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            <i className="fas fa-cash-register mr-3"></i>
            Cierre de Caja
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>
            Gestiona la apertura y cierre de tu caja diaria
          </p>
        </div>
      </div>

      {/* Estado de Caja */}
      <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            <i className="fas fa-box mr-2 text-blue-500"></i>
            Estado de Caja
          </h2>
          <div
            className={`px-4 py-2 rounded-full font-semibold text-sm ${
              estado === 'ABIERTO'
                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                : estado === 'CERRADO'
                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
            }`}
          >
            {estado === 'ABIERTO' ? '🟢 ABIERTA' : estado === 'CERRADO' ? '🔵 CERRADA' : '⚫ CERRADA'}
          </div>
        </div>

        {estado === 'ABIERTO' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Abierta desde</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {caja?.fecha_apertura ? formatDate(caja.fecha_apertura) : 'Hoy'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vendedor</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{usuario?.nombre}</p>
              </div>
            </div>

            <button
              onClick={handleCerrarCaja}
              disabled={cerrarCajaMutation.isPending}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-lock mr-2"></i>
              {cerrarCajaMutation.isPending ? 'Cerrando...' : 'Cerrar Caja'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleAbrirCaja}
            disabled={abrirCajaMutation.isPending}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-unlock mr-2"></i>
            {abrirCajaMutation.isPending ? 'Abriendo...' : 'Abrir Caja'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'resumen'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white/50 dark:bg-white/5 border border-white/20 text-gray-700 dark:text-gray-300'
          }`}
        >
          <i className="fas fa-chart-bar mr-2"></i>
          Resumen del Día
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'historial'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white/50 dark:bg-white/5 border border-white/20 text-gray-700 dark:text-gray-300'
          }`}
        >
          <i className="fas fa-history mr-2"></i>
          Historial
        </button>
      </div>

      {/* Resumen del Día */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-blue-600/20 to-blue-600/10 border border-white/20 p-6">
              <div className="relative">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Ventas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {resumen?.ventas || 0}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-green-600/20 to-green-600/10 border border-white/20 p-6">
              <div className="relative">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Ingresos</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(resumen?.totales?.total_ventas || 0)}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-purple-600/20 to-purple-600/10 border border-white/20 p-6">
              <div className="relative">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Efectivo Esperado</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(resumen?.totales?.efectivo || 0)}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-orange-600/20 to-orange-600/10 border border-white/20 p-6">
              <div className="relative">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Otros Métodos</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency((resumen?.totales?.tarjeta || 0) + (resumen?.totales?.yape || 0))}
                </p>
              </div>
            </div>
          </div>

          {/* Desglose por Método */}
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              <i className="fas fa-credit-card mr-2 text-blue-500"></i>
              Desglose por Método de Pago
            </h3>

            <div className="space-y-3">
              {/* Efectivo */}
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <i className="fas fa-money-bill text-green-500"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Efectivo</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {resumen?.totales?.efectivo ? 'Transacciones' : '0 transacciones'}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(resumen?.totales?.efectivo || 0)}
                </p>
              </div>

              {/* Tarjeta */}
              <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <i className="fas fa-credit-card text-blue-500"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Tarjeta</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Crédito/Débito
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(resumen?.totales?.tarjeta || 0)}
                </p>
              </div>

              {/* Yape */}
              <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <i className="fas fa-mobile-alt text-purple-500"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Yape</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Billetera Digital
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(resumen?.totales?.yape || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      {activeTab === 'historial' && (
        <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            <i className="fas fa-history mr-2 text-blue-500"></i>
            Historial de Cierres
          </h3>

          {loadingHistorial ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
              <p className="text-gray-600 dark:text-gray-400">Cargando historial...</p>
            </div>
          ) : historial?.cierres && historial.cierres.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Vendedor
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Total Ventas
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Diferencia
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historial.cierres.map((cierre: any) => (
                    <tr
                      key={cierre.id}
                      className="border-b border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {formatDate(cierre.fecha_cierre)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {cierre.usuario.nombre}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(cierre.total_ventas)}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold">
                        <span
                          className={
                            cierre.diferencia === 0
                              ? 'text-gray-600 dark:text-gray-400'
                              : cierre.diferencia > 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }
                        >
                          {cierre.diferencia === 0
                            ? '✓ Cuadra'
                            : cierre.diferencia > 0
                            ? `+${formatCurrency(cierre.diferencia)}`
                            : formatCurrency(cierre.diferencia)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            cierre.estado === 'APROBADO'
                              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                              : cierre.estado === 'CERRADO'
                              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                              : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {cierre.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-inbox text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
              <p className="text-gray-600 dark:text-gray-400">No hay cierres registrados</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Cerrar Caja */}
      {showCerrarModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-white/10 p-8 max-w-md w-full shadow-2xl">
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <i className="fas fa-lock text-red-600 text-2xl"></i>
                  Cerrar Caja
                </h2>
                <button
                  onClick={() => setShowCerrarModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Información */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                  Dinero Esperado (Efectivo)
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(resumen?.totales?.efectivo || 0)}
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Dinero Real */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-money-bill mr-2 text-green-500"></i>
                    Dinero Real Contado (S/.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dineroReal}
                    onChange={(e) => setDineroReal(e.target.value)}
                    placeholder="Ingresa el dinero contado"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-lg font-semibold"
                  />
                </div>

                {/* Diferencia Preview */}
                {dineroReal && (
                  <div
                    className={`p-4 rounded-lg ${
                      Number(dineroReal) === (resumen?.totales?.efectivo || 0)
                        ? 'bg-green-500/10 border border-green-500/20'
                        : Number(dineroReal) > (resumen?.totales?.efectivo || 0)
                        ? 'bg-yellow-500/10 border border-yellow-500/20'
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Diferencia</p>
                    <p
                      className={`text-lg font-bold ${
                        Number(dineroReal) === (resumen?.totales?.efectivo || 0)
                          ? 'text-green-600 dark:text-green-400'
                          : Number(dineroReal) > (resumen?.totales?.efectivo || 0)
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {Number(dineroReal) === (resumen?.totales?.efectivo || 0)
                        ? '✓ Cuadra Perfecto'
                        : Number(dineroReal) > (resumen?.totales?.efectivo || 0)
                        ? `+${formatCurrency(Number(dineroReal) - (resumen?.totales?.efectivo || 0))} (Sobrante)`
                        : `${formatCurrency(Number(dineroReal) - (resumen?.totales?.efectivo || 0))} (Faltante)`}
                    </p>
                  </div>
                )}

                {/* Notas */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-sticky-note mr-2 text-purple-500"></i>
                    Notas (Opcional)
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej: Cliente dio propina, error en cambio, etc."
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowCerrarModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCerrarCaja}
                  disabled={cerrarCajaMutation.isPending || !dineroReal}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cerrarCajaMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Cerrando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock mr-2"></i>
                      Confirmar Cierre
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CierreCaja;
```

## Actualizar App.tsx

```typescript
import CierreCaja from './pages/CierreCaja';

// En el componente App, dentro de las rutas:
<Route path="cierre-caja" element={<CierreCaja />} />
```

## Actualizar Sidebar

Edita `frontend/src/components/layout/Sidebar.tsx` y agrega:

```typescript
<NavLink
  to="/cierre-caja"
  className={({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
    }`
  }
>
  <i className="fas fa-cash-register text-lg"></i>
  <span>Cierre de Caja</span>
</NavLink>
```

## Características Implementadas

✅ Abrir caja al inicio del turno
✅ Resumen en tiempo real de ventas del día
✅ Desglose por método de pago
✅ Cierre de caja con dinero real
✅ Cálculo automático de diferencias
✅ Notas y observaciones
✅ Historial de cierres
✅ Estados visuales (Abierta, Cerrada, Aprobada)
✅ Interfaz moderna y responsiva
✅ Validaciones en tiempo real

---

**Próximo paso**: Crear componente de aprobación para supervisores
