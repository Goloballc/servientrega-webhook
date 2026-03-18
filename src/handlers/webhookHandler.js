const { upsertShipmentAndEvent } = require('../db/shipmentRepo');
const { resolveState, isDelivered } = require('../stateMap');

/**
 * Parsea el payload del webhook y lo normaliza para persistencia.
 * El payload real usa PascalCase. Fechas en formato YYYY-MM-DD HH:MM:SS.mmm
 */
function parsePayload(payload) {
    const mov = payload.Mov;

    const idProceso = parseInt(mov.IDProcesoLogistico, 10);
    const state = resolveState(idProceso);

    // Estado desconocido: loguear y continuar sin bloquear
    if (!state) {
        console.warn(`[webhookHandler] IDProcesoLogistico desconocido: ${idProceso} — registrando como DESCONOCIDO`);
    }

    const fechaProceso = mov.FechaProcesoLogistico?.trim() || null;
    const fechaEntrega = isDelivered(idProceso) ? fechaProceso : null;

    const shipmentData = {
        numeroGuia:            payload.NumeroGuia?.trim(),
        fechaEnvio:            payload.FechaEnvio?.trim()         || null,
        numeroPiezas:          parseInt(payload.NumeroTotalPiezas, 10) || 1,
        ciudadRemitente:       payload.CiudadRemitente?.trim()    || null,
        nombreRemitente:       payload.NombreRemitente?.trim()    || null,
        ciudadDestinatario:    payload.CiudadDestinatario?.trim() || null,
        nombreDestinatario:    payload.NombreDestinatario?.trim() || null,
        direccionDestinatario: payload.DireccionDestinatario?.trim() || null,
        fechaProbableEntrega:  payload.FechaProbableEntrega?.trim() || null,
        idEstadoActual:        parseInt(payload.IDEstadoActualEnvio, 10),
        nombreEstadoActual:    payload.EstadoActualEnvio?.trim()  || '',
        idEstadoGoloba:        state?.idEstadoGoloba  ?? 0,
        nombreEstadoGoloba:    state?.nombreEstadoGoloba ?? 'DESCONOCIDO',
        fechaEntrega,
    };

    const eventData = {
        idProcesoLogistico: idProceso,
        nombreProceso:      mov.NombreProceso?.trim()          || '',
        idConcepto:         parseInt(mov.IDConcepto, 10)       || 0,
        nombreConcepto:     mov.NombreConcepto?.trim()         || '',
        ciudadOrigen:       mov.CiudadOrigenProceso?.trim()    || null,
        ciudadDestino:      mov.CiudadDestinoProceso?.trim()   || null,
        fechaProceso:       fechaProceso,
    };

    return { shipmentData, eventData };
}

/**
 * Maneja la recepción del webhook de Servientrega.
 */
async function handleWebhook(req, res) {
    // Si viene envuelto en la estructura del log (para re-procesar archivos capturados),
    // extraemos el payload interno. En producción Servientrega envía el payload directo.
    const raw = req.body;
    const payload = raw?.payload ?? raw;

    if (!payload?.NumeroGuia) {
        console.warn('[webhookHandler] Payload recibido sin NumeroGuia. Keys recibidas:', Object.keys(payload || {}));
        return res.status(400).json({ error: 'Payload inválido' });
    }

    try {
        const { shipmentData, eventData } = parsePayload(payload);
        await upsertShipmentAndEvent(shipmentData, eventData);
        console.log(`[webhookHandler] Guía ${shipmentData.numeroGuia} procesada — estado: ${shipmentData.nombreEstadoGoloba}`);
    } catch (err) {
        console.error('[webhookHandler] Error al persistir payload:', err);
        // Respondemos 200 de todas formas para no provocar reintentos de Servientrega
        // El error queda en el log del servidor para revisión manual
    }

    res.status(200).json({ received: true });
}

module.exports = { handleWebhook };
