// types/index.ts

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  rol: 'Administrador' | 'Vendedor';
}

export interface Cliente {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
}

export interface DetalleProducto {
  producto_id?: number;
  nombre?: string;
  producto?: string;
  cantidad: number;
  precio: number;
}

export interface Venta {
  id: number;
  cliente: string;
  cliente_id?: number;
  productos: string;
  precio_total: number;
  metodo_pago: 'Efectivo' | 'Tarjeta De Credito/Debito' | 'Yape';
  fecha_venta: string;
  usuario_id?: number;
}

export interface VentaDetallada extends Venta {
  detalle_productos: DetalleProducto[];
  usuario?: Usuario;
}

export interface DashboardStats {
  ventasHoy: number;
  totalHoy: number;
  ventasSemana: number;
  totalSemana: number;
  promedioVenta: number;
  ultimasVentas: VentaDetallada[];
}

export interface FiltroReporte {
  filtro: 'hoy' | 'semana' | 'mes' | 'ano' | 'personalizado';
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface EstadisticaMetodoPago {
  metodo_pago: string;
  cantidad: number;
  total: number;
}

export interface RankingUsuario {
  id: number;
  nombre: string;
  username: string;
  rol: string;
  cantidad: number;
  total: number;
}

export interface CalculoRUC {
  categoria: number | string;
  monto: number | string;
  total_ventas: number;
}

export interface ReporteResponse {
  success: boolean;
  ventas: VentaDetallada[];
  ventasPorFecha: Record<string, number>;
  ventasPorFechaDetalle: Record<string, { cantidad: number; total: number }>;
  metodosPago: Record<string, number>;
  metodosPagoDetalle: EstadisticaMetodoPago[];
  totalVentas: number;
  fechaInicio: string;
  fechaFin: string;
  filtro: string;
  ranking: RankingUsuario[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: Usuario;
}

export interface NuevaVenta {
  cliente: string;
  cliente_id?: number | null;
  productos: DetalleProducto[];
  metodo_pago: 'Efectivo' | 'Tarjeta De Credito/Debito' | 'Yape';
}

// Tipos para Almacenamiento
export interface ProductoAlmacenamiento {
  id: number;
  nombre: string;
  precio: number;
}

export interface Almacenamiento {
  id: number;
  producto_id: number;
  stock: number;
  stock_minimo: number;
  codigo_barras?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  producto: ProductoAlmacenamiento;
}

export interface AlertaStock {
  id: number;
  almacenamiento_id: number;
  producto_id: number;
  tipo_alerta: string;
  stock_actual: number;
  stock_minimo: number;
  estado: 'ACTIVA' | 'RESUELTA';
  fecha_creacion: string;
  fecha_resolucion?: string;
  producto: ProductoAlmacenamiento;
}

export interface MovimientoInventario {
  id: number;
  almacenamiento_id: number;
  producto_id: number;
  tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  referencia_venta_id?: number;
  descripcion?: string;
  usuario_id?: number;
  fecha_movimiento: string;
  producto: ProductoAlmacenamiento;
  usuario?: Usuario;
}

// Tipos para Facturación Electrónica SUNAT
export interface ComprobanteElectronico {
  id: number;
  venta_id: number;
  tipo: 'FACTURA' | 'BOLETA';
  serie: string;
  numero: number;
  xmlSinFirma: string;
  xmlFirmado?: string;
  cdrXml?: string;
  hashCpe?: string;
  estado: 'PENDIENTE' | 'FIRMADO' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO';
  codigoSunat?: string;
  mensajeSunat?: string;
  fechaEnvio?: string;
  fechaRespuesta?: string;
  intentosEnvio: number;
  ultimoError?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  venta?: VentaDetallada;
}

export interface EstadoComprobante {
  success: boolean;
  comprobante?: ComprobanteElectronico;
  message?: string;
}

export interface ResultadoFacturacion {
  success: boolean;
  message: string;
  comprobante?: {
    id: number;
    ventaId: number;
    tipo: string;
    serie: string;
    numero: number;
    estado: string;
    codigoSunat?: string;
    mensajeSunat?: string;
  };
  error?: string;
}
