import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ventasService } from '@/services/ventasService';
import { clientesService } from '@/services/clientesService';
import { showSuccess, showError } from '@/utils/alerts';
import { formatCurrency } from '@/utils/formatters';
import ProductSearch from '@/components/forms/ProductSearch';
import ClientSearch from '@/components/forms/ClientSearch';
import { Almacenamiento } from '@/services/almacenamientoService';
import { Cliente } from '@/types';

const ventaSchema = z.object({
  cliente: z.string().min(1, 'El cliente es requerido'),
  cliente_id: z.number().nullable().optional(),
  metodo_pago: z.enum(['Efectivo', 'Tarjeta De Credito/Debito', 'Yape']),
  productos: z.array(
    z.object({
      nombre: z.string().min(1, 'El nombre del producto es requerido'),
      cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
      precio: z.number().min(0.01, 'El precio debe ser mayor a 0'),
      producto_id: z.number().optional(),
      stock_disponible: z.number().optional(),
    })
  ).min(1, 'Debe agregar al menos un producto'),
});

type VentaForm = z.infer<typeof ventaSchema>;

const RegisterSale = () => {
  const queryClient = useQueryClient();
  const [total, setTotal] = useState(0);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<'Efectivo' | 'Tarjeta De Credito/Debito' | 'Yape'>('Efectivo');
  const [stockDisponible, setStockDisponible] = useState<{ [key: number]: number }>({});

  const {
    register, control, handleSubmit, watch, reset, setValue, getValues,
    formState: { errors },
  } = useForm<VentaForm>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      cliente: 'Cliente Casual',
      metodo_pago: 'Efectivo',
      productos: [{ nombre: '', cantidad: 1, precio: 0, stock_disponible: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'productos' });
  const productos = watch('productos');

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.getClientes,
  });

  useEffect(() => {
    if (clientes.length > 0) {
      const clienteCasual = clientes.find(c => c.nombre.toLowerCase() === 'cliente casual');
      if (clienteCasual) setValue('cliente_id', clienteCasual.id);
    }
  }, [clientes, setValue]);

  useEffect(() => {
    const currentProductos = getValues('productos');
    const newTotal = currentProductos.reduce((sum, prod) => sum + (prod.cantidad || 0) * (prod.precio || 0), 0);
    setTotal(newTotal);
  }, [productos, getValues]);

  const handleProductSelect = (index: number, producto: Almacenamiento) => {
    if (producto) {
      const precioNumerico = Number(producto.producto.precio);
      setValue(`productos.${index}.precio`, precioNumerico, { shouldDirty: true, shouldTouch: true });
      setValue(`productos.${index}.producto_id`, producto.producto.id, { shouldDirty: true, shouldTouch: true });
      setValue(`productos.${index}.stock_disponible`, producto.stock, { shouldDirty: true, shouldTouch: true });
      setStockDisponible(prev => ({ ...prev, [index]: producto.stock }));
      setTimeout(() => {
        const currentProductos = getValues('productos');
        const newTotal = currentProductos.reduce((sum, prod) => sum + (prod.cantidad || 0) * (prod.precio || 0), 0);
        setTotal(newTotal);
      }, 0);
    }
  };

  const mutation = useMutation({
    mutationFn: ventasService.createVenta,
    onSuccess: () => {
      showSuccess('Venta registrada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      reset();
      setTotal(0);
      setStockDisponible({});
      setTimeout(() => {
        const clienteCasual = clientes.find(c => c.nombre.toLowerCase() === 'cliente casual');
        if (clienteCasual) setValue('cliente_id', clienteCasual.id);
      }, 0);
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Error al registrar la venta');
    },
  });

  const onSubmit = (data: VentaForm) => {
    mutation.mutate(data);
  };

  const paymentMethods = [
    { value: 'Efectivo' as const, icon: 'fa-money-bill', label: 'Efectivo' },
    { value: 'Tarjeta De Credito/Debito' as const, icon: 'fa-credit-card', label: 'Tarjeta' },
    { value: 'Yape' as const, icon: 'fa-mobile-alt', label: 'Yape' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Registrar Venta</h1>
        <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
          Completa el formulario para registrar una nueva venta
        </p>
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Client */}
              <div>
                <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-2 uppercase tracking-wider">
                  Cliente
                </label>
                <ClientSearch
                  value={watch('cliente')}
                  onChange={(value) => setValue('cliente', value)}
                  onClientSelect={(client: Cliente | null) => {
                    setValue('cliente_id', client ? client.id : null);
                  }}
                  placeholder="Buscar o crear cliente..."
                />
                {errors.cliente && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle text-[10px]"></i>
                    {errors.cliente.message}
                  </p>
                )}
              </div>

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Productos
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ nombre: '', cantidad: 1, precio: 0 })}
                    className="px-3 py-1.5 bg-mint-500/10 text-mint-700 dark:text-mint-400 text-xs font-semibold rounded-lg hover:bg-mint-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <i className="fas fa-plus text-[10px]"></i>
                    Agregar
                  </button>
                </div>

                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-3">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-6 md:col-span-5">
                          <label className="text-[11px] font-medium text-surface-400 dark:text-surface-500 mb-1 block">Producto</label>
                          <ProductSearch
                            value={productos[index]?.nombre || ''}
                            onChange={(value) => setValue(`productos.${index}.nombre`, value)}
                            placeholder="Buscar..."
                            onProductSelectFull={(producto) => handleProductSelect(index, producto)}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-[11px] font-medium text-surface-400 dark:text-surface-500 mb-1 block">
                            Cant. {stockDisponible[index] && <span className="text-mint-600 dark:text-mint-400">Máx: {stockDisponible[index]}</span>}
                          </label>
                          <input
                            type="number"
                            {...register(`productos.${index}.cantidad`, { valueAsNumber: true })}
                            className="w-full px-3 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 text-sm text-center focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all"
                            placeholder="1"
                            min="1"
                            max={stockDisponible[index] || 999}
                          />
                          {productos[index]?.cantidad > (stockDisponible[index] || 0) && stockDisponible[index] > 0 && (
                            <p className="text-amber-500 text-[10px] mt-1 flex items-center gap-0.5">
                              <i className="fas fa-exclamation-triangle"></i>
                              Excede stock
                            </p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <label className="text-[11px] font-medium text-surface-400 dark:text-surface-500 mb-1 block">Precio</label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`productos.${index}.precio`, { valueAsNumber: true })}
                            className="w-full px-3 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 text-sm text-center font-semibold focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all"
                            placeholder="0.00"
                            min="0"
                          />
                        </div>
                        <div className="col-span-1 flex items-end justify-center pb-1">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.productos && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle text-[10px]"></i>
                    {errors.productos.message || 'Verifica los productos'}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-3 uppercase tracking-wider">
                  Método de Pago
                </label>
                <input type="hidden" {...register('metodo_pago')} value={metodoSeleccionado} />
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => {
                        setMetodoSeleccionado(method.value);
                        setValue('metodo_pago', method.value);
                      }}
                      className={`rounded-lg p-3 text-sm font-semibold transition-all duration-200 flex flex-col items-center gap-1.5 border ${
                        metodoSeleccionado === method.value
                          ? 'bg-mint-500/10 dark:bg-mint-500/15 border-mint-500 text-mint-700 dark:text-mint-400'
                          : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600'
                      }`}
                    >
                      <i className={`fas ${method.icon} text-lg`}></i>
                      <span className="text-xs">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 py-3 bg-mint-500 hover:bg-mint-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-glow-mint hover:shadow-glow-mint-lg active:scale-[0.98]"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i>Registrando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-check"></i>Registrar Venta
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { reset(); setTotal(0); setStockDisponible({}); }}
                  className="px-5 py-3 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 font-semibold rounded-lg transition-colors text-sm"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Total */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
            <p className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Total de Venta</p>
            <div className="text-3xl font-bold text-mint-600 dark:text-mint-400">
              {formatCurrency(total)}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <i className="fas fa-box text-violet-500 text-sm"></i>
              </div>
              <div>
                <p className="text-[11px] text-surface-400 dark:text-surface-500">Productos</p>
                <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{fields.length}</p>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-mint-500/10 flex items-center justify-center">
                <i className="fas fa-cubes text-mint-500 text-sm"></i>
              </div>
              <div>
                <p className="text-[11px] text-surface-400 dark:text-surface-500">Cantidad Total</p>
                <p className="text-lg font-bold text-surface-900 dark:text-surface-50">
                  {productos.reduce((sum, prod) => sum + (prod.cantidad || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl p-4">
            <p className="text-xs text-surface-400 dark:text-surface-500 flex items-start gap-2">
              <i className="fas fa-info-circle text-mint-500/60 mt-0.5 flex-shrink-0"></i>
              Completa todos los campos requeridos para registrar la venta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSale;
