import { Router } from 'express';
import {
  getVentas,
  getVenta,
  createVenta,
  deleteVenta,
} from '../controllers/ventasController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getVentas);
router.get('/:id', getVenta);
router.post('/', createVenta);
router.delete('/:id', deleteVenta);

export default router;
