import { Router } from 'express';
import {
  getProductos,
  searchProductos,
  createProducto,
} from '../controllers/productosController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getProductos);
router.get('/search', searchProductos);
router.post('/', createProducto);

export default router;
