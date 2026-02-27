import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// API para recibir notificaciones (Llamado por el Scheduler)
app.post('/', async (req, res) => {
    const { endpointId, oldStatus, newStatus, name, url } = req.body;

    if (!endpointId || !newStatus) {
        return res.status(400).json({ error: 'Faltan datos de notificación' });
    }

    const message = `[ALERTA] Endpoint '${name}' (${url}) cambió de ${oldStatus} a ${newStatus}.`;

    try {
        // 1. Log simulation (Mock Email)
        console.log('--------------------------------------------------');
        console.log(`✉️ MOCK EMAIL ENVIADO:`);
        console.log(`Asunto: Cambio de estado en API Sentinel - ${name}`);
        console.log(`Cuerpo: ${message}`);
        console.log('--------------------------------------------------');

        // 2. Webhook simulation (Si el usuario configuró uno - Mock)
        const webhookUrl = process.env.USER_WEBHOOK_URL;
        if (webhookUrl) {
            console.log(`Disparando Webhook hacia: ${webhookUrl}`);
            try {
                await axios.post(webhookUrl, {
                    event: 'endpoint_status_change',
                    data: {
                        endpointId,
                        name,
                        url,
                        oldStatus,
                        newStatus,
                        timestamp: new Date()
                    }
                });
                console.log('✅ Webhook disparado correctamente.');
            } catch (whErr) {
                console.error('❌ Error disparando webhook:', whErr.message);
            }
        }

        res.status(200).json({ success: true, message: 'Notificación procesada' });
    } catch (error) {
        console.error('Error procesando notificación:', error);
        res.status(500).json({ error: 'Error interno procesando notificación' });
    }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'Notification Service' }));

app.listen(PORT, () => {
    console.log(`[Notification Service] Iniciado en puerto ${PORT}`);
});
