import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad y utilidad
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Rate Limiting para prevenir abuso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana por IP
  message: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.',
});
app.use(limiter);

// Definición de las rutas de proxy hacia los microservicios
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  monitor: process.env.MONITOR_SERVICE_URL || 'http://localhost:3002',
};

// Rutear solicitudes de /api/auth al Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '',
  },
}));

// Rutear solicitudes de /api/monitors al Monitor Service
app.use('/api/monitors', createProxyMiddleware({
  target: services.monitor,
  changeOrigin: true,
  pathRewrite: {
    '^/api/monitors': '',
  },
}));

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'API Sentinel Gateway is running', status: 'OK' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el API Gateway!');
});

app.listen(PORT, () => {
  console.log(`[API Gateway] Servicio iniciado en http://localhost:${PORT}`);
});
