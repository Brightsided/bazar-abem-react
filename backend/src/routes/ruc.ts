import { Router } from 'express';
import { calcularRUC } from '../controllers/rucController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/calcular', calcularRUC);

export default router;
