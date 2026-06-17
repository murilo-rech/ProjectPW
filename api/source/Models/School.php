<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class School extends Model
{
    private ?int $id;
    private ?int $planId;
    private ?string $name;
    private ?string $code;
    private ?string $email;
    private ?string $phone;
    private ?string $city;
    private ?string $state;
    private ?int $status;
    private ?string $createdAt;
    private ?string $updatedAt;

    public function __construct(
        ?int $id = null,
        ?int $planId = null,
        ?string $name = null,
        ?string $code = null,
        ?string $email = null,
        ?string $phone = null,
        ?string $city = null,
        ?string $state = null,
        ?int $status = null,
        ?string $createdAt = null,
        ?string $updatedAt = null
    ) {
        $this->id = $id;
        $this->planId = $planId;
        $this->name = $name;
        $this->code = $code;
        $this->email = $email;
        $this->phone = $phone;
        $this->city = $city;
        $this->state = $state;
        $this->status = $status;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;

        $this->table = "schools";
        $this->primaryKey = "id";
        $this->fillable = ["planId", "name", "code", "email", "phone", "city", "state", "status"];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getPlanId(): ?int
    {
        return $this->planId;
    }

    public function setPlanId(int $planId): void
    {
        $this->planId = $planId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): void
    {
        $this->code = $code;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): void
    {
        $this->phone = $phone;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): void
    {
        $this->city = $city;
    }

    public function getState(): ?string
    {
        return $this->state;
    }

    public function setState(?string $state): void
    {
        $this->state = $state;
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

    public function selectAllSchools(): array
    {
        try {
            $query = "SELECT * FROM schools ORDER BY id ASC";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function codeExists(string $code, ?int $ignoreId = null): bool
    {
        try {
            $query = "SELECT id FROM schools WHERE code = :code";
            if ($ignoreId !== null) {
                $query .= " AND id <> :id";
            }
            $query .= " LIMIT 1";

            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":code", $code);
            if ($ignoreId !== null) {
                $stmt->bindValue(":id", $ignoreId, PDO::PARAM_INT);
            }
            $stmt->execute();

            return (bool)$stmt->fetch();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }
}
