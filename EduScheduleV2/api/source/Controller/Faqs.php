<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Faq;

class Faqs extends Api
{
    public function listById(array $data): void
    {
        if (!$this->validateId($data, "faq_id")) {
            $this->call(400, "bad_request", "ID do FAQ e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->selectById((int)$data["faq_id"])) {
            $this->call(404, "not_found", "FAQ nao encontrado", "error")->back();
            return;
        }

        $this->call(200, "success", "FAQ encontrado", "success")->back($this->format($faq));
    }

    public function listAll(array $data): void
    {
        $faq = new Faq();
        $this->call(200, "success", "Lista de FAQs", "success")->back($faq->selectAllFaqs());
    }

    public function listActive(array $data): void
    {
        $faq = new Faq();
        $this->call(200, "success", "Lista de FAQs ativos", "success")->back($faq->selectActive());
    }

    public function listPaginator(array $data): void
    {
        if (!$this->validateId($data, "page") || !$this->validateId($data, "per_page")) {
            $this->call(
                400,
                "bad_request",
                "Os campos page e per_page sao obrigatorios e devem ser numeros inteiros",
                "error"
            )->back();
            return;
        }

        $faq = new Faq();
        $response = $faq->selectPaginator((int)$data["page"], (int)$data["per_page"], [], "sort_order", "ASC");
        $this->call(200, "success", "Lista de FAQs com paginacao", "success")->back($response);
    }

    public function insert(array $data): void
    {
        $data = $this->requestData($data);

        if (!$this->validate($data)) {
            $this->call(400, "bad_request", "Os campos question e answer sao obrigatorios", "error")->back();
            return;
        }

        $faq = new Faq(
            null,
            trim($data["question"]),
            trim($data["answer"]),
            $this->normalizeStatus($data["status"] ?? 1),
            $this->normalizeOrder($data["sort_order"] ?? null)
        );

        if (!$faq->insert()) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(201, "success", "FAQ inserido com sucesso", "success")->back($this->format($faq));
    }

    public function update(array $data): void
    {
        $data = $this->requestData($data);

        if (!$this->validateId($data, "faq_id")) {
            $this->call(400, "bad_request", "ID do FAQ e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        if (!$this->validate($data)) {
            $this->call(400, "bad_request", "Os campos question e answer sao obrigatorios", "error")->back();
            return;
        }

        $faq = new Faq(
            (int)$data["faq_id"],
            trim($data["question"]),
            trim($data["answer"]),
            $this->normalizeStatus($data["status"] ?? 1),
            $this->normalizeOrder($data["sort_order"] ?? null)
        );

        if (!$faq->updateById((int)$data["faq_id"])) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "FAQ atualizado com sucesso", "success")->back($this->format($faq));
    }

    public function updateStatus(array $data): void
    {
        $data = $this->requestData($data);

        if (!$this->validateId($data, "faq_id") || !isset($data["status"])) {
            $this->call(400, "bad_request", "ID do FAQ e status sao obrigatorios", "error")->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->updateStatusById((int)$data["faq_id"], $this->normalizeStatus($data["status"]))) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "Status do FAQ atualizado com sucesso", "success")->back();
    }

    public function updateOrder(array $data): void
    {
        $data = $this->requestData($data);

        if (!$this->validateId($data, "faq_id") || !$this->validateId($data, "sort_order")) {
            $this->call(400, "bad_request", "ID do FAQ e ordem sao obrigatorios", "error")->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->updateOrderById((int)$data["faq_id"], (int)$data["sort_order"])) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "Ordem do FAQ atualizada com sucesso", "success")->back();
    }

    public function delete(array $data): void
    {
        if (!$this->validateId($data, "faq_id")) {
            $this->call(400, "bad_request", "ID do FAQ e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->deleteById((int)$data["faq_id"])) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "FAQ excluido com sucesso", "success")->back();
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
        return isset($data["question"], $data["answer"]) &&
            trim((string)$data["question"]) !== "" &&
            trim((string)$data["answer"]) !== "";
    }

    private function validateId(array $data, string $field): bool
    {
        return isset($data[$field]) &&
            filter_var($data[$field], FILTER_VALIDATE_INT) &&
            (int)$data[$field] > 0;
    }

    private function normalizeStatus(mixed $status): int
    {
        return (int)((int)$status === 1);
    }

    private function normalizeOrder(mixed $sortOrder): ?int
    {
        if ($sortOrder === null || $sortOrder === "") {
            return null;
        }

        return (int)$sortOrder;
    }

    private function format(Faq $faq): array
    {
        return [
            "id" => $faq->getId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "status" => $faq->getStatus(),
            "sort_order" => $faq->getSortOrder(),
            "created_at" => $faq->getCreatedAt(),
            "updated_at" => $faq->getUpdatedAt()
        ];
    }
}
