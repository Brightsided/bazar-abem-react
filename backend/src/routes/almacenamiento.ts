import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getAlmacenamiento,
  getAlmacenamientoProducto,
  getProductosStockBajo,
  actualizarStock,
  getMovimientosInventario,
  getAlertasStock,
  generarCodigoBarras,
  getProductosDisponibles,
  createAlmacenamiento,
  updateAlmacenamiento,
} from '../controllers/almacenamientoController.js';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticate);

// Obtener todos los productos del almacenamiento
router.get('/', getAlmacenamiento);

// Obtener productos disponibles para venta
router.get('/disponibles', getProductosDisponibles);

// Obtener productos con stock bajo
router.get('/stock-bajo', getProductosStockBajo);

// Crear nuevo almacenamiento
router.post('/', createAlmacenamiento);

// Obtener un producto del almacenamiento
router.get('/:id', getAlmacenamientoProducto);

// Actualizar almacenamiento (stock y stock_minimo)
router.put('/:id', updateAlmacenamiento);

// Actualizar stock de un producto
router.post('/actualizar-stock', actualizarStock);

// Generar código de barras
router.post('/generar-codigo-barras', generarCodigoBarras);

// Obtener historial de movimientos
router.get('/movimientos/historial', getMovimientosInventario);

// Obtener alertas de stock
router.get('/alertas/lista', getAlertasStock);

export default router;
