import { Router } from 'express';
import { getClientes, createCliente } from '../controllers/clientesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getClientes);
router.post('/', createCliente);

export default router;
