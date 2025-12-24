import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  generarComprobante,
  firmarComprobante,
  enviarComprobante,
  obtenerEstado,
  reenviar,
  listar,
  obtenerXml,
  obtenerCdr,
  obtenerDetalles,
  procesarComprobante,
} from '../controllers/facturacionElectronicaController.js';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

/**
 * Rutas de Facturación Electrónica SUNAT
 */

// Generar comprobante
router.post('/generar', generarComprobante);

// Firmar comprobante
router.post('/firmar/:ventaId', firmarComprobante);

// Enviar comprobante a SUNAT
router.post('/enviar/:ventaId', enviarComprobante);

// Reenviar comprobante
router.post('/reenviar/:ventaId', reenviar);

// Flujo completo (generar, firmar y enviar)
router.post('/procesar/:ventaId', procesarComprobante);

// Obtener estado
router.get('/estado/:ventaId', obtenerEstado);

// Listar comprobantes
router.get('/listar', listar);

// Obtener XML
router.get('/xml/:ventaId', obtenerXml);

// Obtener CDR
router.get('/cdr/:ventaId', obtenerCdr);

// Obtener detalles completos
router.get('/detalles/:ventaId', obtenerDetalles);

export default router;
