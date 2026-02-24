import { Router } from 'express';
import {
  getProductos,
  searchProductos,
  createProducto,
  updateProducto,
} from '../controllers/productosController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getProductos);
router.get('/search', searchProductos);
router.post('/', isAdmin, createProducto);
router.put('/:id', isAdmin, updateProducto);

export default router;
