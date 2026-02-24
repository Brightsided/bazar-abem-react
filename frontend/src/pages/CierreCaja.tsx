import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cierreCajaService } from '../services/cierreCajaService';
import { useAuthStore } from '../store/authStore';

function fmtMoney(value: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(value);
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
}

export default function CierreCaja() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [montoInicial, setMontoInicial] = useState<string>('');
  const [obsApertura, setObsApertura] = useState<string>('');
  const [montoFinal, setMontoFinal] = useState<string>('');
  const [obsCierre, setObsCierre] = useState<string>('');
  const isAdmin = user?.rol === 'Administrador';

  const estadoQuery = useQuery({ queryKey: ['cierreCaja', 'estado'], queryFn: () => cierreCajaService.getEstado() });
  const previewQuery = useQuery({ queryKey: ['cierreCaja', 'preview'], queryFn: () => cierreCajaService.preview(), enabled: false });
  const cierresQuery = useQuery({ queryKey: ['cierreCaja', 'lista'], queryFn: () => cierreCajaService.listar() });

  const abrirMutation = useMutation({
    mutationFn: (data: { monto_inicial: number; observaciones?: string }) => cierreCajaService.abrir(data),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['cierreCaja'] }); setMontoInicial(''); setObsApertura(''); },
  });

  const cerrarMutation = useMutation({
    mutationFn: (data: { monto_final: number; observaciones?: string }) => cierreCajaService.cerrar(data),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['cierreCaja'] }); setMontoFinal(''); setObsCierre(''); },
  });

  const abierto = estadoQuery.data?.abierto ?? null;
  const accionesDisabled = estadoQuery.isLoading || abrirMutation.isPending || cerrarMutation.isPending;

  const errorMsg = useMemo(() => {
    const err = (estadoQuery.error || previewQuery.error || cierresQuery.error || abrirMutation.error || cerrarMutation.error) as any;
    if (!err) return null;
    return err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Error desconocido';
  }, [estadoQuery.error, previewQuery.error, cierresQuery.error, abrirMutation.error, cerrarMutation.error]);

  const inputClass = "w-full px-3 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all placeholder-surface-400 dark:placeholder-surface-600 disabled:opacity-50";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            <i className="fas fa-coins mr-2 text-mint-500"></i>Cierre de Caja
          </h1>
          <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">Apertura/cierre y resumen de ventas por método de pago</p>
        </div>
        <div className="bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2">
          <p className="text-[10px] text-surface-400 dark:text-surface-500 uppercase tracking-wider">Usuario</p>
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">{user?.nombre ?? '-'} ({user?.rol ?? '-'})</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado caja */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50">Estado actual</h2>
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{abierto ? 'Caja abierta' : 'No hay caja abierta'}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              abierto
                ? 'bg-mint-500/10 text-mint-700 border-mint-200 dark:text-mint-400 dark:border-mint-800'
                : 'bg-surface-100 text-surface-500 border-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700'
            }`}>
              {abierto ? 'ABIERTO' : 'CERRADO'}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-3">
              <p className="text-[10px] text-surface-400 dark:text-surface-500 uppercase tracking-wider">Apertura</p>
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-50 mt-0.5">{abierto?.fecha_apertura ? fmtDateTime(abierto.fecha_apertura) : '-'}</p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-3">
              <p className="text-[10px] text-surface-400 dark:text-surface-500 uppercase tracking-wider">Monto inicial</p>
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-50 mt-0.5">{abierto ? fmtMoney(Number(abierto.monto_inicial)) : '-'}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <button onClick={() => previewQuery.refetch()} disabled={accionesDisabled}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-mint-500 hover:bg-mint-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-glow-mint">
              <i className="fas fa-chart-pie text-xs"></i>Ver Preview
            </button>
            {!abierto && (
              <button onClick={() => { const mi = Number(montoInicial || '0'); abrirMutation.mutate({ monto_inicial: isNaN(mi) ? 0 : mi, observaciones: obsApertura || undefined }); }}
                disabled={accionesDisabled}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                <i className="fas fa-lock-open text-xs"></i>Abrir Caja
              </button>
            )}
            {abierto && (
              <button onClick={() => { const mf = Number(montoFinal || '0'); cerrarMutation.mutate({ monto_final: isNaN(mf) ? 0 : mf, observaciones: obsCierre || undefined }); }}
                disabled={accionesDisabled}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                <i className="fas fa-lock text-xs"></i>Cerrar Caja
              </button>
            )}
          </div>

          {/* Forms */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-4">
              <h3 className="text-xs font-bold text-surface-900 dark:text-surface-50 uppercase tracking-wider">Apertura</h3>
              <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-0.5">Solo aplica si no hay caja abierta.</p>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-surface-500 dark:text-surface-400 mb-1">Monto inicial (S/)</label>
                  <input type="number" value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)} disabled={!!abierto} className={inputClass} placeholder="Ej: 50" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-surface-500 dark:text-surface-400 mb-1">Observaciones</label>
                  <textarea value={obsApertura} onChange={(e) => setObsApertura(e.target.value)} disabled={!!abierto} rows={2} className={inputClass} placeholder="Opcional" />
                </div>
              </div>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-4">
              <h3 className="text-xs font-bold text-surface-900 dark:text-surface-50 uppercase tracking-wider">Cierre</h3>
              <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-0.5">Solo aplica si hay caja abierta.</p>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-surface-500 dark:text-surface-400 mb-1">Monto final contado (S/)</label>
                  <input type="number" value={montoFinal} onChange={(e) => setMontoFinal(e.target.value)} disabled={!abierto} className={inputClass} placeholder="Ej: 120.50" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-surface-500 dark:text-surface-400 mb-1">Observaciones</label>
                  <textarea value={obsCierre} onChange={(e) => setObsCierre(e.target.value)} disabled={!abierto} rows={2} className={inputClass} placeholder="Opcional" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50">Preview</h2>
            <span className="text-[10px] text-surface-400 dark:text-surface-500">
              {previewQuery.isFetching ? 'Calculando...' : 'Actualizable'}
            </span>
          </div>

          {!previewQuery.data ? (
            <div className="mt-4 rounded-lg border border-dashed border-surface-300 dark:border-surface-700 p-4">
              <p className="text-xs text-surface-400 dark:text-surface-500">Presiona <b>Ver Preview</b> para calcular totales.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-3">
                <p className="text-[10px] text-surface-400 dark:text-surface-500 uppercase tracking-wider">Rango</p>
                <p className="text-xs font-semibold text-surface-900 dark:text-surface-50 mt-0.5">
                  {fmtDateTime(previewQuery.data.rango.desde)} → {fmtDateTime(previewQuery.data.rango.hasta)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-3">
                  <p className="text-[10px] text-surface-400 dark:text-surface-500">Ventas</p>
                  <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{previewQuery.data.totales.cantidad_ventas}</p>
                </div>
                <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-3">
                  <p className="text-[10px] text-surface-400 dark:text-surface-500">Total</p>
                  <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{fmtMoney(previewQuery.data.totales.total_ventas)}</p>
                </div>
              </div>
              <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-3">
                <p className="text-[10px] text-surface-400 dark:text-surface-500 uppercase tracking-wider">Por método</p>
                <div className="mt-2 space-y-1.5 text-xs">
                  {[
                    { label: 'Efectivo', value: previewQuery.data.totales.total_efectivo },
                    { label: 'Yape', value: previewQuery.data.totales.total_yape },
                    { label: 'Plin', value: previewQuery.data.totales.total_plin },
                    { label: 'Tarjeta', value: previewQuery.data.totales.total_tarjeta },
                    { label: 'Transferencia', value: previewQuery.data.totales.total_transferencia },
                    { label: 'Otro', value: previewQuery.data.totales.total_otro },
                  ].map((m) => (
                    <div key={m.label} className="flex justify-between">
                      <span className="text-surface-500 dark:text-surface-400">{m.label}</span>
                      <span className="font-semibold text-surface-900 dark:text-surface-50">{fmtMoney(m.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-mint-500/10 border border-mint-200 dark:border-mint-800 rounded-lg p-3">
                <p className="text-[10px] text-mint-700 dark:text-mint-400 uppercase tracking-wider">Estimado final</p>
                <p className="text-lg font-bold text-mint-700 dark:text-mint-400 mt-0.5">{fmtMoney(previewQuery.data.estimado_monto_final)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl">
        <div className="px-5 py-4 border-b border-surface-100 dark:border-surface-800">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50">Historial de cierres</h2>
          <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-0.5">
            {isAdmin ? 'Lista visible para el usuario actual.' : 'Tus cierres recientes.'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800">
                {['Estado', 'Apertura', 'Cierre', 'Total ventas', 'Efectivo'].map((h) => (
                  <th key={h} className="text-left py-3 px-5 text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(cierresQuery.data?.cierres ?? []).map((c) => (
                <tr key={c.id} className="border-b border-surface-50 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-3 px-5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      c.estado === 'CERRADO'
                        ? 'bg-surface-100 text-surface-500 border-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700'
                        : 'bg-mint-500/10 text-mint-700 border-mint-200 dark:text-mint-400 dark:border-mint-800'
                    }`}>{c.estado}</span>
                  </td>
                  <td className="py-3 px-5 text-sm text-surface-900 dark:text-surface-100">{fmtDateTime(c.fecha_apertura)}</td>
                  <td className="py-3 px-5 text-sm text-surface-900 dark:text-surface-100">{c.fecha_cierre ? fmtDateTime(c.fecha_cierre) : '-'}</td>
                  <td className="py-3 px-5 text-sm font-semibold text-surface-900 dark:text-surface-100">{fmtMoney(Number(c.total_ventas))}</td>
                  <td className="py-3 px-5 text-sm font-semibold text-mint-600 dark:text-mint-400">{fmtMoney(Number(c.total_efectivo))}</td>
                </tr>
              ))}
              {(cierresQuery.data?.cierres?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-surface-400 dark:text-surface-500">No hay cierres registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
