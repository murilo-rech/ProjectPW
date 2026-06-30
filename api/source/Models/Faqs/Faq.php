<?php

namespace Source\Models\Faqs;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Faq extends Model
{
    private ?int $id;
    private ?string $question;
    private ?string $answer;
    private ?int $active;
    private ?int $sortOrder;

    public function __construct(
        ?int $id = null,
        ?string $question = null,
        ?string $answer = null,
        ?int $active = null,
        ?int $sortOrder = null
    ) {
        $this->id = $id;
        $this->question = $question;
        $this->answer = $answer;
        $this->active = $active;
        $this->sortOrder = $sortOrder;

        $this->table = 'faqs';
        $this->primaryKey = 'id';
        $this->fillable = ['question', 'answer', 'active', 'sortOrder'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getQuestion(): ?string
    {
        return $this->question;
    }

    public function setQuestion(?string $question): void
    {
        $this->question = $question;
    }

    public function getAnswer(): ?string
    {
        return $this->answer;
    }

    public function setAnswer(?string $answer): void
    {
        $this->answer = $answer;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(?int $active): void
    {
        $this->active = $active;
    }

    public function getSortOrder(): ?int
    {
        return $this->sortOrder;
    }

    public function setSortOrder(?int $sortOrder): void
    {
        $this->sortOrder = $sortOrder;
    }

    public function selectList(bool $onlyActive = false): array
    {
        try {
            $query = "SELECT id, question, answer, active AS status, sort_order FROM faqs";
            if ($onlyActive) {
                $query .= " WHERE active = 1";
            }
            $query .= " ORDER BY sort_order ASC, id ASC";

            $stmt = Connect::getInstance()->query($query);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function selectOne(int $id, bool $onlyActive = false): bool
    {
        try {
            $query = "SELECT id, question, answer, active, sort_order FROM faqs WHERE id = :id";
            if ($onlyActive) {
                $query .= " AND active = 1";
            }
            $query .= " LIMIT 1";

            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $faq = $stmt->fetch();
            if (!$faq) {
                $this->errorMessage = "FAQ nao encontrado";
                return false;
            }

            $this->id = $faq->id;
            $this->question = $faq->question;
            $this->answer = $faq->answer;
            $this->active = $faq->active;
            $this->sortOrder = $faq->sort_order;
            return true;
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    public function updateStatus(int $id, int $active): bool
    {
        $this->question = null;
        $this->answer = null;
        $this->active = $active;
        $this->sortOrder = null;
        return $this->updateById($id);
    }

    public function updateOrder(int $id, int $sortOrder): bool
    {
        $this->question = null;
        $this->answer = null;
        $this->active = null;
        $this->sortOrder = $sortOrder;
        return $this->updateById($id);
    }
}
