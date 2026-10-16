<?php

namespace Source\Controller;

use Source\Models\User;
use Source\Models\School;

class Users extends Api
{
    private const GLOBAL_ADMIN = 1;
    private const SCHOOL_ADMIN = 2;
    private const TEACHER = 3;
    private const STUDENT = 4;

    public function listAll(array $data): void
    {
        if (!$this->authToken(self::GLOBAL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $user = new User();
        $users = $user->selectSafeAll();
        if ($users === false) {
            $this->call(500, "internal_server_error", "Nao foi possivel listar os usuarios.", "error")->back();
            return;
        }

        $safeUsers = array_map(fn(User $item) => $this->responseData($item), $users);
        $this->call(200, "success", "Lista de usuarios", "success")->back($safeUsers);
    }

    public function listById(array $data): void
    {
        if (!$this->validateId($data, "user_id")) {
            $this->call(400, "bad_request", "ID do usuario obrigatorio e deve ser um inteiro positivo.", "error")->back();
            return;
        }

        if (!$this->authToken(self::GLOBAL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectSafeById((int)$data["user_id"])) {
            $this->respondToLookupFailure($user);
            return;
        }

        $this->call(200, "success", "Usuario encontrado", "success")->back($this->responseData($user));
    }

    public function me(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou token invalido.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectSafeById((int)$this->userAuthId)) {
            $this->respondToLookupFailure($user);
            return;
        }

        $this->call(200, "success", "Usuario encontrado", "success")->back($this->responseData($user));
    }

    public function register(array $data): void
    {
        $data = $this->normalizeInput($this->inputData($data));

        if (isset($data["school_code"]) && !is_string($data["school_code"])) {
            $this->call(400, "bad_request", "O codigo da escola deve ser um texto.", "error")->back();
            return;
        }

        if (!empty($data["school_code"])) {
            $school = new School();
            $schoolId = $school->findActiveIdByCode(trim($data["school_code"]));

            if ($schoolId === null) {
                $this->call(400, "bad_request", "Codigo da escola nao encontrado.", "error")->back();
                return;
            }

            $data["school_id"] = $schoolId;
        }

        if (!$this->validateRegister($data, [self::TEACHER, self::STUDENT])) {
            $this->call(
                400,
                "bad_request",
                "Nome, e-mail, senha e tipo de usuario valido sao obrigatorios.",
                "error"
            )->back();
            return;
        }

        $user = $this->makeUser($data, self::STUDENT);

        if (!$user->insert()) {
            if ($user->getErrorMessage() === "Email ja cadastrado") {
                $this->call(400, "bad_request", "Email ja cadastrado.", "error")->back();
                return;
            }
            error_log("Falha no cadastro de usuario: " . ($user->getErrorMessage() ?? "erro desconhecido"));
            $this->call(500, "internal_server_error", "Nao foi possivel cadastrar o usuario.", "error")->back();
            return;
        }

        if (!$user->selectSafeById((int)$user->getId())) {
            $this->call(500, "internal_server_error", "Usuario cadastrado, mas nao foi possivel consultar os dados.", "error")->back();
            return;
        }

        $this->call(201, "success", "Usuario inserido com sucesso", "created")->back($this->responseData($user));
    }

    public function registerAdmin(array $data): void
    {
        if (!$this->authToken(self::GLOBAL_ADMIN)) {
            $this->call(
                401,
                "unauthorized",
                "Usuario nao esta autenticado ou nao possui permissao.",
                "error"
            )->back();
            return;
        }

        $data = $this->normalizeInput($this->inputData($data));

        if (!$this->validateRegister($data, [self::GLOBAL_ADMIN, self::SCHOOL_ADMIN])) {
            $this->call(
                400,
                "bad_request",
                "Nome, e-mail, senha e tipo de administrador valido sao obrigatorios.",
                "error"
            )->back();
            return;
        }

        $user = $this->makeUser($data, self::SCHOOL_ADMIN);

        if (!$user->insert()) {
            error_log("Falha no cadastro administrativo: " . ($user->getErrorMessage() ?? "erro desconhecido"));
            $this->call(500, "internal_server_error", "Nao foi possivel cadastrar o administrador.", "error")->back();
            return;
        }

        if (!$user->selectSafeById((int)$user->getId())) {
            $this->call(500, "internal_server_error", "Administrador cadastrado, mas nao foi possivel consultar os dados.", "error")->back();
            return;
        }

        $this->call(201, "success", "Administrador inserido com sucesso", "created")->back($this->responseData($user));
    }

    public function auth(array $data): void
    {
        $data = $this->inputData($data);

        if (!$this->validateLogin($data)) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha sao obrigatorios. O e-mail deve ser valido.",
                "error"
            )->back();
            return;
        }

        $user = new User();
        if (!$user->login($data["email"], $data["password"])) {
            $this->call(401, "unauthorized", $user->getErrorMessage(), "error")->back();
            return;
        }

        $response = $this->responseData($user);
        $response["token"] = $user->getToken();

        $this->call(200, "success", "Usuario logado com sucesso", "success")->back($response);
    }

