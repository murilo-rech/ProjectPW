<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Plan;
use Source\Models\School;

class Schools extends Api
{
    public function listById(array $data): void
    {
        if (!$this->validateId($data, "school_id")) {
            $this->call(400, "bad_request", "ID da escola e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $school = new School();
        if (!$school->selectById((int)$data["school_id"])) {
            $this->call(404, "not_found", "Escola nao encontrada", "error")->back();
            return;
        }

        $this->call(200, "success", "Escola encontrada", "success")->back($this->format($school));
    }

    public function listAll(array $data): void
    {
        $school = new School();
        $this->call(200, "success", "Lista de Escolas", "success")->back($school->selectAllSchools());
    }

    public function insert(array $data): void
    {
        $data = $this->requestData($data);

        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Os campos plan_id, name, code, email e status sao obrigatorios",
                "error"
            )->back();
            return;
        }

        if (!filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
            $this->call(400, "bad_request", "E-mail invalido", "error")->back();
            return;
        }

        $plan = new Plan();
        if (!$plan->selectById((int)$data["plan_id"])) {
            $this->call(404, "not_found", "Plano nao encontrado", "error")->back();
            return;
        }

        $school = new School();
        if ($school->codeExists(trim($data["code"]))) {
            $this->call(400, "bad_request", "Codigo da escola ja cadastrado", "error")->back();
            return;
        }

        $school = new School(
            null,
            (int)$data["plan_id"],
            trim($data["name"]),
            trim($data["code"]),
            trim($data["email"]),
            $this->nullableString($data["phone"] ?? null),
            $this->nullableString($data["city"] ?? null),
            $this->nullableString($data["state"] ?? null),
            (int)$data["status"]
        );

        if (!$school->insert()) {
            $this->call(500, "internal_server_error", $school->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(201, "success", "Escola inserida com sucesso", "success")->back($this->format($school));
    }

    public function update(array $data): void
    {
        $data = $this->requestData($data);

        if (!$this->validateId($data, "school_id")) {
            $this->call(400, "bad_request", "ID da escola e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Os campos plan_id, name, code, email e status sao obrigatorios",
                "error"
            )->back();
            return;
        }

        if (!filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
            $this->call(400, "bad_request", "E-mail invalido", "error")->back();
            return;
        }

        $schoolFound = new School();
        if (!$schoolFound->selectById((int)$data["school_id"])) {
            $this->call(404, "not_found", "Escola nao encontrada", "error")->back();
            return;
        }

        $plan = new Plan();
        if (!$plan->selectById((int)$data["plan_id"])) {
            $this->call(404, "not_found", "Plano nao encontrado", "error")->back();
            return;
        }

        $school = new School();
        if ($school->codeExists(trim($data["code"]), (int)$data["school_id"])) {
            $this->call(400, "bad_request", "Codigo da escola ja cadastrado", "error")->back();
            return;
        }

        $school = new School(
            (int)$data["school_id"],
            (int)$data["plan_id"],
            trim($data["name"]),
            trim($data["code"]),
            trim($data["email"]),
            $this->nullableString($data["phone"] ?? null),
            $this->nullableString($data["city"] ?? null),
            $this->nullableString($data["state"] ?? null),
            (int)$data["status"]
        );

        if (!$school->updateById((int)$data["school_id"])) {
            $this->call(500, "internal_server_error", $school->getErrorMessage(), "error")->back();
            return;
        }

        $school->selectById((int)$data["school_id"]);
        $this->call(200, "success", "Escola atualizada com sucesso", "success")->back($this->format($school));
    }

    public function delete(array $data): void
    {
        if (!$this->validateId($data, "school_id")) {
            $this->call(400, "bad_request", "ID da escola e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $school = new School();
        if (!$school->selectById((int)$data["school_id"])) {
            $this->call(404, "not_found", "Escola nao encontrada", "error")->back();
            return;
        }

        if (!$school->deleteById((int)$data["school_id"])) {
            $this->call(500, "internal_server_error", $school->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "Escola excluida com sucesso", "success")->back();
    }

    private function requestData(array $data): array
    {
        $json = json_decode(file_get_contents("php://input"), true);
        if (is_array($json)) {
            return array_merge($data, $json);
        }

        return $data;
    }

    private function validate(array $data): bool
    {
        return isset($data["plan_id"], $data["name"], $data["code"], $data["email"], $data["status"]) &&
            $data["plan_id"] !== "" &&
            trim((string)$data["name"]) !== "" &&
            trim((string)$data["code"]) !== "" &&
            trim((string)$data["email"]) !== "" &&
            $data["status"] !== "" &&
            filter_var($data["plan_id"], FILTER_VALIDATE_INT) !== false &&
            (int)$data["plan_id"] > 0 &&
            filter_var($data["status"], FILTER_VALIDATE_INT) !== false;
    }

    private function validateId(array $data, string $field): bool
    {
        return isset($data[$field]) &&
            filter_var($data[$field], FILTER_VALIDATE_INT) &&
            (int)$data[$field] > 0;
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null || trim((string)$value) === "") {
            return null;
        }

        return trim((string)$value);
    }

    private function format(School $school): array
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
            "status" => $school->getStatus(),
            "created_at" => $school->getCreatedAt(),
            "updated_at" => $school->getUpdatedAt()
        ];
    }
}
