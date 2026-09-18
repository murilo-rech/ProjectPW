<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\School;

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

        $school = new School(
            null,
            (int)$data["plan_id"],
            trim($data["name"]),
            trim($data["code"]),
            trim($data["email"]),
            $data["phone"] ?? null,
            $data["city"] ?? null,
            $data["state"] ?? null,
            isset($data["active"]) ? (int)$data["active"] : 1
        );

        if (!$school->insert()) {
            $this->call(500, "internal_server_error", $school->getErrorMessage(), "error")->back();
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

        $school = new School(
            null,
            (int)$data["plan_id"],
            trim($data["name"]),
            trim($data["code"]),
            trim($data["email"]),
            $data["phone"] ?? null,
            $data["city"] ?? null,
            $data["state"] ?? null,
            isset($data["active"]) ? (int)$data["active"] : null
        );

        if (!$school->updateById((int)$data["school_id"])) {
            $this->call(500, "internal_server_error", $school->getErrorMessage(), "error")->back();
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
            $this->call(404, "not_found", "Escola nao encontrada", "error")->back();
            return;
        }

        $this->call(200, "success", "Escola excluida com sucesso", "success")->back();
    }

    private function validate(array $data): bool
    {
        return isset($data["plan_id"], $data["name"], $data["code"], $data["email"])
            && filter_var($data["plan_id"], FILTER_VALIDATE_INT)
            && !empty(trim($data["name"]))
            && !empty(trim($data["code"]))
            && filter_var($data["email"], FILTER_VALIDATE_EMAIL);
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
            $data = array_merge($data, $json);
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
            "email" => $school->getEmail(),
            "phone" => $school->getPhone(),
            "city" => $school->getCity(),
            "state" => $school->getState(),
            "active" => $school->getActive()
        ];
    }
}
