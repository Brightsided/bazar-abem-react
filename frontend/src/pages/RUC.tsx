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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RUCForm>({
    resolver: zodResolver(rucSchema),
    defaultValues: {
      mes: currentDate.getMonth() + 1,
      ano: currentDate.getFullYear(),
    },
  });

  const mutation = useMutation({
    mutationFn: ({ mes, ano }: RUCForm) => reportesService.calcularRUC(mes, ano),
    onSuccess: (data) => {
      setResultado(data);
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Error al calcular RUC');
    },
  });

  const onSubmit = (data: RUCForm) => {
    mutation.mutate(data);
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 dark:from-purple-600/5 dark:to-pink-600/5 rounded-xl blur-xl"></div>
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            <Calculator className="inline-block mr-3 w-8 h-8" />
            Calcular RUC
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center">
            <AlertCircle className="inline-block mr-2 w-4 h-4 text-purple-500" />
            Calcula el monto a pagar según el Régimen Único Simplificado (RUS)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-calendar mr-2 text-purple-500"></i>
                    Mes
                  </label>
                  <select
                    {...register('mes', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-white/20 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  >
                    {meses.map((mes, index) => (
                      <option key={index} value={index + 1} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
                        {mes}
                      </option>
                    ))}
                  </select>
                  {errors.mes && (
                    <p className="text-red-500 text-sm mt-1">{errors.mes.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-calendar-alt mr-2 text-purple-500"></i>
                    Año
                  </label>
                  <input
                    type="number"
                    {...register('ano', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    min="2020"
                    max="2100"
                  />
                  {errors.ano && (
                    <p className="text-red-500 text-sm mt-1">{errors.ano.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    Calcular RUC
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Información de Categorías */}
        <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-purple-600/20 to-pink-600/10 dark:from-purple-600/10 dark:to-pink-600/5 border border-white/20 dark:border-white/10 p-6">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-purple-500" />
              Categorías RUS
            </h3>
            <div className="space-y-3">
              <div className="bg-white/30 dark:bg-white/5 rounded-lg p-3 border border-white/20 dark:border-white/10">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Categoría 1</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Hasta S/ 5,000 mensuales</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-2">Pago: S/ 20</p>
              </div>
              <div className="bg-white/30 dark:bg-white/5 rounded-lg p-3 border border-white/20 dark:border-white/10">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Categoría 2</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">De S/ 5,000 a S/ 8,000</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-2">Pago: S/ 50</p>
              </div>
              <div className="bg-white/30 dark:bg-white/5 rounded-lg p-3 border border-red-500/20">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Exceso</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Más de S/ 8,000</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-2">Excedes RUS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Total de Ventas */}
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-blue-600/20 to-blue-600/10 dark:from-blue-600/10 dark:to-blue-600/5 border border-white/20 dark:border-white/10 p-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total de Ventas</h3>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(resultado.total_ventas)}
              </p>
            </div>
          </div>

          {/* Categoría */}
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-purple-600/20 to-purple-600/10 dark:from-purple-600/10 dark:to-purple-600/5 border border-white/20 dark:border-white/10 p-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Categoría</h3>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {resultado.categoria}
              </p>
            </div>
          </div>

          {/* Monto a Pagar */}
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-green-600/20 to-green-600/10 dark:from-green-600/10 dark:to-green-600/5 border border-white/20 dark:border-white/10 p-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Monto a Pagar</h3>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <i className="fas fa-dollar-sign text-green-500 text-lg"></i>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {typeof resultado.monto === 'number' 
                  ? formatCurrency(resultado.monto)
                  : resultado.monto}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RUC;
