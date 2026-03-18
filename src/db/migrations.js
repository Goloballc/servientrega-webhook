const pool = require('./connection');

/**
 * Crea las tablas si no existen.
 * Llamar una vez al arrancar el servidor.
 */
async function runMigrations() {
    const conn = await pool.getConnection();
    try {
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS shipments (
                id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                numero_guia             VARCHAR(30)     NOT NULL,
                fecha_envio             DATETIME,
                numero_piezas           TINYINT UNSIGNED DEFAULT 1,
                ciudad_remitente        VARCHAR(100),
                nombre_remitente        VARCHAR(150),
                ciudad_destinatario     VARCHAR(100),
                nombre_destinatario     VARCHAR(150),
                direccion_destinatario  VARCHAR(255),
                fecha_probable_entrega  DATETIME,
                id_estado_actual        TINYINT UNSIGNED NOT NULL,
                nombre_estado_actual    VARCHAR(60)     NOT NULL,
                id_estado_goloba        TINYINT UNSIGNED NOT NULL,
                nombre_estado_goloba    VARCHAR(60)     NOT NULL,
                fecha_entrega           DATETIME,
                created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uq_numero_guia (numero_guia),
                INDEX idx_fecha_entrega (fecha_entrega)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.execute(`
            CREATE TABLE IF NOT EXISTS shipment_events (
                id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                shipment_id             INT UNSIGNED    NOT NULL,
                id_proceso_logistico    SMALLINT UNSIGNED NOT NULL,
                nombre_proceso          VARCHAR(100)    NOT NULL,
                id_concepto             SMALLINT UNSIGNED DEFAULT 0,
                nombre_concepto         VARCHAR(100)    DEFAULT '',
                ciudad_origen           VARCHAR(100),
                ciudad_destino          VARCHAR(100),
                fecha_proceso           DATETIME        NOT NULL,
                received_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (shipment_id) REFERENCES shipments(id),
                INDEX idx_shipment_id  (shipment_id),
                INDEX idx_fecha_proceso (fecha_proceso)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        console.log('[migrations] Tablas verificadas correctamente.');
    } finally {
        conn.release();
    }
}

module.exports = { runMigrations };
