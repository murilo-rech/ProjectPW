<?php

namespace Source\Models\Faqs;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Faq extends Model
{
    private ?int $id;
    private ?int $faqsCategoryId;
    private ?string $question;
    private ?string $answer;
    private ?int $active;

    public function __construct(
        ?int $id = null,
        ?int $faqsCategoryId = null,
        ?string $question = null,
        ?string $answer = null,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->faqsCategoryId = $faqsCategoryId;
        $this->question = $question;
        $this->answer = $answer;
        $this->active = $active;

        $this->table = 'faqs';
        $this->primaryKey = 'id';
        $this->fillable = ['faqsCategoryId', 'question', 'answer', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getFaqsCategoryId(): ?int
    {
        return $this->faqsCategoryId;
    }

    public function setFaqsCategoryId(int $faqsCategoryId): void
    {
        $this->faqsCategoryId = $faqsCategoryId;
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

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(int $active): void
    {
        $this->active = $active;
    }

    public function listAll(): array
    {
        $query = "SELECT faqs.id, faqs.question, faqs.answer, faqs_categories.name AS category_name
                  FROM faqs
                  JOIN faqs_categories ON faqs.faqs_category_id = faqs_categories.id
                  WHERE faqs.active = 1 AND faqs_categories.active = 1
                  ORDER BY faqs.id ASC";

        try {
            $stmt = Connect::getInstance()->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return [];
        }
    }

    public function findById(int $id): ?array
    {
        $query = "SELECT faqs.id, faqs.question, faqs.answer, faqs_categories.name AS category_name
                  FROM faqs
                  JOIN faqs_categories ON faqs.faqs_category_id = faqs_categories.id
                  WHERE faqs.id = :id AND faqs.active = 1 AND faqs_categories.active = 1
                  LIMIT 1";

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            $faq = $stmt->fetch(PDO::FETCH_ASSOC);

            return $faq ?: null;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return null;
        }
    }

    public function updateFaqById(int $id): bool
    {
        $query = "UPDATE faqs
                  SET faqs_category_id = :faqs_category_id, question = :question, answer = :answer
                  WHERE id = :id AND active = 1";

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":faqs_category_id", $this->faqsCategoryId, PDO::PARAM_INT);
            $stmt->bindValue(":question", $this->question);
            $stmt->bindValue(":answer", $this->answer);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();

            return true;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function softDeleteById(int $id): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "UPDATE faqs SET active = 0 WHERE id = :id AND active = 1"
            );
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() < 1) {
                $this->errorMessage = "FAQ nao encontrado ou ja inativo.";
                return false;
            }

            return true;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }
}
