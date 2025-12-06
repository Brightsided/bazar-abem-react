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
  productos: DetalleProducto[];
  metodo_pago: 'Efectivo' | 'Tarjeta De Credito/Debito' | 'Yape';
}
