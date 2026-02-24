import { Router } from 'express';
import { generarPDF, enviarEmail, enviarBoletaYFactura } from '../controllers/comprobantesController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:id/pdf', generarPDF);
router.post('/:id/email', isAdmin, enviarEmail);
router.post('/:id/enviar-boleta-factura', isAdmin, enviarBoletaYFactura);

export default router;
