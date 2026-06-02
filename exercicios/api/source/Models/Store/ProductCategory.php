<?php

namespace Source\Models\Store;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class ProductCategory extends Model
{
    private ?int $id;
    private ?string $name;
    private ?int $active;

    public function __construct(?int $id = null, ?string $name = null, ?int $active = 1)
    {
        $this->id = $id;
        $this->name = $name;
        $this->active = $active;

        $this->table = 'products_categories';
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
                "SELECT id, name FROM products_categories WHERE active = 1 ORDER BY id ASC"
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
                "SELECT id, name FROM products_categories WHERE id = :id AND active = 1 LIMIT 1"
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
}
