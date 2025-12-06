import { Router } from 'express';
import {
  getDashboardStats,
  getReporteVentas,
} from '../controllers/reportesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.post('/ventas', getReporteVentas);

export default router;
