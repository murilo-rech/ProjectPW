<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Core\Connect;
use Source\Models\Plan;
use Source\Models\School;
use Source\Models\User;
use Throwable;

class Schools extends Api
{
    public function listAll(array $data): void
    {
        $school = new School();

        if ($this->authToken(1)) {
            $this->call(200, "success", "Lista de Escolas", "success")->back($school->selectAll());
            return;
        }

        if ($this->authToken(2)) {
            $this->call(200, "success", "Escola encontrada", "success")->back($school->selectByAdminUserId((int)$this->userAuthId));
            return;
        }

        $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
    }

    public function listMine(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $school = new School();
        $this->call(200, "success", "Escola encontrada", "success")->back($school->selectByAdminUserId((int)$this->userAuthId));
    }

    public function register(array $data): void
    {
        $data = $this->inputData($data);
        $schoolData = $data["school"] ?? null;
        $adminData = $data["admin"] ?? null;

        if (!is_array($schoolData) || !is_array($adminData) || !$this->validateRegistration($data)) {
            $this->call(400, "bad_request", "Confira o plano, os dados da escola e as credenciais do administrador.", "error")->back();
            return;
        }

        $plan = new Plan();
        $planId = $plan->findActiveIdBySlug($data["plan"]);
        if ($planId === null) {
            $this->call(400, "bad_request", "O plano selecionado não está disponível.", "error")->back();
            return;
        }

        $name = trim($schoolData["name"]);
        $code = trim($schoolData["code"]);
        $cnpj = trim($schoolData["cnpj"]);
        $phone = trim($schoolData["phone"]);
        $adminName = trim($adminData["name"]);
        $adminEmail = trim($adminData["email"]);

        $school = new School(null, $planId, $name, $code, $adminEmail, $phone, null, null, 1, $cnpj);
        if ($school->codeExists($code)) {
            $this->call(409, "conflict", "Já existe uma escola com esse código.", "error")->back();
            return;
        }
        if ($school->cnpjExists($cnpj)) {
            $this->call(409, "conflict", "Já existe uma escola com esse CNPJ.", "error")->back();
            return;
        }

        $admin = new User(null, null, 2, $adminName, $adminEmail, $adminData["password"], $phone, null, null, null, null, 1);
        if ($admin->emailExists($adminEmail)) {
            $this->call(409, "conflict", "Este e-mail já está cadastrado. Informe outro e-mail.", "error")->back();
            return;
        }

        $connection = Connect::getInstance();
        try {
            $connection->beginTransaction();

            if (!$school->insert()) {
                $connection->rollBack();
                $duplicate = $this->isConstraintViolation($school->getErrorMessage());
                $this->call(
                    $duplicate ? 409 : 500,
                    $duplicate ? "conflict" : "internal_server_error",
                    $duplicate
                        ? "Não foi possível cadastrar a escola. Confira se o código ou CNPJ já estão em uso."
                        : "Não foi possível cadastrar a escola agora. Tente novamente.",
                    "error"
                )->back();
                return;
            }

            $admin->setSchoolId((int)$school->getId());
            if (!$admin->insert()) {
                $connection->rollBack();
                $duplicate = $admin->getErrorMessage() === "Email ja cadastrado"
                    || $this->isConstraintViolation($admin->getErrorMessage());
                $this->call(
                    $duplicate ? 409 : 500,
                    $duplicate ? "conflict" : "internal_server_error",
                    $duplicate
                        ? "Este e-mail já está cadastrado. Informe outro e-mail."
                        : "Não foi possível cadastrar o administrador da escola. Tente novamente.",
                    "error"
                )->back();
                return;
            }

            if (!$school->selectById((int)$school->getId()) || !$admin->selectSafeById((int)$admin->getId())) {
                $connection->rollBack();
                $this->call(500, "internal_server_error", "Não foi possível confirmar os dados do cadastro.", "error")->back();
                return;
            }

            $connection->commit();
        } catch (Throwable $exception) {
            if ($connection->inTransaction()) {
                $connection->rollBack();
            }
            error_log("Falha no cadastro inicial da escola: " . $exception->getMessage());
            $this->call(500, "internal_server_error", "Não foi possível concluir o cadastro da escola. Tente novamente.", "error")->back();
            return;
        }

        $this->call(201, "success", "Escola e administrador cadastrados com sucesso.", "created")->back([
            "school" => $this->responseData($school),
            "admin" => $this->userResponseData($admin)
        ]);
    }

    public function updateMine(array $data): void
    {
        if (!$this->authToken(2) || $this->userAuthSchoolId === null) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }
        $data = $this->inputData($data);
        $allowed = ["name", "code", "email", "phone"];
        if (array_diff(array_keys($data), $allowed)
            || !isset($data["name"], $data["code"], $data["email"])
            || !is_string($data["name"]) || trim($data["name"]) === "" || strlen(trim($data["name"])) > 150
            || !is_string($data["code"]) || trim($data["code"]) === "" || strlen(trim($data["code"])) > 100
            || !is_string($data["email"]) || !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
            || strlen(trim($data["email"])) > 150
            || (isset($data["phone"]) && (!is_string($data["phone"]) || strlen($data["phone"]) > 20))) {
            $this->call(400, "bad_request", "Informe nome, codigo, e-mail e um telefone valido.", "error")->back();
            return;
        }

