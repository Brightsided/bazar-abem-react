import { useEffect, useState } from 'react';
import { AlertCircle, Package, TrendingDown, Barcode, Plus } from 'lucide-react';
import {
  getAlmacenamiento, getProductosStockBajo, getAlertasStock, generarCodigoBarras,
  actualizarAlmacenamiento, actualizarPrecioProducto, Almacenamiento, AlertaStock,
} from '../services/almacenamientoService';
import { showAlert } from '../utils/alerts';

export default function AlmacenamientoPage() {
  const [inventario, setInventario] = useState<Almacenamiento[]>([]);
  const [productosStockBajo, setProductosStockBajo] = useState<Almacenamiento[]>([]);
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventario' | 'alertas'>('inventario');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ stock: 0, precio: 0, stock_minimo: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ nombre: '', precio: '', stock: '', stock_minimo: '' });
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [almacenData, stockBajoData, alertasData] = await Promise.all([
        getAlmacenamiento(), getProductosStockBajo(), getAlertasStock('ACTIVA'),
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
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
      script.onload = () => {
        // @ts-expect-error JsBarcode is loaded dynamically from CDN
        const JsBarcode = window.JsBarcode;
        const barcodeCanvas = document.createElement('canvas');
        JsBarcode(barcodeCanvas, codigo, { format: 'CODE128', width: 2, height: 100, displayValue: false, margin: 0 });
        const barcodeWidth = barcodeCanvas.width;
        const barcodeHeight = barcodeCanvas.height;
        const topPadding = 10; const bottomPadding = 15; const lineHeight = 20; const textSpacing = 10;
        const finalHeight = (lineHeight * 3) + (textSpacing * 3) + barcodeHeight + topPadding + bottomPadding;
        const finalWidth = Math.max(barcodeWidth + (topPadding * 2), 300);
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = finalWidth; finalCanvas.height = finalHeight;
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) return;
        finalCtx.fillStyle = 'white'; finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        const startX = (finalCanvas.width - barcodeWidth) / 2;
        const startY = (lineHeight * 3) + (textSpacing * 3) + topPadding;
        finalCtx.drawImage(barcodeCanvas, startX, startY);
        let currentY = topPadding + lineHeight;
        finalCtx.fillStyle = 'black'; finalCtx.font = 'bold 14px Arial'; finalCtx.textAlign = 'center';
        finalCtx.fillText(codigo, finalCanvas.width / 2, currentY);
        currentY += lineHeight + textSpacing;
        finalCtx.font = '13px Arial'; finalCtx.fillText(item.producto.nombre, finalCanvas.width / 2, currentY);
        currentY += lineHeight + textSpacing;
        finalCtx.font = 'bold 14px Arial';
        const precio = typeof item.producto.precio === 'string' ? parseFloat(item.producto.precio).toFixed(2) : Number(item.producto.precio).toFixed(2);
        finalCtx.fillText(`S/. ${precio}`, finalCanvas.width / 2, currentY);
        finalCanvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url; link.download = `codigo-barras-${item.producto.nombre.replace(/\s+/g, '-')}.png`;
          document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
        });
      };
      document.head.appendChild(script);
    } catch (error) {
      showAlert('Error al descargar el código de barras', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-mint-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-surface-400 dark:text-surface-500">Cargando almacenamiento...</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all placeholder-surface-400 dark:placeholder-surface-600";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Gestión de Almacenamiento</h1>
        <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">Controla el inventario y monitorea el stock de productos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Productos', value: inventario.length, icon: <Package size={18} />, color: 'text-mint-500 bg-mint-500/10' },
          { label: 'Stock Bajo', value: productosStockBajo.length, icon: <TrendingDown size={18} />, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Alertas Activas', value: alertas.length, icon: <AlertCircle size={18} />, color: 'text-red-500 bg-red-500/10' },
          { label: 'Stock Total', value: inventario.reduce((s, i) => s + i.stock, 0), icon: <Package size={18} />, color: 'text-sky-500 bg-sky-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-2">
          {(['inventario', 'alertas'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-mint-500/10 dark:bg-mint-500/15 text-mint-700 dark:text-mint-400 border border-mint-500/30'
                  : 'bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600'
              }`}
            >
              {tab === 'inventario' ? <Package size={15} /> : <AlertCircle size={15} />}
              {tab === 'inventario' ? 'Inventario' : `Alertas (${alertas.length})`}
            </button>
          ))}
        </div>
        {activeTab === 'inventario' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-mint-500 text-white hover:bg-mint-600 transition-colors flex items-center gap-2 shadow-glow-mint"
          >
            <Plus size={16} />
            Agregar Producto
          </button>
        )}
      </div>

      {/* Inventario Tab */}
      {activeTab === 'inventario' && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl">
          {/* Search */}
          <div className="p-4 border-b border-surface-100 dark:border-surface-800">
            <div className="relative">
              <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm"></i>
              <input
                type="text" placeholder="Buscar producto..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-50 text-sm placeholder-surface-400 dark:placeholder-surface-600 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800">
                  {['Producto', 'Precio', 'Stock', 'Mínimo', 'Código', 'Acciones'].map((h) => (
                    <th key={h} className="text-left py-3 px-5 text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInventario.map((item) => (
                  <tr key={item.id} className="border-b border-surface-50 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-3 px-5 text-sm text-surface-900 dark:text-surface-100 font-medium">{item.producto.nombre}</td>
                    <td className="py-3 px-5 text-sm text-surface-900 dark:text-surface-100">
                      S/. {typeof item.producto.precio === 'string' ? parseFloat(item.producto.precio).toFixed(2) : Number(item.producto.precio).toFixed(2)}
                    </td>
                    <td className="py-3 px-5 text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.stock <= item.stock_minimo
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-mint-500/10 text-mint-700 dark:text-mint-400'
                      }`}>{item.stock}</span>
                    </td>
                    <td className="py-3 px-5 text-sm text-surface-500 dark:text-surface-400">{item.stock_minimo}</td>
                    <td className="py-3 px-5 text-sm text-surface-500 dark:text-surface-400">
                      {item.codigo_barras ? (
                        <code className="bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded text-xs font-mono">{item.codigo_barras}</code>
                      ) : (
                        <span className="text-surface-300 dark:text-surface-600 text-xs">No generado</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingId(item.id); setEditData({ stock: item.stock, precio: typeof item.producto.precio === 'string' ? parseFloat(item.producto.precio) : Number(item.producto.precio), stock_minimo: item.stock_minimo }); }}
                          className="text-xs font-semibold text-mint-600 dark:text-mint-400 hover:text-mint-700 dark:hover:text-mint-300 transition-colors">Editar</button>
                        <button onClick={() => handleGenerarCodigoBarras(item.id)}
                          className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors flex items-center gap-1">
                          <Barcode size={12} />Código
                        </button>
                        {item.codigo_barras && (
                          <button onClick={() => descargarCodigoBarras(item)}
                            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors flex items-center gap-1">
                            <i className="fas fa-download text-[10px]"></i>Descargar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInventario.length === 0 && (
            <div className="py-12 text-center">
              <Package className="mx-auto text-surface-300 dark:text-surface-700 mb-3" size={36} />
              <p className="text-sm text-surface-400 dark:text-surface-500">No hay productos en el almacenamiento</p>
            </div>
          )}
        </div>
      )}

      {/* Alertas Tab */}
      {activeTab === 'alertas' && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl">
          {alertas.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-mint-500/10 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-check text-mint-500 text-lg"></i>
              </div>
              <p className="text-sm text-surface-400 dark:text-surface-500">No hay alertas de stock bajo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-800">
                    {['Producto', 'Stock Actual', 'Stock Mínimo', 'Fecha Alerta', 'Estado'].map((h) => (
                      <th key={h} className="text-left py-3 px-5 text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alertas.map((alerta) => (
                    <tr key={alerta.id} className="border-b border-surface-50 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td className="py-3 px-5 text-sm text-surface-900 dark:text-surface-100 font-medium">{alerta.producto.nombre}</td>
                      <td className="py-3 px-5 text-sm"><span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">{alerta.stock_actual}</span></td>
                      <td className="py-3 px-5 text-sm text-surface-900 dark:text-surface-100">{alerta.stock_minimo}</td>
                      <td className="py-3 px-5 text-sm text-surface-400 dark:text-surface-500">
                        <span className="px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-xs">{new Date(alerta.fecha_creacion).toLocaleDateString('es-PE')}</span>
                      </td>
                      <td className="py-3 px-5 text-sm"><span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">{alerta.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">Editar Producto</h2>
              <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">Stock</label>
                <input type="number" value={editData.stock} onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) || 0 })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">Precio (S/.)</label>
                <input type="number" step="0.01" value={editData.precio} onChange={(e) => setEditData({ ...editData, precio: parseFloat(e.target.value) || 0 })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">Stock Mínimo</label>
                <input type="number" value={editData.stock_minimo} onChange={(e) => setEditData({ ...editData, stock_minimo: parseInt(e.target.value) || 0 })} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingId(null)} className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Cancelar</button>
              <button onClick={async () => {
                try {
                  const item = filteredInventario.find(i => i.id === editingId);
                  if (!item) return;
                  await actualizarAlmacenamiento(item.id, { stock: editData.stock, stock_minimo: editData.stock_minimo });
                  await actualizarPrecioProducto(item.producto_id, editData.precio);
                  showAlert('Cambios guardados exitosamente', 'success');
                  setEditingId(null); cargarDatos();
                } catch (error: any) {
                  showAlert(error.response?.data?.message || 'Error al guardar cambios', 'error');
                }
              }} className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm bg-mint-500 text-white hover:bg-mint-600 transition-colors shadow-glow-mint">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50 flex items-center gap-2">
                <Plus size={18} className="text-mint-500" />Agregar Producto
              </h2>
              <button onClick={() => { setShowAddModal(false); setNewProduct({ nombre: '', precio: '', stock: '', stock_minimo: '' }); }}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Nombre del Producto', value: newProduct.nombre, key: 'nombre', placeholder: 'Ej: Arroz Premium 1kg', type: 'text' },
                { label: 'Precio (S/.)', value: newProduct.precio, key: 'precio', placeholder: 'Ej: 5.50', type: 'number' },
                { label: 'Stock Inicial', value: newProduct.stock, key: 'stock', placeholder: 'Ej: 50', type: 'number' },
                { label: 'Stock Mínimo', value: newProduct.stock_minimo, key: 'stock_minimo', placeholder: 'Ej: 10', type: 'number' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">{field.label}</label>
                  <input type={field.type} step={field.type === 'number' ? '0.01' : undefined} value={field.value}
                    onChange={(e) => setNewProduct({ ...newProduct, [field.key]: e.target.value })} placeholder={field.placeholder} className={inputClass} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setNewProduct({ nombre: '', precio: '', stock: '', stock_minimo: '' }); }}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Cancelar</button>
              <button disabled={addingProduct} onClick={async () => {
                if (!newProduct.nombre || !newProduct.precio || !newProduct.stock || !newProduct.stock_minimo) { showAlert('Por favor completa todos los campos', 'error'); return; }
                setAddingProduct(true);
                try {
                  const productoResponse = await fetch('http://localhost:3000/api/productos', {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify({ nombre: newProduct.nombre, precio: parseFloat(newProduct.precio) }),
                  });
                  if (!productoResponse.ok) { const err = await productoResponse.json(); throw new Error(err.message || 'Error al crear producto'); }
                  const producto = await productoResponse.json();
                  const almacenResponse = await fetch('http://localhost:3000/api/almacenamiento', {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify({ producto_id: producto.id, stock: parseInt(newProduct.stock), stock_minimo: parseInt(newProduct.stock_minimo) }),
                  });
                  if (!almacenResponse.ok) { const err = await almacenResponse.json(); throw new Error(err.message || 'Error al crear almacenamiento'); }
                  showAlert('Producto agregado exitosamente', 'success');
                  setShowAddModal(false); setNewProduct({ nombre: '', precio: '', stock: '', stock_minimo: '' }); cargarDatos();
                } catch (error: any) {
                  showAlert(error.message || 'Error al agregar producto', 'error');
                } finally { setAddingProduct(false); }
              }} className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm bg-mint-500 text-white hover:bg-mint-600 transition-colors shadow-glow-mint disabled:opacity-50 disabled:cursor-not-allowed">
                {addingProduct ? <span className="flex items-center justify-center gap-2"><i className="fas fa-spinner animate-spin"></i>Guardando...</span> : <span className="flex items-center justify-center gap-2"><Plus size={16} />Agregar</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
