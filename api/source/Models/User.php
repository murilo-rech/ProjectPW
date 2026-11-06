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

    public function selectSafeAll(): array|false
    {
        $query = "SELECT id, school_id, type_id, name, email, phone, photo, registration_number, specialization, office_room, active FROM {$this->table} ORDER BY id ASC";

        try {
            $stmt = Connect::getInstance()->query($query);
            $users = [];
            foreach ($stmt->fetchAll() as $user) {
                $users[] = $this->makeSafeUser($user);
            }
            return $users;
        } catch (\PDOException $exception) {
            $this->errorMessage = "Nao foi possivel consultar os usuarios.";
            return false;
        }
    }

    public function selectSafeBySchool(int $schoolId): array|false
    {
        $query = "SELECT id, school_id, type_id, name, email, phone, photo, registration_number, specialization, office_room, active FROM {$this->table} WHERE school_id = :school_id AND type_id IN (2, 3, 4) ORDER BY type_id ASC, id ASC";
        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':school_id', $schoolId, PDO::PARAM_INT);
            $stmt->execute();
            $users = [];
            foreach ($stmt->fetchAll() as $user) {
                $users[] = $this->makeSafeUser($user);
            }
            return $users;
        } catch (\PDOException $exception) {
            $this->errorMessage = 'Nao foi possivel consultar os usuarios da escola.';
            return false;
        }
    }

    public function selectSafeById(int $id): bool
    {
        $query = "SELECT id, school_id, type_id, name, email, phone, photo, registration_number, specialization, office_room, active FROM {$this->table} WHERE {$this->primaryKey} = :id LIMIT 1";

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch();
            if (!$user) {
                $this->errorMessage = "Usuario nao encontrado.";
                return false;
            }

            $this->hydrate($user);
            return true;
        } catch (\PDOException $exception) {
            $this->errorMessage = "Nao foi possivel consultar o usuario.";
            return false;
        }
    }

    public function updateAdminById(int $id, array $data, ?int $schoolId = null): bool
    {
        $columns = [
            "school_id" => "school_id",
            "type_id" => "type_id",
            "name" => "name",
            "email" => "email",
            "password" => "password",
            "phone" => "phone",
            "registration_number" => "registration_number",
            "specialization" => "specialization",
            "office_room" => "office_room",
            "active" => "active"
        ];

        $fields = array_intersect_key($data, $columns);
        if (empty($fields)) {
            $this->errorMessage = "Nenhum campo valido para atualizacao.";
            return false;
        }

        if (isset($fields["email"]) && $this->emailExists((string)$fields["email"], $id)) {
            $this->errorMessage = "Email ja cadastrado";
            return false;
        }

        if (!empty($fields["password"])) {
            $fields["password"] = password_hash($fields["password"], PASSWORD_DEFAULT);
        } else {
            unset($fields["password"]);
        }

        if (empty($fields)) {
            $this->errorMessage = "Nenhum campo valido para atualizacao.";
            return false;
        }

        $setParts = [];
        foreach (array_keys($fields) as $field) {
            $setParts[] = "{$columns[$field]} = :{$field}";
        }

        try {
            $query = "UPDATE {$this->table} SET " . implode(", ", $setParts) . " WHERE {$this->primaryKey} = :id";
            if ($schoolId !== null) {
                $query .= " AND school_id = :scope_school_id AND type_id IN (2, 3, 4)";
            }
            $stmt = Connect::getInstance()->prepare($query);

            foreach ($fields as $field => $value) {
                $stmt->bindValue(":" . $field, $value);
            }
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            if ($schoolId !== null) {
                $stmt->bindValue(":scope_school_id", $schoolId, PDO::PARAM_INT);
            }
            return $stmt->execute();
        } catch (\PDOException $exception) {
            error_log("Falha na atualizacao administrativa do usuario: " . $exception->getMessage());
            $this->errorMessage = "Nao foi possivel atualizar o usuario.";
            return false;
        }
    }

    public function updatePhotoById(int $id, string $filename): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "UPDATE {$this->table} SET photo = :photo WHERE {$this->primaryKey} = :id AND active = 1"
            );
            $stmt->bindValue(':photo', $filename);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() !== 1) {
                $this->errorMessage = 'Nao foi possivel atualizar a foto do usuario.';
                return false;
            }

            $this->photo = $filename;
            return true;
        } catch (\PDOException $exception) {
            error_log('Falha ao atualizar a foto do usuario: ' . $exception->getMessage());
            $this->errorMessage = 'Nao foi possivel atualizar a foto do usuario.';
            return false;
        }
    }

    public function changePasswordById(int $id, string $currentPassword, string $newPassword): bool
    {
        try {
            $connection = Connect::getInstance();
            $stmt = $connection->prepare(
                "SELECT password FROM {$this->table} WHERE {$this->primaryKey} = :id AND active = 1 LIMIT 1"
            );
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $storedPassword = $stmt->fetchColumn();
            if (!is_string($storedPassword) || !password_verify($currentPassword, $storedPassword)) {
                $this->errorMessage = 'A senha atual esta incorreta.';
                return false;
            }

            $update = $connection->prepare(
                "UPDATE {$this->table} SET password = :password WHERE {$this->primaryKey} = :id AND active = 1"
            );
            $update->bindValue(':password', password_hash($newPassword, PASSWORD_DEFAULT));
            $update->bindValue(':id', $id, PDO::PARAM_INT);
            return $update->execute();
        } catch (\PDOException $exception) {
            error_log('Falha ao alterar senha do usuario: ' . $exception->getMessage());
            $this->errorMessage = 'Nao foi possivel alterar a senha.';
            return false;
        }
    }

    public function deactivateById(int $id, ?int $schoolId = null): bool
    {
        try {
            $query = "UPDATE {$this->table} SET active = 0 WHERE {$this->primaryKey} = :id AND active = 1";
            if ($schoolId !== null) {
                $query .= ' AND school_id = :school_id AND type_id IN (2, 3, 4)';
            }
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            if ($schoolId !== null) {
                $stmt->bindValue(':school_id', $schoolId, PDO::PARAM_INT);
            }
            $stmt->execute();

            if ($stmt->rowCount() < 1) {
                $this->errorMessage = "Usuario nao encontrado ou ja inativo.";
                return false;
            }
            return true;
        } catch (\PDOException $exception) {
            error_log("Falha na exclusao logica do usuario: " . $exception->getMessage());
            $this->errorMessage = "Nao foi possivel excluir o usuario.";
            return false;
        }
    }

    private function makeSafeUser(object $user): self
    {
        $safeUser = new self();
        $safeUser->id = isset($user->id) ? (int)$user->id : null;
        $safeUser->schoolId = isset($user->school_id) ? (int)$user->school_id : null;
        $safeUser->typeId = isset($user->type_id) ? (int)$user->type_id : null;
        $safeUser->name = $user->name ?? null;
        $safeUser->email = $user->email ?? null;
        $safeUser->password = null;
        $safeUser->phone = $user->phone ?? null;
        $safeUser->photo = $user->photo ?? null;
        $safeUser->registrationNumber = $user->registration_number ?? null;
        $safeUser->specialization = $user->specialization ?? null;
        $safeUser->officeRoom = $user->office_room ?? null;
        $safeUser->active = isset($user->active) ? (int)$user->active : null;
        return $safeUser;
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
