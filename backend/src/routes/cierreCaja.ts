import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  abrirCaja,
  cerrarCaja,
  listarCierres,
  obtenerEstadoCaja,
  previsualizarCierre,
} from '../controllers/cierreCajaController';

const router = Router();

router.get('/estado', authenticate, obtenerEstadoCaja);
router.get('/preview', authenticate, previsualizarCierre);
router.post('/abrir', authenticate, isAdmin, abrirCaja);
router.post('/cerrar', authenticate, isAdmin, cerrarCaja);
router.get('/', authenticate, listarCierres);

export default router;
