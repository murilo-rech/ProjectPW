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
    private ?int $active;

    public function __construct(
        ?int $id = null,
        ?int $planId = null,
        ?string $name = null,
        ?string $code = null,
        ?string $email = null,
        ?string $phone = null,
        ?string $city = null,
        ?string $state = null,
        ?int $active = null
    ) {
        $this->id = $id;
        $this->planId = $planId;
        $this->name = $name;
        $this->code = $code;
        $this->email = $email;
        $this->phone = $phone;
        $this->city = $city;
        $this->state = $state;
        $this->active = $active;

        $this->table = 'schools';
        $this->primaryKey = 'id';
        $this->fillable = ['planId', 'name', 'code', 'email', 'phone', 'city', 'state', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getPlanId(): ?int
    {
        return $this->planId;
    }

    public function setPlanId(?int $planId): void
    {
        $this->planId = $planId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(?string $code): void
    {
        $this->code = $code;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): void
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

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(?int $active): void
    {
        $this->active = $active;
    }

    public function selectByAdminUserId(int $userId): array
    {
        try {
            $query = "SELECT schools.* FROM schools INNER JOIN users ON users.school_id = schools.id WHERE users.id = :user_id LIMIT 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $school = $stmt->fetch();
            return $school ? [$school] : [];
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function findActiveIdByCode(string $code): ?int
    {
        $query = "SELECT id FROM schools WHERE code = :code AND active = 1 LIMIT 1";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(':code', $code);
        $stmt->execute();

        $school = $stmt->fetch();
        return $school ? (int)$school->id : null;
    }
}
