<?php

namespace Source\Models;

use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Plan extends Model
{
    private ?int $id;
    private ?string $name;
    private ?string $description;
    private ?float $price;
    private ?int $maxStudents;
    private ?int $maxTeachers;
    private ?int $status;
    private ?string $createdAt;
    private ?string $updatedAt;

    public function __construct(
        ?int $id = null,
        ?string $name = null,
        ?string $description = null,
        ?float $price = null,
        ?int $maxStudents = null,
        ?int $maxTeachers = null,
        ?int $status = null,
        ?string $createdAt = null,
        ?string $updatedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->maxStudents = $maxStudents;
        $this->maxTeachers = $maxTeachers;
        $this->status = $status;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;

        $this->table = "plans";
        $this->primaryKey = "id";
        $this->fillable = ["name", "description", "price", "maxStudents", "maxTeachers", "status"];
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): void
    {
        $this->price = $price;
    }

    public function getMaxStudents(): ?int
    {
        return $this->maxStudents;
    }

    public function setMaxStudents(int $maxStudents): void
    {
        $this->maxStudents = $maxStudents;
    }

    public function getMaxTeachers(): ?int
    {
        return $this->maxTeachers;
    }

    public function setMaxTeachers(int $maxTeachers): void
    {
        $this->maxTeachers = $maxTeachers;
    }

    public function getStatus(): ?int
    {
        return $this->status;
    }

    public function setStatus(int $status): void
    {
        $this->status = $status;
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

    public function selectAllPlans(): array
    {
        try {
            $query = "SELECT * FROM plans ORDER BY id ASC";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }
}
