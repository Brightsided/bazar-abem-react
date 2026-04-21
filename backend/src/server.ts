import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import ventasRoutes from './routes/ventas.js';
import reportesRoutes from './routes/reportes.js';
import productosRoutes from './routes/productos.js';
import clientesRoutes from './routes/clientes.js';
import rucRoutes from './routes/ruc.js';
import comprobantesRoutes from './routes/comprobantes.js';
import almacenamientoRoutes from './routes/almacenamiento.js';
import facturacionRoutes from './routes/facturacion.js';
import cierreCajaRoutes from './routes/cierreCaja.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './config/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Railway expone la app detrás de proxy; esto evita falsos errores en rate-limit.
app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// CORS configuración segura
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : true)
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
// ✅ Agregar compresión GZIP
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Rate Limiting - Protección contra ataques de fuerza bruta y DoS
// Aplicar rate limiting general a todas las rutas
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ruc', rucRoutes);
app.use('/api/comprobantes', comprobantesRoutes);
app.use('/api/almacenamiento', almacenamientoRoutes);
app.use('/api/facturacion', facturacionRoutes);
app.use('/api/cierre-caja', cierreCajaRoutes);

// Servir frontend compilado cuando backend y frontend se despliegan en el mismo servicio.
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }

    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bazar Abem API is running' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
