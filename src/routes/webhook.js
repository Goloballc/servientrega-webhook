const express = require('express');
const router = express.Router();
const config = require('../config');
const { handleWebhook } = require('../handlers/webhookHandler');

// Middleware de autenticación exclusivo para esta ruta
router.use((req, res, next) => {
    const token = req.headers['x-servientrega-auth'];
    if (!token || token !== config.authToken) {
        console.warn(`[webhook] Auth fallida — IP: ${req.ip}`);
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
});

router.post('/', handleWebhook);

module.exports = router;
