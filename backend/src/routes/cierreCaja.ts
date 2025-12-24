import { Router } from 'express';
import { authenticate } from '../middleware/auth';
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
router.post('/abrir', authenticate, abrirCaja);
router.post('/cerrar', authenticate, cerrarCaja);
router.get('/', authenticate, listarCierres);

export default router;
