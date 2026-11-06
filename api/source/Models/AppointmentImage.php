<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;

class AppointmentImage
{
    private ?string $errorMessage = null;

    public function getErrorMessage(): ?string
    {
        return $this->errorMessage;
    }

    public function insert(int $appointmentId, string $filename, string $mimeType): int|false
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'INSERT INTO appointment_images (appointment_id, stored_name, mime_type) VALUES (:appointment_id, :stored_name, :mime_type)'
            );
            $stmt->bindValue(':appointment_id', $appointmentId, PDO::PARAM_INT);
            $stmt->bindValue(':stored_name', $filename);
            $stmt->bindValue(':mime_type', $mimeType);
            $stmt->execute();
            return (int)Connect::getInstance()->lastInsertId();
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function listByAppointmentId(int $appointmentId): array|false
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'SELECT id, appointment_id, mime_type, created_at FROM appointment_images WHERE appointment_id = :appointment_id ORDER BY id ASC'
            );
            $stmt->bindValue(':appointment_id', $appointmentId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function findById(int $id): array|false
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'SELECT id, appointment_id, stored_name, mime_type, created_at FROM appointment_images WHERE id = :id LIMIT 1'
            );
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function deleteById(int $id): array|false
    {
        $image = $this->findById($id);
        if ($image === false) {
            return false;
        }

        try {
            $stmt = Connect::getInstance()->prepare('DELETE FROM appointment_images WHERE id = :id');
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $image;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }
}
