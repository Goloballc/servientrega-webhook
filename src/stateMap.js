/**
 * Catálogo de estados de Servientrega.
 * Fuente: Catálogo oficial enviado por Servientrega (2026-03-17).
 *
 * Mapea IDProcesoLogistico → { idEstadoGoloba, nombreEstadoGoloba }
 *
 * NOTA: ID_PROCESO 11 (ENTREGA VERIFICADA) puede mapear a estado 3 (ENTREGADO)
 * o 4 (ENTREGADO A REMITENTE) según el contexto. Se usa el estado 3 por defecto;
 * el estado 4 se determina por lógica adicional en el handler si aplica.
 */
const STATE_MAP = {
    1:  { idEstadoGoloba: 9, nombreEstadoGoloba: 'EN ALISTAMIENTO DEL CLIENTE' },
    3:  { idEstadoGoloba: 9, nombreEstadoGoloba: 'EN ALISTAMIENTO DEL CLIENTE' },
    6:  { idEstadoGoloba: 2, nombreEstadoGoloba: 'EN PROCESAMIENTO' },
    9:  { idEstadoGoloba: 2, nombreEstadoGoloba: 'EN PROCESAMIENTO' },
    10: { idEstadoGoloba: 2, nombreEstadoGoloba: 'EN PROCESAMIENTO' },
    11: { idEstadoGoloba: 3, nombreEstadoGoloba: 'ENTREGADO' },
    12: { idEstadoGoloba: 2, nombreEstadoGoloba: 'EN PROCESAMIENTO' },
    14: { idEstadoGoloba: 2, nombreEstadoGoloba: 'EN PROCESAMIENTO' },
    16: { idEstadoGoloba: 5, nombreEstadoGoloba: 'SINIESTRADO' },
    24: { idEstadoGoloba: 3, nombreEstadoGoloba: 'ENTREGADO' },
    25: { idEstadoGoloba: 2, nombreEstadoGoloba: 'EN PROCESAMIENTO' },
    27: { idEstadoGoloba: 1, nombreEstadoGoloba: 'RECIBIDO DEL CLIENTE' },
    28: { idEstadoGoloba: 1, nombreEstadoGoloba: 'RECIBIDO DEL CLIENTE' },
    31: { idEstadoGoloba: 2, nombreEstadoGoloba: 'EN PROCESAMIENTO' },
    32: { idEstadoGoloba: 2, nombreEstadoGoloba: 'EN PROCESAMIENTO' },
    42: { idEstadoGoloba: 1, nombreEstadoGoloba: 'RECIBIDO DEL CLIENTE' },
    43: { idEstadoGoloba: 2, nombreEstadoGoloba: 'EN PROCESAMIENTO' },
    45: { idEstadoGoloba: 2, nombreEstadoGoloba: 'EN PROCESAMIENTO' },
};

// IDs de proceso que corresponden a una entrega al destinatario final
const DELIVERED_PROCESS_IDS = new Set([11, 24]);

/**
 * Resuelve el estado Goloba a partir del IDProcesoLogistico.
 * Retorna null si el proceso no está en el catálogo (estado desconocido).
 */
function resolveState(idProcesoLogistico) {
    return STATE_MAP[idProcesoLogistico] ?? null;
}

/**
 * Indica si el proceso logístico corresponde a una entrega al destinatario.
 */
function isDelivered(idProcesoLogistico) {
    return DELIVERED_PROCESS_IDS.has(idProcesoLogistico);
}

module.exports = { resolveState, isDelivered };
