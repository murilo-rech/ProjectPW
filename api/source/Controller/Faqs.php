<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Faqs\Faq;

class Faqs extends Api
{
    public function listActive(array $data): void
    {
        $faq = new Faq();
        $this->call(200, "success", "Lista de FAQs ativas", "success")->back($faq->selectList(true));
    }

    public function listAll(array $data): void
    {
        $faq = new Faq();
        $this->call(200, "success", "Lista de FAQs", "success")->back($faq->selectList());
    }

    public function listById(array $data): void
    {
        if (!$this->validateId($data, "faq_id")) {
            $this->call(400, "bad_request", "ID do FAQ e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->selectOne((int)$data["faq_id"])) {
            $this->call(404, "not_found", "FAQ nao encontrado", "error")->back();
            return;
        }

        $this->call(200, "success", "FAQ encontrado", "success")->back($this->responseData($faq));
    }

    public function listPaginator(array $data): void
    {
        if (!$this->validateId($data, "page") || !$this->validateId($data, "per_page")) {
            $this->call(400, "bad_request", "Os campos page e per_page sao obrigatorios e devem ser numeros inteiros", "error")->back();
            return;
        }

        $faq = new Faq();
        $response = $faq->selectPaginator((int)$data["page"], (int)$data["per_page"], [], "sort_order", "ASC");
        $this->call(200, "success", "Lista de FAQs com Paginacao", "success")->back($response);
    }

    public function insert(array $data): void
    {
        $data = $this->inputData($data);

        if (!$this->validate($data)) {
            $this->call(400, "bad_request", "Os campos question e answer sao obrigatorios", "error")->back();
            return;
        }

        $faq = new Faq(
            null,
            trim($data["question"]),
            trim($data["answer"]),
            isset($data["status"]) ? (int)$data["status"] : (isset($data["active"]) ? (int)$data["active"] : 1),
            isset($data["sort_order"]) && filter_var($data["sort_order"], FILTER_VALIDATE_INT) ? (int)$data["sort_order"] : null
        );

        if (!$faq->insert()) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }

        $faq->selectOne((int)$faq->getId());
        $this->call(201, "success", "FAQ inserido com sucesso", "created")->back($this->responseData($faq));
    }

    public function update(array $data): void
    {
        $data = $this->inputData($data);

        if (!$this->validateId($data, "faq_id") || !$this->validate($data)) {
            $this->call(400, "bad_request", "ID invalido ou campos obrigatorios ausentes", "error")->back();
            return;
        }

        $existing = new Faq();
        if (!$existing->selectOne((int)$data["faq_id"])) {
            $this->call(404, "not_found", "FAQ nao encontrado", "error")->back();
            return;
        }

        $faq = new Faq(
            null,
            trim($data["question"]),
            trim($data["answer"]),
            isset($data["status"]) ? (int)$data["status"] : (isset($data["active"]) ? (int)$data["active"] : null),
            isset($data["sort_order"]) && filter_var($data["sort_order"], FILTER_VALIDATE_INT) ? (int)$data["sort_order"] : null
        );

        if (!$faq->updateById((int)$data["faq_id"])) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }

        $faq->selectOne((int)$data["faq_id"]);
        $this->call(200, "success", "FAQ atualizado com sucesso", "success")->back($this->responseData($faq));
    }

    public function updateStatus(array $data): void
    {
        $data = $this->inputData($data);

        if (
            !$this->validateId($data, "faq_id") ||
            !isset($data["status"]) ||
            filter_var($data["status"], FILTER_VALIDATE_INT) === false ||
            !in_array((int)$data["status"], [0, 1], true)
        ) {
            $this->call(400, "bad_request", "ID e status sao obrigatorios", "error")->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->selectOne((int)$data["faq_id"])) {
            $this->call(404, "not_found", "FAQ nao encontrado", "error")->back();
            return;
        }

        if (!$faq->updateStatus((int)$data["faq_id"], (int)$data["status"])) {
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "Status do FAQ atualizado com sucesso", "success")->back();
    }

    public function updateOrder(array $data): void
    {
        $data = $this->inputData($data);

        if (!$this->validateId($data, "faq_id") || !isset($data["sort_order"]) || !filter_var($data["sort_order"], FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID e sort_order sao obrigatorios", "error")->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->selectOne((int)$data["faq_id"])) {
            $this->call(404, "not_found", "FAQ nao encontrado", "error")->back();
            return;
        }

        if (!$faq->updateOrder((int)$data["faq_id"], (int)$data["sort_order"])) {
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
        if (!$faq->softDeleteById((int)$data["faq_id"])) {
            $this->call(404, "not_found", "FAQ nao encontrado", "error")->back();
            return;
        }

        $this->call(200, "success", "FAQ excluido com sucesso", "success")->back();
    }

    private function validate(array $data): bool
    {
        return isset($data["question"], $data["answer"])
            && !empty(trim($data["question"]))
            && !empty(trim($data["answer"]));
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

    private function responseData(Faq $faq): array
    {
        return [
            "id" => $faq->getId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "status" => $faq->getActive(),
            "sort_order" => $faq->getSortOrder()
        ];
    }
}
