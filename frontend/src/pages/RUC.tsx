import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { reportesService } from '@/services/reportesService';
import { formatCurrency } from '@/utils/formatters';
import { showError } from '@/utils/alerts';
import { Calculator, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const rucSchema = z.object({
  mes: z.number().min(1).max(12),
  ano: z.number().min(2020).max(2100),
});

type RUCForm = z.infer<typeof rucSchema>;

const RUC = () => {
  const [resultado, setResultado] = useState<any>(null);
  const currentDate = new Date();

  const { register, handleSubmit, formState: { errors } } = useForm<RUCForm>({
    resolver: zodResolver(rucSchema),
    defaultValues: { mes: currentDate.getMonth() + 1, ano: currentDate.getFullYear() },
  });

  const mutation = useMutation({
    mutationFn: ({ mes, ano }: RUCForm) => reportesService.calcularRUC(mes, ano),
    onSuccess: (data) => setResultado(data),
    onError: (error: any) => showError(error.response?.data?.message || 'Error al calcular RUC'),
  });

  const onSubmit = (data: RUCForm) => mutation.mutate(data);

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const inputClass = "w-full px-3 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-mint-500" />Calcular RUC
        </h1>
        <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">Calcula el monto a pagar según el Régimen Único Simplificado (RUS)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">Mes</label>
                  <select {...register('mes', { valueAsNumber: true })} className={inputClass}>
                    {meses.map((mes, index) => (
                      <option key={index} value={index + 1}>{mes}</option>
                    ))}
                  </select>
                  {errors.mes && <p className="text-red-500 text-xs mt-1">{errors.mes.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">Año</label>
                  <input type="number" {...register('ano', { valueAsNumber: true })} className={inputClass} min="2020" max="2100" />
                  {errors.ano && <p className="text-red-500 text-xs mt-1">{errors.ano.message}</p>}
                </div>
              </div>
              <button type="submit" disabled={mutation.isPending}
                className="w-full py-3 bg-mint-500 hover:bg-mint-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-glow-mint hover:shadow-glow-mint-lg flex items-center justify-center gap-2 active:scale-[0.98]">
                {mutation.isPending ? (<><i className="fas fa-spinner fa-spin"></i>Calculando...</>) : (<><Calculator className="w-4 h-4" />Calcular RUC</>)}
              </button>
            </form>
          </div>
        </div>

        {/* Categories Info */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-mint-500" />Categorías RUS
          </h3>
          <div className="space-y-2">
            {[
              { cat: 'Categoría 1', desc: 'Hasta S/ 5,000 mensuales', pago: 'S/ 20', border: 'border-mint-200 dark:border-mint-800' },
              { cat: 'Categoría 2', desc: 'De S/ 5,000 a S/ 8,000', pago: 'S/ 50', border: 'border-amber-200 dark:border-amber-800' },
              { cat: 'Exceso', desc: 'Más de S/ 8,000', pago: 'Excedes RUS', border: 'border-red-200 dark:border-red-800' },
            ].map((c) => (
              <div key={c.cat} className={`bg-surface-50 dark:bg-surface-800/50 rounded-lg p-3 border ${c.border}`}>
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">{c.cat}</p>
                <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-0.5">{c.desc}</p>
                <p className="text-sm font-bold text-mint-600 dark:text-mint-400 mt-1">{c.pago}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {resultado && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          {[
            { label: 'Total de Ventas', value: formatCurrency(resultado.total_ventas), icon: <TrendingUp className="w-5 h-5 text-sky-500" />, color: 'text-sky-500 bg-sky-500/10' },
            { label: 'Categoría', value: resultado.categoria, icon: <CheckCircle className="w-5 h-5 text-violet-500" />, color: 'text-violet-500 bg-violet-500/10' },
            { label: 'Monto a Pagar', value: typeof resultado.monto === 'number' ? formatCurrency(resultado.monto) : resultado.monto, icon: <i className="fas fa-dollar-sign text-mint-500 text-lg"></i>, color: 'text-mint-500 bg-mint-500/10' },
          ].map((r) => (
            <div key={r.label} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{r.label}</span>
                <div className={`w-9 h-9 rounded-lg ${r.color} flex items-center justify-center`}>{r.icon}</div>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{r.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RUC;
