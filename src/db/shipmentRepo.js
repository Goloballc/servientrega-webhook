const pool = require('./connection');

/**
 * Inserta o actualiza una guía y registra el evento del movimiento.
 * @param {object} shipmentData  - Datos del encabezado de la guía
 * @param {object} eventData     - Datos del objeto Mov
 * @returns {Promise<number>}      ID de la guía en shipments
 */
async function upsertShipmentAndEvent(shipmentData, eventData) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Upsert en shipments
        const [result] = await conn.execute(`
            INSERT INTO shipments (
                numero_guia, fecha_envio, numero_piezas,
                ciudad_remitente, nombre_remitente,
                ciudad_destinatario, nombre_destinatario, direccion_destinatario,
                fecha_probable_entrega,
                id_estado_actual, nombre_estado_actual,
                id_estado_goloba, nombre_estado_goloba,
                fecha_entrega
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                fecha_envio             = VALUES(fecha_envio),
                numero_piezas           = VALUES(numero_piezas),
                ciudad_remitente        = VALUES(ciudad_remitente),
                nombre_remitente        = VALUES(nombre_remitente),
                ciudad_destinatario     = VALUES(ciudad_destinatario),
                nombre_destinatario     = VALUES(nombre_destinatario),
                direccion_destinatario  = VALUES(direccion_destinatario),
                fecha_probable_entrega  = VALUES(fecha_probable_entrega),
                id_estado_actual        = VALUES(id_estado_actual),
                nombre_estado_actual    = VALUES(nombre_estado_actual),
                id_estado_goloba        = VALUES(id_estado_goloba),
                nombre_estado_goloba    = VALUES(nombre_estado_goloba),
                fecha_entrega           = COALESCE(fecha_entrega, VALUES(fecha_entrega))
        `, [
            shipmentData.numeroGuia,
            shipmentData.fechaEnvio,
            shipmentData.numeroPiezas,
            shipmentData.ciudadRemitente,
            shipmentData.nombreRemitente,
            shipmentData.ciudadDestinatario,
            shipmentData.nombreDestinatario,
            shipmentData.direccionDestinatario,
            shipmentData.fechaProbableEntrega,
            shipmentData.idEstadoActual,
            shipmentData.nombreEstadoActual,
            shipmentData.idEstadoGoloba,
            shipmentData.nombreEstadoGoloba,
            shipmentData.fechaEntrega,
        ]);

        // Obtener el ID real (INSERT o UPDATE)
        let shipmentId = result.insertId;
        if (shipmentId === 0) {
            const [rows] = await conn.execute(
                'SELECT id FROM shipments WHERE numero_guia = ?',
                [shipmentData.numeroGuia]
            );
            shipmentId = rows[0].id;
        }

        // Insertar evento
        await conn.execute(`
            INSERT INTO shipment_events (
                shipment_id, id_proceso_logistico, nombre_proceso,
                id_concepto, nombre_concepto,
                ciudad_origen, ciudad_destino, fecha_proceso
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            shipmentId,
            eventData.idProcesoLogistico,
            eventData.nombreProceso,
            eventData.idConcepto,
            eventData.nombreConcepto,
            eventData.ciudadOrigen,
            eventData.ciudadDestino,
            eventData.fechaProceso,
        ]);

        await conn.commit();
        return shipmentId;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

/**
 * Devuelve el estado actual de una guía.
 */
async function findShipmentByGuia(numeroGuia) {
    const [rows] = await pool.execute(
        'SELECT * FROM shipments WHERE numero_guia = ?',
        [numeroGuia]
    );
    return rows[0] ?? null;
}

/**
 * Devuelve el historial completo de eventos de una guía.
 */
async function findEventsByGuia(numeroGuia) {
    const [rows] = await pool.execute(`
        SELECT e.*
        FROM shipment_events e
        INNER JOIN shipments s ON s.id = e.shipment_id
        WHERE s.numero_guia = ?
        ORDER BY e.fecha_proceso ASC
    `, [numeroGuia]);
    return rows;
}

module.exports = { upsertShipmentAndEvent, findShipmentByGuia, findEventsByGuia };
