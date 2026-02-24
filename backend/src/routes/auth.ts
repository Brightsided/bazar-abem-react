import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../config/rateLimiter.js';

const router = Router();

// Aplicar rate limiting estricto solo al login
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
