import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cierreCajaService } from '../services/cierreCajaService';
import { useAuthStore } from '../store/authStore';

function fmtMoney(value: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export default function CierreCaja() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [montoInicial, setMontoInicial] = useState<string>('');
  const [obsApertura, setObsApertura] = useState<string>('');

  const [montoFinal, setMontoFinal] = useState<string>('');
  const [obsCierre, setObsCierre] = useState<string>('');

  const isAdmin = user?.rol === 'Administrador';

  const estadoQuery = useQuery({
    queryKey: ['cierreCaja', 'estado'],
    queryFn: () => cierreCajaService.getEstado(),
  });

  const previewQuery = useQuery({
    queryKey: ['cierreCaja', 'preview'],
    queryFn: () => cierreCajaService.preview(),
    enabled: false,
  });

  const cierresQuery = useQuery({
    queryKey: ['cierreCaja', 'lista'],
    queryFn: () => cierreCajaService.listar(),
  });

  const abrirMutation = useMutation({
    mutationFn: (data: { monto_inicial: number; observaciones?: string }) => cierreCajaService.abrir(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cierreCaja'] });
      setMontoInicial('');
      setObsApertura('');
    },
  });

  const cerrarMutation = useMutation({
    mutationFn: (data: { monto_final: number; observaciones?: string }) => cierreCajaService.cerrar(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cierreCaja'] });
      setMontoFinal('');
      setObsCierre('');
    },
  });

  const abierto = estadoQuery.data?.abierto ?? null;

  const accionesDisabled = estadoQuery.isLoading || abrirMutation.isPending || cerrarMutation.isPending;

  const errorMsg = useMemo(() => {
    const err = (estadoQuery.error || previewQuery.error || cierresQuery.error || abrirMutation.error || cerrarMutation.error) as any;
    if (!err) return null;
    return err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Error desconocido';
  }, [estadoQuery.error, previewQuery.error, cierresQuery.error, abrirMutation.error, cerrarMutation.error]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section (igual estilo que módulos existentes, ej: Registrar Venta) */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-xl blur-xl"></div>
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                <i className="fas fa-cash-register mr-3"></i>
                Cierre de Caja
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center">
                <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                Apertura/cierre y resumen de ventas por método de pago
              </p>
            </div>

            <div className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 self-start">
              <p className="text-xs text-gray-500 dark:text-gray-400">Usuario</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.nombre ?? '-'} ({user?.rol ?? '-'})</p>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
          <p className="text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* Estado caja */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Estado actual</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {abierto ? 'Caja abierta' : 'No hay caja abierta'}
              </p>
            </div>

            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              abierto
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30'
                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10'
            }`}>
              {abierto ? 'ABIERTO' : 'CERRADO'}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Apertura</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {abierto?.fecha_apertura ? fmtDateTime(abierto.fecha_apertura) : '-'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Monto inicial</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {abierto ? fmtMoney(Number(abierto.monto_inicial)) : '-'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => previewQuery.refetch()}
              disabled={accionesDisabled}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
            >
              <i className="fas fa-chart-pie mr-2"></i>
              Ver Preview
            </button>

            {!abierto && (
              <button
                onClick={() => {
                  const mi = Number(montoInicial || '0');
                  abrirMutation.mutate({ monto_inicial: isNaN(mi) ? 0 : mi, observaciones: obsApertura || undefined });
                }}
                disabled={accionesDisabled}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
              >
                <i className="fas fa-lock-open mr-2"></i>
                Abrir Caja
              </button>
            )}

            {abierto && (
              <button
                onClick={() => {
                  const mf = Number(montoFinal || '0');
                  cerrarMutation.mutate({ monto_final: isNaN(mf) ? 0 : mf, observaciones: obsCierre || undefined });
                }}
                disabled={accionesDisabled}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-rose-500/30"
              >
                <i className="fas fa-lock mr-2"></i>
                Cerrar Caja
              </button>
            )}
          </div>

          {/* Formularios */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Apertura</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Solo aplica si no hay caja abierta.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Monto inicial (S/)</label>
                  <input
                    type="number"
                    value={montoInicial}
                    onChange={(e) => setMontoInicial(e.target.value)}
                    disabled={!!abierto}
                    className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-900/40 border border-gray-200/70 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    placeholder="Ej: 50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
                  <textarea
                    value={obsApertura}
                    onChange={(e) => setObsApertura(e.target.value)}
                    disabled={!!abierto}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-900/40 border border-gray-200/70 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Cierre</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Solo aplica si hay caja abierta.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Monto final contado (S/)</label>
                  <input
                    type="number"
                    value={montoFinal}
                    onChange={(e) => setMontoFinal(e.target.value)}
                    disabled={!abierto}
                    className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-900/40 border border-gray-200/70 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    placeholder="Ej: 120.50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
                  <textarea
                    value={obsCierre}
                    onChange={(e) => setObsCierre(e.target.value)}
                    disabled={!abierto}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-900/40 border border-gray-200/70 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview card */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Preview</h2>
            {previewQuery.isFetching ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">Calculando...</span>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">Actualizable</span>
            )}
          </div>

          {!previewQuery.data ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300/70 dark:border-white/10 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Presiona <b>Ver Preview</b> para calcular totales.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Rango</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {fmtDateTime(previewQuery.data.rango.desde)} → {fmtDateTime(previewQuery.data.rango.hasta)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ventas</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{previewQuery.data.totales.cantidad_ventas}</p>
                </div>
                <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{fmtMoney(previewQuery.data.totales.total_ventas)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Por método de pago</p>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Efectivo</span><b className="text-gray-900 dark:text-white">{fmtMoney(previewQuery.data.totales.total_efectivo)}</b></div>
                  <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Yape</span><b className="text-gray-900 dark:text-white">{fmtMoney(previewQuery.data.totales.total_yape)}</b></div>
                  <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Plin</span><b className="text-gray-900 dark:text-white">{fmtMoney(previewQuery.data.totales.total_plin)}</b></div>
                  <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Tarjeta</span><b className="text-gray-900 dark:text-white">{fmtMoney(previewQuery.data.totales.total_tarjeta)}</b></div>
                  <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Transferencia</span><b className="text-gray-900 dark:text-white">{fmtMoney(previewQuery.data.totales.total_transferencia)}</b></div>
                  <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Otro</span><b className="text-gray-900 dark:text-white">{fmtMoney(previewQuery.data.totales.total_otro)}</b></div>
                </div>
              </div>

              <div className="rounded-xl border border-purple-200/70 dark:border-purple-500/30 bg-purple-50/60 dark:bg-purple-500/10 p-4">
                <p className="text-xs text-purple-700/80 dark:text-purple-300">Estimado efectivo final (monto inicial + efectivo)</p>
                <p className="text-lg font-extrabold text-purple-700 dark:text-purple-200">
                  {fmtMoney(previewQuery.data.estimado_monto_final)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historial */}
      <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Historial de cierres</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isAdmin ? 'Lista visible para el usuario actual (para ver otros usuarios se puede extender con filtros).' : 'Tus cierres recientes.'}
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200/70 dark:border-white/10">
                <th className="py-3 pr-4">Estado</th>
                <th className="py-3 pr-4">Apertura</th>
                <th className="py-3 pr-4">Cierre</th>
                <th className="py-3 pr-4">Total ventas</th>
                <th className="py-3 pr-4">Efectivo</th>
              </tr>
            </thead>
            <tbody>
              {(cierresQuery.data?.cierres ?? []).map((c) => (
                <tr key={c.id} className="border-b border-gray-200/50 dark:border-white/10">
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      c.estado === 'CERRADO'
                        ? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10'
                        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30'
                    }`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-900 dark:text-white">{fmtDateTime(c.fecha_apertura)}</td>
                  <td className="py-3 pr-4 text-gray-900 dark:text-white">{c.fecha_cierre ? fmtDateTime(c.fecha_cierre) : '-'}</td>
                  <td className="py-3 pr-4 text-gray-900 dark:text-white">{fmtMoney(Number(c.total_ventas))}</td>
                  <td className="py-3 pr-4 text-gray-900 dark:text-white">{fmtMoney(Number(c.total_efectivo))}</td>
                </tr>
              ))}
              {(cierresQuery.data?.cierres?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-600 dark:text-gray-400">
                    No hay cierres registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
