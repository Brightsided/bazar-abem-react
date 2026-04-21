import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import {
  abrirCaja,
  cerrarCaja,
  listarCierres,
  obtenerEstadoCaja,
  previsualizarCierre,
} from '../controllers/cierreCajaController.js';

const router = Router();

router.get('/estado', authenticate, obtenerEstadoCaja);
router.get('/preview', authenticate, previsualizarCierre);
router.post('/abrir', authenticate, isAdmin, abrirCaja);
router.post('/cerrar', authenticate, isAdmin, cerrarCaja);
router.get('/', authenticate, listarCierres);

export default router;
