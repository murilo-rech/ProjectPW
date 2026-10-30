<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;

class Notification
{
    private ?string $errorMessage = null;

    public function getErrorMessage(): ?string
    {
        return $this->errorMessage;
    }

    public function listForUser(int $userId): array|false
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'SELECT id, title, message, is_read, created_at FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC, id DESC'
            );
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function markRead(int $id, int $userId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :user_id'
            );
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->rowCount() > 0;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function markAllRead(int $userId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'UPDATE notifications SET is_read = 1 WHERE user_id = :user_id AND is_read = 0'
            );
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }
}
