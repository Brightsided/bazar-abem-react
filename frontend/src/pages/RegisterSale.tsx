import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ventasService } from '@/services/ventasService';
import { showSuccess, showError } from '@/utils/alerts';
import { formatCurrency } from '@/utils/formatters';
import ProductSearch from '@/components/forms/ProductSearch';

const ventaSchema = z.object({
  cliente: z.string().min(1, 'El cliente es requerido'),
  metodo_pago: z.enum(['Efectivo', 'Tarjeta De Credito/Debito', 'Yape']),
  productos: z.array(
    z.object({
      nombre: z.string().min(1, 'El nombre del producto es requerido'),
      cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
      precio: z.number().min(0.01, 'El precio debe ser mayor a 0'),
    })
  ).min(1, 'Debe agregar al menos un producto'),
});

type VentaForm = z.infer<typeof ventaSchema>;

const RegisterSale = () => {
  const queryClient = useQueryClient();
  const [total, setTotal] = useState(0);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<'Efectivo' | 'Tarjeta De Credito/Debito' | 'Yape'>('Efectivo');

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VentaForm>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      cliente: 'Cliente Casual',
      metodo_pago: 'Efectivo',
      productos: [{ nombre: '', cantidad: 1, precio: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'productos',
  });

  const productos = watch('productos');

  // Calcular total
  useEffect(() => {
    const newTotal = productos.reduce(
      (sum, prod) => sum + (prod.cantidad || 0) * (prod.precio || 0),
      0
    );
    setTotal(newTotal);
  }, [productos]);

  const mutation = useMutation({
    mutationFn: ventasService.createVenta,
    onSuccess: () => {
      showSuccess('Venta registrada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      reset();
      setTotal(0);
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Error al registrar la venta');
    },
  });

  const onSubmit = (data: VentaForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-xl blur-xl"></div>
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl p-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            <i className="fas fa-cash-register mr-3"></i>
            Registrar Venta
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>
            Completa el formulario para registrar una nueva venta
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Cliente Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors group-focus-within:text-blue-500">
                  <i className="fas fa-user mr-2 text-blue-500"></i>
                  Cliente
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('cliente')}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    placeholder="Nombre del cliente"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <i className="fas fa-chevron-right text-xs"></i>
                  </div>
                </div>
                {errors.cliente && (
                  <p className="text-red-400 text-xs mt-2 flex items-center animate-pulse">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.cliente.message}
                  </p>
                )}
              </div>

              {/* Productos Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    <i className="fas fa-box mr-2 text-purple-500"></i>
                    Productos
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ nombre: '', cantidad: 1, precio: 0 })}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    Agregar Producto
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="group relative overflow-hidden rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 p-4 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 transition-all duration-300"></div>
                      <div className="relative grid grid-cols-12 gap-3">
                        <div className="col-span-6 md:col-span-5">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                            Producto
                          </label>
                          <ProductSearch
                            value={productos[index]?.nombre || ''}
                            onChange={(value) => setValue(`productos.${index}.nombre`, value)}
                            placeholder="Buscar producto..."
                          />
                        </div>
                        <div className="col-span-3 md:col-span-3">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            {...register(`productos.${index}.cantidad`, { valueAsNumber: true })}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-center"
                            placeholder="1"
                            min="1"
                          />
                        </div>
                        <div className="col-span-3 md:col-span-3">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                            Precio
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`productos.${index}.precio`, { valueAsNumber: true })}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-center"
                            placeholder="0.00"
                            min="0"
                          />
                        </div>
                        <div className="col-span-1 flex items-end justify-center pb-1">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all duration-200 transform hover:scale-110"
                              title="Eliminar producto"
                            >
                              <i className="fas fa-trash text-sm"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.productos && (
                  <p className="text-red-400 text-xs mt-3 flex items-center animate-pulse">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.productos.message || 'Verifica los productos'}
                  </p>
                )}
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  <i className="fas fa-credit-card mr-2 text-green-500"></i>
                  Método de Pago
                </label>
                <input type="hidden" {...register('metodo_pago')} value={metodoSeleccionado} />
                <div className="grid grid-cols-3 gap-3">
                  {/* Efectivo Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setMetodoSeleccionado('Efectivo');
                      setValue('metodo_pago', 'Efectivo');
                    }}
                    className={`relative overflow-hidden rounded-lg p-4 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2 ${
                      metodoSeleccionado === 'Efectivo'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 border-2 border-green-400'
                        : 'bg-white/50 dark:bg-white/5 border-2 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-white/40 dark:hover:border-white/20'
                    }`}
                  >
                    <i className="fas fa-money-bill text-xl"></i>
                    <span className="text-sm">Efectivo</span>
                  </button>

                  {/* Tarjeta Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setMetodoSeleccionado('Tarjeta De Credito/Debito');
                      setValue('metodo_pago', 'Tarjeta De Credito/Debito');
                    }}
                    className={`relative overflow-hidden rounded-lg p-4 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2 ${
                      metodoSeleccionado === 'Tarjeta De Credito/Debito'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400'
                        : 'bg-white/50 dark:bg-white/5 border-2 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-white/40 dark:hover:border-white/20'
                    }`}
                  >
                    <i className="fas fa-credit-card text-xl"></i>
                    <span className="text-sm">Tarjeta</span>
                  </button>

                  {/* Yape Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setMetodoSeleccionado('Yape');
                      setValue('metodo_pago', 'Yape');
                    }}
                    className={`relative overflow-hidden rounded-lg p-4 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2 ${
                      metodoSeleccionado === 'Yape'
                        ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/50 border-2 border-purple-400'
                        : 'bg-white/50 dark:bg-white/5 border-2 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-white/40 dark:hover:border-white/20'
                    }`}
                  >
                    <i className="fas fa-mobile-alt text-xl"></i>
                    <span className="text-sm">Yape</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></div>
                  <span className="relative flex items-center justify-center">
                    {mutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle mr-2"></i>
                        Registrar Venta
                      </>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setTotal(0);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  Limpiar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Summary Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Total Card */}
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 dark:from-blue-600/10 dark:to-purple-600/10 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 hover:from-blue-600/5 hover:to-purple-600/5 transition-all duration-300"></div>
              <div className="relative">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                  <i className="fas fa-calculator mr-2 text-blue-500"></i>
                  Total de Venta
                </p>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {formatCurrency(total)}
                </div>
              </div>
            </div>

            {/* Items Count Card */}
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-4 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <i className="fas fa-box text-purple-500"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Productos</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{fields.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Quantity Card */}
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-4 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <i className="fas fa-cubes text-green-500"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Cantidad Total</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {productos.reduce((sum, prod) => sum + (prod.cantidad || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-4 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
              <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <i className="fas fa-info-circle text-blue-500 mt-0.5 flex-shrink-0"></i>
                <span>Completa todos los campos requeridos para registrar la venta</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSale;
