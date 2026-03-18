const express = require('express');
const router = express.Router();
const config = require('../config');
const { handleWebhook } = require('../handlers/webhookHandler');

// Middleware de autenticación exclusivo para esta ruta.
// Soporta dos tokens activos simultáneamente para cubrir el período de
// transición durante la rotación de claves cada 90 días (según doc. Servientrega).
router.use((req, res, next) => {
    const token = req.headers['x-servientrega-auth'];
    const validTokens = [config.authToken, config.authTokenSecondary].filter(Boolean);
    if (!token || !validTokens.includes(token)) {
        console.warn(`[webhook] Auth fallida — IP: ${req.ip}`);
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
});

router.post('/', handleWebhook);

module.exports = router;