    public function authAdmin(array $data): void
    {
        $data = $this->inputData($data);

        if (!$this->validateLogin($data)) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha sao obrigatorios. O e-mail deve ser valido.",
                "error"
            )->back();
            return;
        }

        $user = new User();
        if (!$user->login($data["email"], $data["password"], [self::GLOBAL_ADMIN, self::SCHOOL_ADMIN])) {
            $this->call(401, "unauthorized", $user->getErrorMessage(), "error")->back();
            return;
        }

        $response = $this->responseData($user);
        $response["token"] = $user->getToken();

        $this->call(200, "success", "Administrador logado com sucesso", "success")->back($response);
    }

    public function update(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(
                401,
                "unauthorized",
                "Usuario nao esta autenticado ou token invalido.",
                "error"
            )->back();
            return;
        }

        $data = $this->normalizeInput($this->inputData($data));

        if (!$this->validateUpdate($data)) {
            $this->call(400, "bad_request", "Informe ao menos um campo valido para atualizar.", "error")->back();
            return;
        }

        $user = $this->makeProfileUpdateUser($data);

        if (!$user->updateById((int)$this->userAuthId)) {
            error_log("Falha na atualizacao de perfil: " . ($user->getErrorMessage() ?? "erro desconhecido"));
            $this->call(500, "internal_server_error", "Nao foi possivel atualizar o perfil.", "error")->back();
            return;
        }

        if (!$user->selectSafeById((int)$this->userAuthId)) {
            $this->call(500, "internal_server_error", "Perfil atualizado, mas nao foi possivel consultar os dados.", "error")->back();
            return;
        }

        $this->call(200, "success", "Usuario atualizado com sucesso", "success")->back($this->responseData($user));
    }

    public function updateAdmin(array $data): void
    {
        if (!$this->authToken(self::GLOBAL_ADMIN)) {
            $this->call(
                401,
                "unauthorized",
                "Usuario nao esta autenticado ou nao possui permissao.",
                "error"
            )->back();
            return;
        }

        $data = $this->normalizeInput($this->inputData($data));

        if (!$this->validateUpdate($data)) {
            $this->call(400, "bad_request", "Informe ao menos um campo valido para atualizar.", "error")->back();
            return;
        }

        $user = $this->makeProfileUpdateUser($data);

        if (!$user->updateById((int)$this->userAuthId)) {
            error_log("Falha na atualizacao do perfil administrativo: " . ($user->getErrorMessage() ?? "erro desconhecido"));
            $this->call(500, "internal_server_error", "Nao foi possivel atualizar o perfil.", "error")->back();
            return;
        }

        if (!$user->selectSafeById((int)$this->userAuthId)) {
            $this->call(500, "internal_server_error", "Perfil atualizado, mas nao foi possivel consultar os dados.", "error")->back();
            return;
        }

        $this->call(200, "success", "Administrador atualizado com sucesso", "success")->back($this->responseData($user));
    }

    public function updateById(array $data): void
    {
        if (!$this->authToken(self::GLOBAL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->normalizeInput($this->inputData($data));
        if (!$this->validateId($data, "user_id") || !$this->validateAdminUpdate($data)) {
            $this->call(400, "bad_request", "ID invalido ou campos de usuario invalidos.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectSafeById((int)$data["user_id"])) {
            $this->respondToLookupFailure($user);
            return;
        }

        unset($data["user_id"]);
        if (!$user->updateAdminById((int)$user->getId(), $data)) {
            if ($user->getErrorMessage() === "Email ja cadastrado") {
                $this->call(400, "bad_request", "Email ja cadastrado.", "error")->back();
                return;
            }
            error_log("Falha na edicao administrativa de usuario: " . ($user->getErrorMessage() ?? "erro desconhecido"));
            $this->call(500, "internal_server_error", "Nao foi possivel atualizar o usuario.", "error")->back();
            return;
        }

        if (!$user->selectSafeById((int)$user->getId())) {
            $this->call(500, "internal_server_error", "Usuario atualizado, mas nao foi possivel consultar os dados.", "error")->back();
            return;
        }
        $this->call(200, "success", "Usuario atualizado com sucesso", "success")->back($this->responseData($user));
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(self::GLOBAL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        if (!$this->validateId($data, "user_id")) {
            $this->call(400, "bad_request", "ID do usuario obrigatorio e deve ser um inteiro positivo.", "error")->back();
            return;
        }

        if ((int)$data["user_id"] === $this->userAuthId) {
            $this->call(400, "bad_request", "Nao e permitido excluir o proprio usuario administrativo.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->deactivateById((int)$data["user_id"])) {
            if ($user->getErrorMessage() === "Usuario nao encontrado ou ja inativo.") {
                $this->call(404, "not_found", $user->getErrorMessage(), "error")->back();
                return;
            }
            $this->call(500, "internal_server_error", "Nao foi possivel excluir o usuario.", "error")->back();
            return;
        }

        $this->call(200, "success", "Usuario excluido com sucesso", "success")->back();
    }

    public function checkAuth(array $data): void
    {
        if (!isset($data["type_id"]) || !$this->validateUserType($data["type_id"])) {
            $this->call(
                400,
                "bad_request",
                "O campo type_id e obrigatorio e deve ser um numero inteiro entre 1 e 4.",
                "error"
            )->back();
            return;
        }

        if (!$this->authToken((int)$data["type_id"])) {
            $this->call(
                401,
                "unauthorized",
                "Usuario nao esta autenticado ou token invalido.",
                "error"
            )->back();
            return;
        }

        $this->call(200, "success", "Usuario autenticado com sucesso", "success")->back([
            "id" => $this->userAuthId,
            "type_id" => $this->userAuthTypeId,
            "school_id" => $this->userAuthSchoolId
        ]);
    }

    private function makeUser(array $data, int $defaultTypeId): User
    {
        return new User(
            null,
            isset($data["school_id"]) ? (int)$data["school_id"] : null,
            isset($data["type_id"]) ? (int)$data["type_id"] : $defaultTypeId,
            trim($data["name"]),
            trim($data["email"]),
            $data["password"],
            isset($data["phone"]) ? trim($data["phone"]) : null,
            $data["photo"] ?? null,
            isset($data["registration_number"]) ? trim($data["registration_number"]) : null,
            isset($data["specialization"]) ? trim($data["specialization"]) : null,
            isset($data["office_room"]) ? trim($data["office_room"]) : null,
            isset($data["active"]) ? (int)$data["active"] : 1
        );
    }

    private function makeProfileUpdateUser(array $data): User
    {
        return new User(
            null,
            null,
            null,
            isset($data["name"]) ? trim($data["name"]) : null,
            isset($data["email"]) ? trim($data["email"]) : null,
            isset($data["password"]) && !empty($data["password"]) ? password_hash($data["password"], PASSWORD_DEFAULT) : null,
            isset($data["phone"]) ? trim($data["phone"]) : null,
            $data["photo"] ?? null,
            isset($data["registration_number"]) ? trim($data["registration_number"]) : null,
            isset($data["specialization"]) ? trim($data["specialization"]) : null,
            isset($data["office_room"]) ? trim($data["office_room"]) : null,
            null
        );
    }

    private function validateRegister(array $data, array $allowedTypes): bool
    {
        if (!$this->validateNameEmail($data) || !isset($data["password"])
            || !is_string($data["password"]) || strlen($data["password"]) < 6) {
            return false;
        }

        $typeId = isset($data["type_id"]) && filter_var($data["type_id"], FILTER_VALIDATE_INT) !== false
            ? (int)$data["type_id"] : (isset($data["type_id"]) ? 0 : null);
        if ($typeId !== null && !in_array($typeId, $allowedTypes, true)) {
            return false;
        }

        if (isset($data["school_id"]) && (!filter_var($data["school_id"], FILTER_VALIDATE_INT) || (int)$data["school_id"] <= 0)) {
            return false;
        }

        if (isset($data["active"]) && !$this->validateActive($data["active"])) {
            return false;
        }

        $lengths = ["phone" => 20, "photo" => 255, "registration_number" => 50, "specialization" => 100, "office_room" => 100];
        foreach ($lengths as $field => $maxLength) {
            if (isset($data[$field]) && (!is_string($data[$field]) || strlen($data[$field]) > $maxLength)) {
                return false;
            }
        }

        return true;
    }

    private function validateLogin(array $data): bool
    {
        return isset($data["email"], $data["password"])
            && !empty($data["email"])
            && !empty($data["password"])
            && filter_var($data["email"], FILTER_VALIDATE_EMAIL);
    }

    private function validateUpdate(array $data): bool
    {
        $allowedFields = [
            "name",
            "email",
            "password",
            "phone",
            "photo",
            "registration_number",
            "specialization",
            "office_room"
        ];

        if (array_diff(array_keys($data), $allowedFields)) {
            return false;
        }

        $hasValue = false;
        foreach ($allowedFields as $field) {
            if (!array_key_exists($field, $data) || $data[$field] === null) {
                continue;
            }

            if ($data[$field] !== "") {
                $hasValue = true;
            }

            if ($field === "name" && (!is_string($data[$field]) || trim($data[$field]) === "" || strlen($data[$field]) > 150)) {
                return false;
            }
            if ($field === "email" && (!is_string($data[$field]) || !filter_var($data[$field], FILTER_VALIDATE_EMAIL) || strlen($data[$field]) > 150)) {
                return false;
            }
            if ($field === "password" && $data[$field] !== "" && (!is_string($data[$field]) || strlen($data[$field]) < 6)) {
                return false;
            }
        }

        $lengths = ["phone" => 20, "photo" => 255, "registration_number" => 50, "specialization" => 100, "office_room" => 100];
        foreach ($lengths as $field => $maxLength) {
            if (isset($data[$field]) && (!is_string($data[$field]) || strlen($data[$field]) > $maxLength)) {
                return false;
            }
        }

        return $hasValue;
    }

    private function validateAdminUpdate(array $data): bool
    {
        unset($data["user_id"], $data["user_type"], $data["status"]);
        $allowedFields = [
            "school_id", "type_id", "name", "email", "password", "phone", "photo",
            "registration_number", "specialization", "office_room", "active"
        ];

        if (empty($data) || array_diff(array_keys($data), $allowedFields)) {
            return false;
        }
        foreach (["name", "email", "password", "type_id", "active"] as $requiredWhenProvided) {
            if (array_key_exists($requiredWhenProvided, $data) && $data[$requiredWhenProvided] === null) {
                return false;
            }
        }
        if (isset($data["name"]) && (!is_string($data["name"]) || trim($data["name"]) === "" || strlen($data["name"]) > 150)) {
            return false;
        }
        if (isset($data["email"]) && (!is_string($data["email"]) || strlen($data["email"]) > 150 || !filter_var($data["email"], FILTER_VALIDATE_EMAIL))) {
            return false;
        }
        if (isset($data["password"]) && $data["password"] !== "" && (!is_string($data["password"]) || strlen($data["password"]) < 6)) {
            return false;
        }
        if (isset($data["school_id"]) && $data["school_id"] !== null
            && (filter_var($data["school_id"], FILTER_VALIDATE_INT) === false || (int)$data["school_id"] <= 0)) {
            return false;
        }
        if (isset($data["type_id"]) && !$this->validateUserType($data["type_id"])) {
            return false;
        }
        if (isset($data["active"]) && !$this->validateActive($data["active"])) {
            return false;
        }

        $lengths = ["phone" => 20, "photo" => 255, "registration_number" => 50, "specialization" => 100, "office_room" => 100];
        foreach ($lengths as $field => $maxLength) {
            if (isset($data[$field]) && (!is_string($data[$field]) || strlen($data[$field]) > $maxLength)) {
                return false;
            }
        }

        return array_filter(
            $data,
            fn($value, $field) => $field !== "password" || $value !== "",
            ARRAY_FILTER_USE_BOTH
        ) !== [];
    }

    private function validateId(array $data, string $field): bool
    {
        return isset($data[$field])
            && filter_var($data[$field], FILTER_VALIDATE_INT) !== false
            && (int)$data[$field] > 0;
    }

    private function respondToLookupFailure(User $user): void
    {
        if ($user->getErrorMessage() === "Usuario nao encontrado.") {
            $this->call(404, "not_found", "Usuario nao encontrado.", "error")->back();
            return;
        }

        $this->call(500, "internal_server_error", "Nao foi possivel consultar o usuario.", "error")->back();
    }

    private function validateNameEmail(array $data): bool
    {
        return isset($data["name"], $data["email"])
            && is_string($data["name"])
            && is_string($data["email"])
            && trim($data["name"]) !== ""
            && strlen($data["name"]) <= 150
            && strlen($data["email"]) <= 150
            && filter_var($data["email"], FILTER_VALIDATE_EMAIL);
    }

    private function validateUserType(mixed $typeId): bool
    {
        return filter_var($typeId, FILTER_VALIDATE_INT) !== false
            && in_array((int)$typeId, [self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT], true);
    }

    private function validateActive(mixed $active): bool
    {
        return filter_var($active, FILTER_VALIDATE_INT) !== false && in_array((int)$active, [0, 1], true);
    }

    private function normalizeInput(array $data): array
    {
        if (isset($data["user_type"]) && !isset($data["type_id"])) {
            $data["type_id"] = $data["user_type"];
        }

        if (isset($data["status"]) && !isset($data["active"])) {
            $data["active"] = $data["status"];
        }

        return $data;
    }

    private function inputData(array $data): array
    {
        $input = file_get_contents("php://input");
        $json = json_decode($input, true);
        if (is_array($json)) {
            // O roteador também tenta interpretar corpos PUT como formulário.
            // Para JSON, preserve apenas o parâmetro da rota usado pela edição por ID.
            $routeData = [];
            if (isset($data["user_id"])) {
                $routeData["user_id"] = $data["user_id"];
            }
            $data = array_merge($json, $routeData);
        }
        return $data;
    }

    private function responseData(User $user): array
    {
        return [
            "id" => $user->getId(),
            "school_id" => $user->getSchoolId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "phone" => $user->getPhone(),
            "photo" => $user->getPhoto(),
            "registration_number" => $user->getRegistrationNumber(),
            "specialization" => $user->getSpecialization(),
            "office_room" => $user->getOfficeRoom(),
            "active" => $user->getActive()
        ];
    }
}
