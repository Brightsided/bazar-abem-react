import { Router } from 'express';
import { generarPDF, enviarEmail, enviarBoletaYFactura } from '../controllers/comprobantesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:id/pdf', generarPDF);
router.post('/:id/email', enviarEmail);
router.post('/:id/enviar-boleta-factura', enviarBoletaYFactura);

export default router;
