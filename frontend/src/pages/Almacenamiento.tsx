import { useEffect, useState } from 'react';
import { AlertCircle, Package, TrendingDown, Barcode, Plus, Minus } from 'lucide-react';
import Barcode128 from 'react-barcode';
import {
  getAlmacenamiento,
  getProductosStockBajo,
  getAlertasStock,
  actualizarStock,
  generarCodigoBarras,
  actualizarAlmacenamiento,
  actualizarPrecioProducto,
  Almacenamiento,
  AlertaStock,
} from '../services/almacenamientoService';
import { showAlert } from '../utils/alerts';

export default function AlmacenamientoPage() {
  const [inventario, setInventario] = useState<Almacenamiento[]>([]);
  const [productosStockBajo, setProductosStockBajo] = useState<Almacenamiento[]>([]);
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventario' | 'alertas'>('inventario');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    stock: 0,
    precio: 0,
    stock_minimo: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    precio: '',
    stock: '',
    stock_minimo: '',
  });
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [almacenData, stockBajoData, alertasData] = await Promise.all([
        getAlmacenamiento(),
        getProductosStockBajo(),
        getAlertasStock('ACTIVA'),
      ]);
      setInventario(almacenData);
      setProductosStockBajo(stockBajoData);
      setAlertas(alertasData);
    } catch (error) {
      showAlert('Error al cargar datos del almacenamiento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarStock = async (
    almacenamiento_id: number,
    tipo: 'ENTRADA' | 'SALIDA'
  ) => {
    try {
      if (editQuantity <= 0) {
        showAlert('Ingrese una cantidad válida', 'error');
        return;
      }

      await actualizarStock(almacenamiento_id, editQuantity, tipo);
      showAlert(`Stock actualizado exitosamente`, 'success');
      setEditingId(null);
      setEditQuantity(0);
      cargarDatos();
    } catch (error) {
      showAlert('Error al actualizar stock', 'error');
    }
  };

  const handleGenerarCodigoBarras = async (almacenamiento_id: number) => {
    try {
      await generarCodigoBarras(almacenamiento_id);
      showAlert('Código de barras generado exitosamente', 'success');
      cargarDatos();
    } catch (error) {
      showAlert('Error al generar código de barras', 'error');
    }
  };

  const filteredInventario = inventario.filter((item) =>
    item.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const descargarCodigoBarras = async (item: Almacenamiento) => {
    try {
      const codigo = item.codigo_barras || '';
      
      // Importar JsBarcode dinámicamente
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
      
      script.onload = () => {
        // @ts-ignore
        const JsBarcode = window.JsBarcode;
        
        // Crear un canvas para el código de barras
        const barcodeCanvas = document.createElement('canvas');
        
        // Generar el código de barras
        JsBarcode(barcodeCanvas, codigo, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: false,
          margin: 0,
        });

        const barcodeWidth = barcodeCanvas.width;
        const barcodeHeight = barcodeCanvas.height;

        // Calcular dimensiones del canvas final (más compacto)
        const topPadding = 10;
        const bottomPadding = 15;
        const lineHeight = 20;
        const textSpacing = 10;
        
        // Altura: espacios + 3 líneas de texto + barcode + espacios
        const finalHeight = (lineHeight * 3) + (textSpacing * 3) + barcodeHeight + topPadding + bottomPadding;
        const finalWidth = Math.max(barcodeWidth + (topPadding * 2), 300);

        // Crear canvas final con toda la información
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = finalWidth;
        finalCanvas.height = finalHeight;
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) return;

        // Fondo blanco
        finalCtx.fillStyle = 'white';
        finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Dibujar el código de barras centrado (más abajo)
        const startX = (finalCanvas.width - barcodeWidth) / 2;
        const startY = (lineHeight * 3) + (textSpacing * 3) + topPadding;

        finalCtx.drawImage(barcodeCanvas, startX, startY);

        // Dibujar el número del código debajo (centrado)
        let currentY = topPadding + lineHeight;
        
        finalCtx.fillStyle = 'black';
        finalCtx.font = 'bold 14px Arial';
        finalCtx.textAlign = 'center';
        finalCtx.fillText(codigo, finalCanvas.width / 2, currentY);

        // Dibujar nombre del producto (centrado)
        currentY += lineHeight + textSpacing;
        finalCtx.font = '13px Arial';
        finalCtx.fillText(item.producto.nombre, finalCanvas.width / 2, currentY);

        // Dibujar precio (centrado)
        currentY += lineHeight + textSpacing;
        finalCtx.font = 'bold 14px Arial';
        const precio = typeof item.producto.precio === 'string' 
          ? parseFloat(item.producto.precio).toFixed(2) 
          : Number(item.producto.precio).toFixed(2);
        finalCtx.fillText(`S/. ${precio}`, finalCanvas.width / 2, currentY);

        // Convertir canvas a imagen y descargar
        finalCanvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `codigo-barras-${item.producto.nombre.replace(/\s+/g, '-')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        });
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error al descargar código de barras:', error);
      showAlert('Error al descargar el código de barras', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 animate-spin">
            <i className="fas fa-spinner text-2xl text-white"></i>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando almacenamiento...</p>
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
            <i className="fas fa-warehouse mr-3"></i>
            Gestión de Almacenamiento
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>
            Controla el inventario y monitorea el stock de productos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Productos */}
        <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-blue-600/20 to-blue-600/10 dark:from-blue-600/10 dark:to-blue-600/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Productos</h3>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Package className="text-blue-500" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{inventario.length}</p>
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-orange-600/20 to-orange-600/10 dark:from-orange-600/10 dark:to-orange-600/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stock Bajo</h3>
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <TrendingDown className="text-orange-500" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{productosStockBajo.length}</p>
          </div>
        </div>

        {/* Alertas Activas */}
        <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-red-600/20 to-red-600/10 dark:from-red-600/10 dark:to-red-600/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Alertas Activas</h3>
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="text-red-500" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{alertas.length}</p>
          </div>
        </div>

        {/* Stock Total */}
        <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-green-600/20 to-green-600/10 dark:from-green-600/10 dark:to-green-600/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stock Total</h3>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Package className="text-green-500" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {inventario.reduce((sum, item) => sum + item.stock, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('inventario')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
              activeTab === 'inventario'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400'
                : 'bg-white/50 dark:bg-white/5 border-2 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-white/40 dark:hover:border-white/20'
            }`}
          >
            <i className="fas fa-boxes"></i>
            Inventario
          </button>
          <button
            onClick={() => setActiveTab('alertas')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
              activeTab === 'alertas'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400'
                : 'bg-white/50 dark:bg-white/5 border-2 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-white/40 dark:hover:border-white/20'
            }`}
          >
            <AlertCircle size={18} />
            Alertas ({alertas.length})
          </button>
        </div>
        
        {activeTab === 'inventario' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50 border-2 border-green-400"
          >
            <Plus size={20} />
            Agregar Producto
          </button>
        )}
      </div>

      {/* Inventario Tab */}
      {activeTab === 'inventario' && (
        <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 dark:border-white/5">
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <i className="fas fa-box mr-2"></i>Producto
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <i className="fas fa-tag mr-2"></i>Precio
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <i className="fas fa-cubes mr-2"></i>Stock
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <i className="fas fa-exclamation-triangle mr-2"></i>Mínimo
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <i className="fas fa-barcode mr-2"></i>Código
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <i className="fas fa-cog mr-2"></i>Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInventario.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 dark:border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200 group"
                  >
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-white font-medium">
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></span>
                        {item.producto.nombre}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                      S/. {typeof item.producto.precio === 'string' ? parseFloat(item.producto.precio).toFixed(2) : Number(item.producto.precio).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.stock <= item.stock_minimo
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.stock_minimo}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.codigo_barras ? (
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                          {item.codigo_barras}
                        </code>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No generado</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {editingId === item.id ? (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs transition-colors font-medium"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              // Aquí iría la lógica para guardar los cambios
                              showAlert('Cambios guardados', 'success');
                              setEditingId(null);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors font-medium"
                          >
                            Guardar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditData({
                                stock: item.stock,
                                precio: typeof item.producto.precio === 'string' 
                                  ? parseFloat(item.producto.precio) 
                                  : Number(item.producto.precio),
                                stock_minimo: item.stock_minimo,
                              });
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleGenerarCodigoBarras(item.id)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <Barcode size={14} />
                            Código
                          </button>
                          {item.codigo_barras && (
                            <button
                              onClick={() => descargarCodigoBarras(item)}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-xs font-medium flex items-center gap-1 transition-colors"
                              title="Descargar código de barras"
                            >
                              <i className="fas fa-download"></i>
                              Descargar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInventario.length === 0 && (
            <div className="py-12 text-center">
              <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400">No hay productos en el almacenamiento</p>
            </div>
          )}
        </div>
      )}

      {/* Alertas Tab */}
      {activeTab === 'alertas' && (
        <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
          {alertas.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto text-green-600 dark:text-green-400 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400">No hay alertas de stock bajo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 dark:border-white/5">
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-box mr-2"></i>Producto
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-cubes mr-2"></i>Stock Actual
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-exclamation-triangle mr-2"></i>Stock Mínimo
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-calendar mr-2"></i>Fecha Alerta
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <i className="fas fa-info-circle mr-2"></i>Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.map((alerta) => (
                    <tr
                      key={alerta.id}
                      className="border-b border-white/5 dark:border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200 group"
                    >
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white font-medium">
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-red-500 mr-3"></span>
                          {alerta.producto.nombre}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                          {alerta.stock_actual}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                        {alerta.stock_minimo}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-xs">
                          {new Date(alerta.fecha_creacion).toLocaleDateString('es-PE')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                          {alerta.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Editar Producto */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-white/10 p-8 max-w-md w-full shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 dark:from-blue-600/10 dark:to-purple-600/10"></div>
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <i className="fas fa-edit text-blue-600 text-2xl"></i>
                  Editar Producto
                </h2>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-cubes mr-2 text-purple-500"></i>
                    Stock
                  </label>
                  <input
                    type="number"
                    value={editData.stock}
                    onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-tag mr-2 text-green-500"></i>
                    Precio (S/.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editData.precio}
                    onChange={(e) => setEditData({ ...editData, precio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  />
                </div>

                {/* Stock Mínimo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-exclamation-triangle mr-2 text-orange-500"></i>
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    value={editData.stock_minimo}
                    onChange={(e) => setEditData({ ...editData, stock_minimo: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      const item = filteredInventario.find(i => i.id === editingId);
                      if (!item) return;

                      // Actualizar almacenamiento (stock y stock_minimo)
                      await actualizarAlmacenamiento(item.id, {
                        stock: editData.stock,
                        stock_minimo: editData.stock_minimo,
                      });

                      // Actualizar precio del producto
                      await actualizarPrecioProducto(item.producto_id, editData.precio);

                      showAlert('Cambios guardados exitosamente', 'success');
                      setEditingId(null);
                      cargarDatos();
                    } catch (error: any) {
                      console.error('Error:', error);
                      showAlert(error.response?.data?.message || 'Error al guardar cambios', 'error');
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/50"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Producto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-white/10 p-8 max-w-md w-full shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 dark:from-blue-600/10 dark:to-purple-600/10"></div>
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Plus size={24} className="text-green-600" />
                  Agregar Producto
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewProduct({ nombre: '', precio: '', stock: '', stock_minimo: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-box mr-2 text-blue-500"></i>
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={newProduct.nombre}
                    onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                    placeholder="Ej: Arroz Premium 1kg"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-tag mr-2 text-green-500"></i>
                    Precio (S/.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.precio}
                    onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })}
                    placeholder="Ej: 5.50"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-cubes mr-2 text-purple-500"></i>
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="Ej: 50"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  />
                </div>

                {/* Stock Mínimo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <i className="fas fa-exclamation-triangle mr-2 text-orange-500"></i>
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock_minimo}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_minimo: e.target.value })}
                    placeholder="Ej: 10"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewProduct({ nombre: '', precio: '', stock: '', stock_minimo: '' });
                  }}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!newProduct.nombre || !newProduct.precio || !newProduct.stock || !newProduct.stock_minimo) {
                      showAlert('Por favor completa todos los campos', 'error');
                      return;
                    }

                    setAddingProduct(true);
                    try {
                      // Paso 1: Crear el producto
                      const productoResponse = await fetch('http://localhost:3000/api/productos', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({
                          nombre: newProduct.nombre,
                          precio: parseFloat(newProduct.precio),
                        }),
                      });

                      if (!productoResponse.ok) {
                        const errorData = await productoResponse.json();
                        throw new Error(errorData.message || 'Error al crear producto');
                      }
                      const producto = await productoResponse.json();

                      // Paso 2: Crear el almacenamiento
                      const almacenResponse = await fetch('http://localhost:3000/api/almacenamiento', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({
                          producto_id: producto.id,
                          stock: parseInt(newProduct.stock),
                          stock_minimo: parseInt(newProduct.stock_minimo),
                        }),
                      });

                      if (!almacenResponse.ok) {
                        const errorData = await almacenResponse.json();
                        throw new Error(errorData.message || 'Error al crear almacenamiento');
                      }

                      showAlert('Producto agregado exitosamente', 'success');
                      setShowAddModal(false);
                      setNewProduct({ nombre: '', precio: '', stock: '', stock_minimo: '' });
                      cargarDatos();
                    } catch (error: any) {
                      console.error('Error:', error);
                      showAlert(error.message || 'Error al agregar producto', 'error');
                    } finally {
                      setAddingProduct(false);
                    }
                  }}
                  disabled={addingProduct}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingProduct ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-spinner animate-spin"></i>
                      Guardando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Plus size={18} />
                      Agregar
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