        $existing = new School();
        if (!$existing->selectById($this->userAuthSchoolId)) {
            $this->call(404, "not_found", "Escola nao encontrada.", "error")->back();
            return;
        }
        if ($existing->codeExists(trim($data["code"]), $this->userAuthSchoolId)) {
            $this->call(409, "conflict", "Já existe uma escola com esse código.", "error")->back();
            return;
        }
        $school = new School(
            null,
            $existing->getPlanId(),
            trim($data["name"]),
            trim($data["code"]),
            trim($data["email"]),
            isset($data["phone"]) ? trim($data["phone"]) : $existing->getPhone(),
            $existing->getCity(),
            $existing->getState(),
            $existing->getActive(),
            $existing->getCnpj()
        );
        if (!$school->updateById($this->userAuthSchoolId)) {
            $this->call(400, "bad_request", "Nao foi possivel atualizar os dados da escola.", "error")->back();
            return;
        }
        $school->selectById($this->userAuthSchoolId);
        $this->call(200, "success", "Dados da escola atualizados.", "success")->back($this->responseData($school));
    }

    public function listById(array $data): void
    {
        if (!$this->validateId($data, "school_id")) {
            $this->call(400, "bad_request", "ID da escola e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $school = new School();

        if ($this->authToken(1)) {
            if (!$school->selectById((int)$data["school_id"])) {
                $this->call(404, "not_found", "Escola nao encontrada", "error")->back();
                return;
            }
            $this->call(200, "success", "Escola encontrada", "success")->back($this->responseData($school));
            return;
        }

        if ($this->authToken(2)) {
            $mine = $school->selectByAdminUserId((int)$this->userAuthId);
            if (!$mine || (int)$mine[0]->id !== (int)$data["school_id"]) {
                $this->call(403, "forbidden", "Usuario sem permissao para acessar esta escola.", "error")->back();
                return;
            }
            $this->call(200, "success", "Escola encontrada", "success")->back($mine[0]);
            return;
        }

        $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
    }

    public function listPaginator(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        if (!$this->validateId($data, "page") || !$this->validateId($data, "per_page")) {
            $this->call(400, "bad_request", "Os campos page e per_page sao obrigatorios e devem ser numeros inteiros", "error")->back();
            return;
        }

        $school = new School();
        $response = $school->selectPaginator((int)$data["page"], (int)$data["per_page"], [], "id", "ASC");
        $this->call(200, "success", "Lista de Escolas com Paginacao", "success")->back($response);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->inputData($data);

        if (!$this->validate($data)) {
            $this->call(400, "bad_request", "Os campos plan_id, name, code e email sao obrigatorios", "error")->back();
            return;
        }

        $existing = new School();
        if ($existing->codeExists(trim($data["code"]))) {
            $this->call(409, "conflict", "Já existe uma escola com esse código.", "error")->back();
            return;
        }
        if (!empty($data["cnpj"]) && $existing->cnpjExists(trim($data["cnpj"]))) {
            $this->call(409, "conflict", "Já existe uma escola com esse CNPJ.", "error")->back();
            return;
        }

        $school = new School(
            null,
            (int)$data["plan_id"],
            trim($data["name"]),
            trim($data["code"]),
            trim($data["email"]),
            $data["phone"] ?? null,
            $data["city"] ?? null,
            $data["state"] ?? null,
            isset($data["active"]) ? (int)$data["active"] : 1,
            isset($data["cnpj"]) && trim($data["cnpj"]) !== "" ? trim($data["cnpj"]) : null
        );

        if (!$school->insert()) {
            $this->call(500, "internal_server_error", "Não foi possível cadastrar a escola. Confira os dados e tente novamente.", "error")->back();
            return;
        }

        $school->selectById((int)$school->getId());
        $this->call(201, "success", "Escola inserida com sucesso", "created")->back($this->responseData($school));
    }

    public function update(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->inputData($data);

        if (!$this->validateId($data, "school_id") || !$this->validate($data)) {
            $this->call(400, "bad_request", "ID invalido ou campos obrigatorios ausentes", "error")->back();
            return;
        }

        $existing = new School();
        if (!$existing->selectById((int)$data["school_id"])) {
            $this->call(404, "not_found", "Escola nao encontrada", "error")->back();
            return;
        }

        if ($existing->codeExists(trim($data["code"]), (int)$data["school_id"])) {
            $this->call(409, "conflict", "Já existe uma escola com esse código.", "error")->back();
            return;
        }
        $cnpj = isset($data["cnpj"]) && trim($data["cnpj"]) !== "" ? trim($data["cnpj"]) : $existing->getCnpj();
        if ($cnpj !== null && $cnpj !== "" && $existing->cnpjExists($cnpj, (int)$data["school_id"])) {
            $this->call(409, "conflict", "Já existe uma escola com esse CNPJ.", "error")->back();
            return;
        }

        $school = new School(
            null,
            (int)$data["plan_id"],
            trim($data["name"]),
            trim($data["code"]),
            trim($data["email"]),
            $data["phone"] ?? null,
            $data["city"] ?? null,
            $data["state"] ?? null,
            isset($data["active"]) ? (int)$data["active"] : null,
            $cnpj
        );

        if (!$school->updateById((int)$data["school_id"])) {
            $this->call(500, "internal_server_error", "Não foi possível atualizar a escola. Confira os dados e tente novamente.", "error")->back();
            return;
        }

        $school->selectById((int)$data["school_id"]);
        $this->call(200, "success", "Escola atualizada com sucesso", "success")->back($this->responseData($school));
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        if (!$this->validateId($data, "school_id")) {
            $this->call(400, "bad_request", "ID da escola e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $school = new School();
        if (!$school->softDeleteById((int)$data["school_id"])) {
            $this->call(404, "not_found", "A escola não foi encontrada ou já está inativa.", "error")->back();
            return;
        }

        $this->call(200, "success", "Escola excluida com sucesso", "success")->back();
    }

    private function validate(array $data): bool
    {
        return isset($data["plan_id"], $data["name"], $data["code"], $data["email"])
            && filter_var($data["plan_id"], FILTER_VALIDATE_INT) !== false
            && (int)$data["plan_id"] > 0
            && is_string($data["name"]) && trim($data["name"]) !== "" && strlen(trim($data["name"])) <= 150
            && is_string($data["code"]) && trim($data["code"]) !== "" && strlen(trim($data["code"])) <= 50
            && is_string($data["email"]) && strlen(trim($data["email"])) <= 150 && filter_var(trim($data["email"]), FILTER_VALIDATE_EMAIL)
            && (!isset($data["cnpj"]) || $data["cnpj"] === "" || (is_string($data["cnpj"]) && preg_match('/^\d{14}$/', $data["cnpj"])))
            && (!isset($data["phone"]) || (is_string($data["phone"]) && strlen($data["phone"]) <= 20))
            && (!isset($data["city"]) || (is_string($data["city"]) && strlen($data["city"]) <= 100))
            && (!isset($data["state"]) || (is_string($data["state"]) && strlen($data["state"]) <= 50))
            && (!isset($data["active"]) || (filter_var($data["active"], FILTER_VALIDATE_INT) !== false && in_array((int)$data["active"], [0, 1], true)));
    }

    private function validateRegistration(array $data): bool
    {
        if (!isset($data["plan"], $data["school"], $data["admin"]) || !is_string($data["plan"])) {
            return false;
        }

        $school = $data["school"];
        $admin = $data["admin"];
        return isset($school["name"], $school["code"], $school["cnpj"], $school["phone"],
                $admin["name"], $admin["email"], $admin["password"], $admin["password_confirm"])
            && is_string($school["name"]) && trim($school["name"]) !== "" && strlen(trim($school["name"])) <= 150
            && is_string($school["code"]) && trim($school["code"]) !== "" && strlen(trim($school["code"])) <= 50
            && is_string($school["cnpj"]) && preg_match('/^\d{14}$/', trim($school["cnpj"]))
            && is_string($school["phone"]) && trim($school["phone"]) !== "" && strlen(trim($school["phone"])) <= 20
            && is_string($admin["name"]) && trim($admin["name"]) !== "" && strlen(trim($admin["name"])) <= 150
            && is_string($admin["email"]) && strlen(trim($admin["email"])) <= 150 && filter_var(trim($admin["email"]), FILTER_VALIDATE_EMAIL)
            && is_string($admin["password"]) && strlen($admin["password"]) >= 6
            && is_string($admin["password_confirm"]) && hash_equals($admin["password"], $admin["password_confirm"]);
    }

    private function isConstraintViolation(?string $message): bool
    {
        return $message !== null && (str_contains($message, "SQLSTATE[23000]") || str_contains($message, "Duplicate entry"));
    }

    private function validateId(array $data, string $field): bool
    {
        return isset($data[$field]) && filter_var($data[$field], FILTER_VALIDATE_INT) && (int)$data[$field] > 0;
    }

    private function inputData(array $data): array
    {
        $input = file_get_contents("php://input");
        $json = json_decode($input, true);
        if (is_array($json)) {
            $routeData = isset($data["school_id"]) ? ["school_id" => $data["school_id"]] : [];
            return array_merge($json, $routeData);
        }
        return $data;
    }

    private function responseData(School $school): array
    {
        return [
            "id" => $school->getId(),
            "plan_id" => $school->getPlanId(),
            "name" => $school->getName(),
            "code" => $school->getCode(),
            "cnpj" => $school->getCnpj(),
            "email" => $school->getEmail(),
            "phone" => $school->getPhone(),
            "city" => $school->getCity(),
            "state" => $school->getState(),
            "active" => $school->getActive()
        ];
    }

    private function userResponseData(User $user): array
    {
        return [
            "id" => $user->getId(),
            "school_id" => $user->getSchoolId(),
            "type_id" => $user->getTypeId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "phone" => $user->getPhone(),
            "active" => $user->getActive()
        ];
    }
}
