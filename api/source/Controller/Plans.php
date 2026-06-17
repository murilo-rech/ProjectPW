<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Plan;

class Plans extends Api
{
    public function listById(array $data): void
    {
        if (!$this->validateId($data, "plan_id")) {
            $this->call(400, "bad_request", "ID do plano e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $plan = new Plan();
        if (!$plan->selectById((int)$data["plan_id"])) {
            $this->call(404, "not_found", "Plano nao encontrado", "error")->back();
            return;
        }

        $this->call(200, "success", "Plano encontrado", "success")->back($this->format($plan));
    }

    public function listAll(array $data): void
    {
        $plan = new Plan();
        $this->call(200, "success", "Lista de Planos", "success")->back($plan->selectAllPlans());
    }

    public function insert(array $data): void
    {
        $data = $this->requestData($data);

        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Os campos name, price, max_students, max_teachers e status sao obrigatorios",
                "error"
            )->back();
            return;
        }

        $plan = new Plan(
            null,
            trim($data["name"]),
            $this->nullableString($data["description"] ?? null),
            (float)$data["price"],
            (int)$data["max_students"],
            (int)$data["max_teachers"],
            (int)$data["status"]
        );

        if (!$plan->insert()) {
            $this->call(500, "internal_server_error", $plan->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(201, "success", "Plano inserido com sucesso", "success")->back($this->format($plan));
    }

    public function update(array $data): void
    {
        $data = $this->requestData($data);

        if (!$this->validateId($data, "plan_id")) {
            $this->call(400, "bad_request", "ID do plano e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Os campos name, price, max_students, max_teachers e status sao obrigatorios",
                "error"
            )->back();
            return;
        }

        $planFound = new Plan();
        if (!$planFound->selectById((int)$data["plan_id"])) {
            $this->call(404, "not_found", "Plano nao encontrado", "error")->back();
            return;
        }

        $plan = new Plan(
            (int)$data["plan_id"],
            trim($data["name"]),
            $this->nullableString($data["description"] ?? null),
            (float)$data["price"],
            (int)$data["max_students"],
            (int)$data["max_teachers"],
            (int)$data["status"]
        );

        if (!$plan->updateById((int)$data["plan_id"])) {
            $this->call(500, "internal_server_error", $plan->getErrorMessage(), "error")->back();
            return;
        }

        $plan->selectById((int)$data["plan_id"]);
        $this->call(200, "success", "Plano atualizado com sucesso", "success")->back($this->format($plan));
    }

    public function delete(array $data): void
    {
        if (!$this->validateId($data, "plan_id")) {
            $this->call(400, "bad_request", "ID do plano e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $plan = new Plan();
        if (!$plan->selectById((int)$data["plan_id"])) {
            $this->call(404, "not_found", "Plano nao encontrado", "error")->back();
            return;
        }

        if (!$plan->deleteById((int)$data["plan_id"])) {
            $this->call(500, "internal_server_error", $plan->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "Plano excluido com sucesso", "success")->back();
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
        return isset($data["name"], $data["price"], $data["max_students"], $data["max_teachers"], $data["status"]) &&
            trim((string)$data["name"]) !== "" &&
            $data["price"] !== "" &&
            $data["max_students"] !== "" &&
            $data["max_teachers"] !== "" &&
            $data["status"] !== "" &&
            is_numeric($data["price"]) &&
            filter_var($data["max_students"], FILTER_VALIDATE_INT) !== false &&
            filter_var($data["max_teachers"], FILTER_VALIDATE_INT) !== false &&
            filter_var($data["status"], FILTER_VALIDATE_INT) !== false &&
            (int)$data["max_students"] > 0 &&
            (int)$data["max_teachers"] > 0;
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

    private function format(Plan $plan): array
    {
        return [
            "id" => $plan->getId(),
            "name" => $plan->getName(),
            "description" => $plan->getDescription(),
            "price" => $plan->getPrice(),
            "max_students" => $plan->getMaxStudents(),
            "max_teachers" => $plan->getMaxTeachers(),
            "status" => $plan->getStatus(),
            "created_at" => $plan->getCreatedAt(),
            "updated_at" => $plan->getUpdatedAt()
        ];
    }
}
