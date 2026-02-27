import express from 'express';
import dotenv from 'dotenv';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;
const prisma = new PrismaClient();

// Configuración de Redis
const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_PASSWORD ? { rejectUnauthorized: false } : undefined,
    maxRetriesPerRequest: null, // Requerido por BullMQ
});

// Colas
const checkQueue = new Queue('endpointChecks', { connection });

// Worker para ejecutar HTTP checks
const worker = new Worker('endpointChecks', async job => {
    const { id, url, method } = job.data;
    const startTime = Date.now();
    let statusCode;
    let responseTime;
    let status = 'ONLINE';

    try {
        const response = await axios({
            method: method || 'GET',
            url: url,
            timeout: 10000 // 10s timeout
        });

        statusCode = response.status;
    } catch (error) {
        if (error.response) {
            statusCode = error.response.status;
        } else {
            statusCode = 500; // Network error / timeout
        }
        status = 'OFFLINE';
    }

    responseTime = Date.now() - startTime;

    // Registrar el check
    await prisma.checkLog.create({
        data: {
            endpointId: id,
            statusCode,
            responseTime
        }
    });

    // Obtener estado anterior
    const endpoint = await prisma.endpoint.findUnique({ where: { id } });

    // Actualizar status del endpoint
    if (endpoint.status !== status) {
        await prisma.endpoint.update({
            where: { id },
            data: { status, lastChecked: new Date() }
        });

        // Disparar evento a Notification Service si cambió de estado
        try {
            await axios.post(process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004/', {
                endpointId: id,
                oldStatus: endpoint.status,
                newStatus: status,
                name: endpoint.name,
                url: endpoint.url
            });
        } catch (e) {
            console.error('No se pudo notificar al Notification Service', e.message);
        }
    } else {
        // Solo actualizar timestamp
        await prisma.endpoint.update({
            where: { id },
            data: { lastChecked: new Date() }
        });
    }

    return { statusCode, responseTime, status };
}, { connection });

worker.on('completed', job => {
    console.log(`Job ${job.id} origin ${job.data.url} completed.`);
});
worker.on('failed', (job, err) => {
    console.log(`Job ${job.id} origin ${job.data.url} failed with error ${err.message}`);
});

// Programar chequeos (Scheduler principal)
const scheduleChecks = async () => {
    console.log('Agendando chequeos...');
    try {
        const endpoints = await prisma.endpoint.findMany();

        for (const ep of endpoints) {
            // Simplificado: En un entorno real, evaluaríamos el 'interval' antes de encolar.
            // Aquí encolamos todos cada vez que corre el scheduler loop, 
            // o usamos 'repeat' de BullMQ para intervalos específicos por endpoint.

            // Ejemplo usando repetición automatizada de BullMQ basado en el intervalo (en minutos)
            await checkQueue.add(
                `check-${ep.id}`,
                { id: ep.id, url: ep.url, method: ep.method },
                {
                    repeat: {
                        every: ep.interval * 60000,
                    },
                    jobId: `repeat-${ep.id}` // Para asegurar unicidad por configuración
                }
            );
        }
        console.log(`Se programaron/verificaron ${endpoints.length} endpoints.`);
    } catch (e) {
        console.error('Error agendando endpoints:', e);
    }
};

app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Forzar re-lectura de repetidores (útil si se agregan endpoints)
app.post('/reload', async (req, res) => {
    await scheduleChecks();
    res.json({ status: 'Reloaded Queue' });
});

app.listen(PORT, async () => {
    console.log(`[Scheduler Service] Iniciado en puerto ${PORT}`);
    // Iniciar el programador luego de un breve delay
    setTimeout(scheduleChecks, 5000);
});
