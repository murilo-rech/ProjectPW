-- Alteracoes aditivas da Etapa 07. Nao apaga nem recria tabelas existentes.
USE `db-acme-tarde`;

SET @has_appointment_status = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'appointments'
      AND COLUMN_NAME = 'status'
);
SET @add_appointment_status = IF(
    @has_appointment_status = 0,
    'ALTER TABLE appointments ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''pending'' AFTER active',
    'SELECT 1'
);
PREPARE etapa07_status_statement FROM @add_appointment_status;
EXECUTE etapa07_status_statement;
DEALLOCATE PREPARE etapa07_status_statement;

CREATE TABLE IF NOT EXISTS appointment_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    stored_name VARCHAR(80) NOT NULL,
    mime_type VARCHAR(80) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_appointment_images_appointment_id (appointment_id),
    CONSTRAINT fk_appointment_image_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
