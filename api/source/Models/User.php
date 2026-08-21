<?php

namespace Source\Models;

use PDO;
use Source\Core\Connect;
use Source\Core\JWTToken;
use Source\Core\Model;

class User extends Model
{
    private ?int $id = null;
    private ?int $schoolId = null;
    private ?int $typeId = null;
    private ?string $name = null;
    private ?string $email = null;
    private ?string $password = null;
    private ?string $phone = null;
    private ?string $photo = null;
    private ?string $registrationNumber = null;
    private ?string $specialization = null;
    private ?string $officeRoom = null;
    private ?int $active = null;

    private ?string $token = null;

    public function __construct(
        ?int $id = null,
        ?int $schoolId = null,
        ?int $typeId = null,
        ?string $name = null,
        ?string $email = null,
        ?string $password = null,
        ?string $phone = null,
        ?string $photo = null,
        ?string $registrationNumber = null,
        ?string $specialization = null,
        ?string $officeRoom = null,
        ?int $active = null
    ) {
        $this->id = $id;
        $this->schoolId = $schoolId;
        $this->typeId = $typeId;
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->phone = $phone;
        $this->photo = $photo;
        $this->registrationNumber = $registrationNumber;
        $this->specialization = $specialization;
        $this->officeRoom = $officeRoom;
        $this->active = $active;

        $this->table = 'users';
        $this->primaryKey = 'id';
        $this->fillable = [
            'schoolId',
            'typeId',
            'name',
            'email',
            'password',
            'phone',
            'photo',
            'registrationNumber',
            'specialization',
            'officeRoom',
            'active'
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getSchoolId(): ?int
    {
        return $this->schoolId;
    }

    public function setSchoolId(?int $schoolId): void
    {
        $this->schoolId = $schoolId;
    }

    public function getTypeId(): ?int
    {
        return $this->typeId;
    }

    public function setTypeId(?int $typeId): void
    {
        $this->typeId = $typeId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): void
    {
        $this->email = $email;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): void
    {
        $this->password = $password;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): void
    {
        $this->phone = $phone;
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(?string $photo): void
    {
        $this->photo = $photo;
    }

    public function getRegistrationNumber(): ?string
    {
        return $this->registrationNumber;
    }

    public function setRegistrationNumber(?string $registrationNumber): void
    {
        $this->registrationNumber = $registrationNumber;
    }

    public function getSpecialization(): ?string
    {
        return $this->specialization;
    }

    public function setSpecialization(?string $specialization): void
    {
        $this->specialization = $specialization;
    }

    public function getOfficeRoom(): ?string
    {
        return $this->officeRoom;
    }

    public function setOfficeRoom(?string $officeRoom): void
    {
        $this->officeRoom = $officeRoom;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(?int $active): void
    {
        $this->active = $active;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function insert(): bool
    {
        if ($this->emailExists($this->email)) {
            $this->errorMessage = "Email ja cadastrado";
            return false;
        }

        if ($this->password !== null) {
            $this->password = password_hash($this->password, PASSWORD_DEFAULT);
        }

        if ($this->active === null) {
            $this->active = 1;
        }

        if (!parent::insert()) {
            return false;
        }

        return true;
    }

    public function login(string $email, string $password, int|array|null $typeId = null): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email AND active = 1 LIMIT 1";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if ($stmt->rowCount() == 0) {
            $this->errorMessage = "Email nao cadastrado ou usuario inativo";
            return false;
        }

        $user = $stmt->fetch();

        if (!$this->typeIsAllowed((int)$user->type_id, $typeId)) {
            $this->errorMessage = "Usuario sem permissao para este acesso";
            return false;
        }

        if (!password_verify($password, $user->password)) {
            $this->errorMessage = "Senha incorreta";
            return false;
        }

        $this->hydrate($user);

        $jwt = new JWTToken();
        $this->token = $jwt->encode([
            "id" => $user->id,
            "school_id" => $user->school_id,
            "type_id" => $user->type_id,
            "name" => $user->name,
            "email" => $user->email
        ]);

        return true;
    }

    public function permissionVerify(string $email, int|array $typeId): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email AND active = 1 LIMIT 1";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if ($stmt->rowCount() == 0) {
            return false;
        }

        $user = $stmt->fetch();

        if (!$this->typeIsAllowed((int)$user->type_id, $typeId)) {
            return false;
        }

        $this->hydrate($user);
        return true;
    }

    public function emailExists(?string $email, ?int $ignoreId = null): bool
    {
        if ($email === null) {
            return false;
        }

        $query = "SELECT id FROM {$this->table} WHERE email = :email";
        if ($ignoreId !== null) {
            $query .= " AND id <> :id";
        }
        $query .= " LIMIT 1";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
        if ($ignoreId !== null) {
            $stmt->bindValue(":id", $ignoreId, PDO::PARAM_INT);
        }
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    private function hydrate(object $user): void
    {
        $this->id = isset($user->id) ? (int)$user->id : null;
        $this->schoolId = isset($user->school_id) ? ($user->school_id !== null ? (int)$user->school_id : null) : null;
        $this->typeId = isset($user->type_id) ? (int)$user->type_id : null;
        $this->name = $user->name ?? null;
        $this->email = $user->email ?? null;
        $this->password = $user->password ?? null;
        $this->phone = $user->phone ?? null;
        $this->photo = $user->photo ?? null;
        $this->registrationNumber = $user->registration_number ?? null;
        $this->specialization = $user->specialization ?? null;
        $this->officeRoom = $user->office_room ?? null;
        $this->active = isset($user->active) ? (int)$user->active : null;
    }

    private function typeIsAllowed(int $userTypeId, int|array|null $allowedTypeId): bool
    {
        if ($allowedTypeId === null) {
            return in_array($userTypeId, [1, 2, 3, 4], true);
        }

        if (is_array($allowedTypeId)) {
            return in_array($userTypeId, array_map('intval', $allowedTypeId), true);
        }

        return $userTypeId === $allowedTypeId;
    }
}
