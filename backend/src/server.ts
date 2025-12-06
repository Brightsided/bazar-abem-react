import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import ventasRoutes from './routes/ventas.js';
import reportesRoutes from './routes/reportes.js';
import productosRoutes from './routes/productos.js';
import clientesRoutes from './routes/clientes.js';
import rucRoutes from './routes/ruc.js';
import comprobantesRoutes from './routes/comprobantes.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
// ✅ Agregar compresión GZIP
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ruc', rucRoutes);
app.use('/api/comprobantes', comprobantesRoutes);

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
