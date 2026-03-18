const express = require('express');
const config = require('./config');
const { runMigrations } = require('./db/migrations');
const webhookRoutes = require('./routes/webhook');
const trackingRoutes = require('./routes/tracking');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', service: 'servientrega-webhook' }));
app.use('/webhook', webhookRoutes);
app.use('/tracking', trackingRoutes);

async function start() {
    await runMigrations();
    app.listen(config.port, () => {
        console.log(`Servientrega Webhook escuchando en puerto ${config.port}`);
    });
}

start().catch(err => {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
});
