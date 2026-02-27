import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Middleware simple para simular autenticación para el MS interno.
const requireAuth = (req, res, next) => {
    // Para simplificar la demo, asumo que todos los requests como owner "1"
    req.userId = 1;
    next();
};

// Crear nuevo endpoint a monitorear
app.post('/', requireAuth, async (req, res) => {
    try {
        const { name, url, method = 'GET', interval = 5 } = req.body;

        const endpoint = await prisma.endpoint.create({
            data: {
                userId: req.userId,
                name,
                url,
                method,
                interval,
                status: 'PENDING'
            }
        });

        res.status(201).json(endpoint);
    } catch (error) {
        console.error('Error creating endpoint:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// Listar todos los endpoints del usuario
app.get('/', requireAuth, async (req, res) => {
    try {
        const endpoints = await prisma.endpoint.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(endpoints);
    } catch (error) {
        console.error('Error fetching endpoints:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// Obtener un endpoint específico con sus stats
app.get('/:id', requireAuth, async (req, res) => {
    try {
        const endpointId = parseInt(req.params.id, 10);
        const endpoint = await prisma.endpoint.findFirst({
            where: { id: endpointId, userId: req.userId },
            include: {
                logs: {
                    orderBy: { createdAt: 'desc' },
                    take: 50
                },
                incidents: {
                    orderBy: { startedAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!endpoint) return res.status(404).json({ error: 'Endpoint no encontrado' });

        res.json(endpoint);
    } catch (error) {
        console.error('Error fetching endpoint:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// Actualizar un endpoint
app.put('/:id', requireAuth, async (req, res) => {
    try {
        const endpointId = parseInt(req.params.id, 10);
        const { name, url, method, interval } = req.body;

        // Check owner
        const existing = await prisma.endpoint.findFirst({ where: { id: endpointId, userId: req.userId } });
        if (!existing) return res.status(404).json({ error: 'Endpoint no encontrado' });

        const updated = await prisma.endpoint.update({
            where: { id: endpointId },
            data: { name, url, method, interval }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating endpoint:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// Eliminar un endpoint
app.delete('/:id', requireAuth, async (req, res) => {
    try {
        const endpointId = parseInt(req.params.id, 10);

        // Check owner
        const existing = await prisma.endpoint.findFirst({ where: { id: endpointId, userId: req.userId } });
        if (!existing) return res.status(404).json({ error: 'Endpoint no encontrado' });

        await prisma.endpoint.delete({ where: { id: endpointId } });
        res.json({ message: 'Endpoint eliminado' });
    } catch (error) {
        console.error('Error deleting endpoint:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// API interna para el Scheduler (no requiere auth de usuario, pero debería estar protegida en red interna)
app.get('/internal/active-endpoints', async (req, res) => {
    try {
        // Obtener endpoints que necesitan ser revisados según su intervalo
        // Simplificado por ahora: retorna todos los activos
        const endpoints = await prisma.endpoint.findMany();
        res.json(endpoints);
    } catch (error) {
        res.status(500).json({ error: 'Error interno' });
    }
});

app.listen(PORT, () => {
    console.log(`[Monitor Service] Iniciado en puerto ${PORT}`);
});
