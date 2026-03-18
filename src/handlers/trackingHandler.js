const { findShipmentByGuia, findEventsByGuia } = require('../db/shipmentRepo');

/**
 * POST /tracking
 * Body: { "numeroGuia": "2271129990" }
 * Devuelve el estado actual de la guía.
 */
async function handleTracking(req, res) {
    const numeroGuia = req.body?.numeroGuia?.trim();

    if (!numeroGuia) {
        return res.status(400).json({ error: 'El campo numeroGuia es requerido' });
    }

    const shipment = await findShipmentByGuia(numeroGuia);

    if (!shipment) {
        return res.status(404).json({ error: 'Guía no encontrada' });
    }

    return res.status(200).json({
        numeroGuia:           shipment.numero_guia,
        fechaEnvio:           shipment.fecha_envio,
        numeroPiezas:         shipment.numero_piezas,
        ciudadRemitente:      shipment.ciudad_remitente,
        nombreRemitente:      shipment.nombre_remitente,
        ciudadDestinatario:   shipment.ciudad_destinatario,
        nombreDestinatario:   shipment.nombre_destinatario,
        direccionDestinatario:shipment.direccion_destinatario,
        fechaProbableEntrega: shipment.fecha_probable_entrega,
        idEstadoActual:       shipment.id_estado_actual,
        nombreEstadoActual:   shipment.nombre_estado_actual,
        idEstadoGoloba:       shipment.id_estado_goloba,
        nombreEstadoGoloba:   shipment.nombre_estado_goloba,
        fechaEntrega:         shipment.fecha_entrega,
        updatedAt:            shipment.updated_at,
    });
}

/**
 * POST /tracking/history
 * Body: { "numeroGuia": "2271129990" }
 * Devuelve el historial completo de movimientos de la guía.
 */
async function handleTrackingHistory(req, res) {
    const numeroGuia = req.body?.numeroGuia?.trim();

    if (!numeroGuia) {
        return res.status(400).json({ error: 'El campo numeroGuia es requerido' });
    }

    const shipment = await findShipmentByGuia(numeroGuia);

    if (!shipment) {
        return res.status(404).json({ error: 'Guía no encontrada' });
    }

    const eventos = await findEventsByGuia(numeroGuia);

    return res.status(200).json({
        numeroGuia,
        eventos: eventos.map(e => ({
            idProcesoLogistico: e.id_proceso_logistico,
            nombreProceso:      e.nombre_proceso,
            ciudadOrigen:       e.ciudad_origen,
            ciudadDestino:      e.ciudad_destino,
            fechaProceso:       e.fecha_proceso,
        })),
    });
}

module.exports = { handleTracking, handleTrackingHistory };
