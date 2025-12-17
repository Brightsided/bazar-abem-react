import api from './api';

export interface Almacenamiento {
  id: number;
  producto_id: number;
  stock: number;
  stock_minimo: number;
  codigo_barras?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  producto: {
    id: number;
    nombre: string;
    precio: number | string;
  };
}

export interface AlertaStock {
  id: number;
  almacenamiento_id: number;
  producto_id: number;
  tipo_alerta: string;
  stock_actual: number;
  stock_minimo: number;
  estado: string;
  fecha_creacion: string;
  fecha_resolucion?: string;
  producto: {
    id: number;
    nombre: string;
  };
}

export interface MovimientoInventario {
  id: number;
  almacenamiento_id: number;
  producto_id: number;
  tipo_movimiento: string;
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  referencia_venta_id?: number;
  descripcion?: string;
  usuario_id?: number;
  fecha_movimiento: string;
  producto: {
    id: number;
    nombre: string;
  };
  usuario?: {
    id: number;
    nombre: string;
    username: string;
  };
}

// Obtener todos los productos del almacenamiento
export const getAlmacenamiento = async (): Promise<Almacenamiento[]> => {
  const response = await api.get('/almacenamiento');
  return response.data;
};

// Obtener productos disponibles para venta
export const getProductosDisponibles = async (): Promise<Almacenamiento[]> => {
  const response = await api.get('/almacenamiento/disponibles');
  return response.data;
};

// Obtener productos con stock bajo
export const getProductosStockBajo = async (): Promise<Almacenamiento[]> => {
  const response = await api.get('/almacenamiento/stock-bajo');
  return response.data;
};

// Obtener un producto del almacenamiento
export const getAlmacenamientoProducto = async (id: number): Promise<Almacenamiento> => {
  const response = await api.get(`/almacenamiento/${id}`);
  return response.data;
};

// Actualizar stock de un producto
export const actualizarStock = async (
  almacenamiento_id: number,
  cantidad: number,
  tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE',
  descripcion?: string
) => {
  const response = await api.post('/almacenamiento/actualizar-stock', {
    almacenamiento_id,
    cantidad,
    tipo_movimiento,
    descripcion,
  });
  return response.data;
};

// Generar código de barras
export const generarCodigoBarras = async (almacenamiento_id: number) => {
  const response = await api.post('/almacenamiento/generar-codigo-barras', {
    almacenamiento_id,
  });
  return response.data;
};

// Obtener historial de movimientos
export const getMovimientosInventario = async (
  producto_id?: number,
  tipo_movimiento?: string,
  fecha_inicio?: string,
  fecha_fin?: string
): Promise<MovimientoInventario[]> => {
  const params = new URLSearchParams();
  if (producto_id) params.append('producto_id', producto_id.toString());
  if (tipo_movimiento) params.append('tipo_movimiento', tipo_movimiento);
  if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
  if (fecha_fin) params.append('fecha_fin', fecha_fin);

  const response = await api.get(`/almacenamiento/movimientos/historial?${params}`);
  return response.data;
};

// Obtener alertas de stock
export const getAlertasStock = async (estado?: string): Promise<AlertaStock[]> => {
  const params = new URLSearchParams();
  if (estado) params.append('estado', estado);

  const response = await api.get(`/almacenamiento/alertas/lista?${params}`);
  return response.data;
};

// Actualizar almacenamiento (stock, precio, stock_minimo)
export const actualizarAlmacenamiento = async (
  almacenamiento_id: number,
  data: {
    stock?: number;
    stock_minimo?: number;
  }
) => {
  const response = await api.put(`/almacenamiento/${almacenamiento_id}`, data);
  return response.data;
};

// Actualizar precio del producto
export const actualizarPrecioProducto = async (
  producto_id: number,
  precio: number
) => {
  const response = await api.put(`/productos/${producto_id}`, { precio });
  return response.data;
};
