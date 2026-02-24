import rateLimit from 'express-rate-limit';

// Límite general para todas las rutas
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 peticiones por IP
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intente nuevamente en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite estricto para autenticación
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos de login por IP
  skipSuccessfulRequests: true, // No contar logins exitosos
  message: {
    success: false,
    message: 'Demasiados intentos de login, intente nuevamente en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
