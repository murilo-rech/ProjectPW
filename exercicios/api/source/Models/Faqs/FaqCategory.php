<?php

namespace Source\Models\Faqs;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class FaqCategory extends Model
{
    private ?int $id;
    private ?string $name;
    private ?int $active;

    public function __construct(?int $id = null, ?string $name = null, ?int $active = 1)
    {
        $this->id = $id;
        $this->name = $name;
        $this->active = $active;

        $this->table = 'faqs_categories';
        $this->primaryKey = 'id';
        $this->fillable = ['name', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
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
        try {
            $stmt = Connect::getInstance()->query(
                "SELECT id, name FROM faqs_categories WHERE active = 1 ORDER BY id ASC"
            );

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return [];
        }
    }

    public function findById(int $id): ?array
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT id, name FROM faqs_categories WHERE id = :id AND active = 1 LIMIT 1"
            );
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            $category = $stmt->fetch(PDO::FETCH_ASSOC);

            return $category ?: null;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return null;
        }
    }

    public function updateCategoryById(int $id): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "UPDATE faqs_categories SET name = :name WHERE id = :id AND active = 1"
            );
            $stmt->bindValue(":name", $this->name);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();

            return true;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function countActiveFaqs(int $id): int
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT COUNT(*) AS total FROM faqs WHERE faqs_category_id = :id AND active = 1"
            );
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            return (int)($result["total"] ?? 0);
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return 0;
        }
    }

    public function softDeleteById(int $id): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "UPDATE faqs_categories SET active = 0 WHERE id = :id AND active = 1"
            );
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() < 1) {
                $this->errorMessage = "Categoria nao encontrada ou ja inativa.";
                return false;
            }

            return true;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }
}
