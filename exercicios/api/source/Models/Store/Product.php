<?php

namespace Source\Models\Store;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Product extends Model
{
    private ?int $id;
    private ?int $categoryId;
    private ?string $name;
    private ?float $price;
    private ?int $active;

    public function __construct(?int $id = null, ?int $categoryId = null, ?string $name = null, ?float $price = null, ?int $active = 1)
    {
        $this->id = $id;
        $this->categoryId = $categoryId;
        $this->name = $name;
        $this->price = $price;
        $this->active = $active;

        $this->table = 'products';
        $this->primaryKey = 'id';
        $this->fillable = ['categoryId', 'name', 'price', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getCategoryId(): ?int
    {
        return $this->categoryId;
    }

    public function setCategoryId(int $categoryId): void
    {
        $this->categoryId = $categoryId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): void
    {
        $this->price = $price;
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
        $query = "SELECT products.id, products.name, products.price, products_categories.name AS category_name
                  FROM products
                  JOIN products_categories ON products.category_id = products_categories.id
                  WHERE products.active = 1
                  ORDER BY products.id ASC";

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
        $query = "SELECT products.id, products.name, products.price, products_categories.name AS category_name
                  FROM products
                  JOIN products_categories ON products.category_id = products_categories.id
                  WHERE products.id = :id AND products.active = 1
                  LIMIT 1";

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            return $product ?: null;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return null;
        }
    }

    public function updateProductById(int $id): bool
    {
        $query = "UPDATE products
                  SET category_id = :category_id, name = :name, price = :price
                  WHERE id = :id AND active = 1";

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":category_id", $this->categoryId, PDO::PARAM_INT);
            $stmt->bindValue(":name", $this->name);
            $stmt->bindValue(":price", $this->price);
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
        $query = "UPDATE products SET active = 0 WHERE id = :id AND active = 1";

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() < 1) {
                $this->errorMessage = "Produto nao encontrado ou ja inativo.";
                return false;
            }

            return true;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }
}
