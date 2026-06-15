<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Faq extends Model
{
    private ?int $id;
    private ?string $question;
    private ?string $answer;
    private ?int $status;
    private ?int $sortOrder;
    private ?string $createdAt;
    private ?string $updatedAt;

    public function __construct(
        ?int $id = null,
        ?string $question = null,
        ?string $answer = null,
        ?int $status = 1,
        ?int $sortOrder = null,
        ?string $createdAt = null,
        ?string $updatedAt = null
    ) {
        $this->id = $id;
        $this->question = $question;
        $this->answer = $answer;
        $this->status = $status;
        $this->sortOrder = $sortOrder;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;

        $this->table = 'faqs';
        $this->primaryKey = 'id';
        $this->fillable = ['question', 'answer', 'status', 'sortOrder'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getQuestion(): ?string
    {
        return $this->question;
    }

    public function setQuestion(string $question): void
    {
        $this->question = $question;
    }

    public function getAnswer(): ?string
    {
        return $this->answer;
    }

    public function setAnswer(string $answer): void
    {
        $this->answer = $answer;
    }

    public function getStatus(): ?int
    {
        return $this->status;
    }

    public function setStatus(int $status): void
    {
        $this->status = $status;
    }

    public function getSortOrder(): ?int
    {
        return $this->sortOrder;
    }

    public function setSortOrder(int $sortOrder): void
    {
        $this->sortOrder = $sortOrder;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setCreatedAt(string $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(string $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    public function insert(): bool
    {
        if ($this->sortOrder === null) {
            $this->sortOrder = $this->getNextSortOrder();
        }

        return parent::insert();
    }

    public function selectAllFaqs(): array
    {
        try {
            $query = "SELECT * FROM faqs ORDER BY sort_order ASC, id ASC";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function selectActive(): array
    {
        try {
            $query = "SELECT * FROM faqs WHERE status = 1 ORDER BY sort_order ASC, id ASC";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function updateStatusById(int $id, int $status): bool
    {
        try {
            $query = "UPDATE faqs SET status = :status WHERE id = :id";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':status', $status, PDO::PARAM_INT);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() < 1) {
                $this->errorMessage = "FAQ nao encontrado ou sem alteracoes.";
                return false;
            }

            return true;
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    public function updateOrderById(int $id, int $sortOrder): bool
    {
        try {
            $query = "UPDATE faqs SET sort_order = :sort_order WHERE id = :id";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':sort_order', $sortOrder, PDO::PARAM_INT);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() < 1) {
                $this->errorMessage = "FAQ nao encontrado ou sem alteracoes.";
                return false;
            }

            return true;
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    private function getNextSortOrder(): int
    {
        $query = "SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM faqs";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->execute();
        return (int)$stmt->fetch()->next_order;
    }
}
