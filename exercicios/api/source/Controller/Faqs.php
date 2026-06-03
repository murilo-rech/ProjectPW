<?php

namespace Source\Controller;

use Source\Models\Store\Faq;

class Faqs extends Api
{
    public function listAll(array $data): void
    {
        $faq = new Faq();
        $this->call(200, "success", "Lista de FAQs", "success")->back($faq->listAllWithCategory());
    }

    public function listById(array $data): void
    {
        if (
            !isset($data["faq_id"]) ||
            empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID do FAQ é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $faq = new Faq();
        $response = $faq->selectByIdWithCategory($data["faq_id"]);

        if (!$response) {
            $this->call(404, "not_found", "FAQ não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "FAQ encontrado", "success")->back($response);
    }

    public function insert(array $data): void
    {
        $payload = $this->getJsonInput();

        if (!$this->validate($payload)) {
            $this->call(
                400,
                "bad_request",
                "Os campos question, answer e faqs_category_id são obrigatórios",
                "error"
            )->back(null);
            return;
        }

        $faq = new Faq(
            null,
            $payload["faqs_category_id"],
            $payload["question"],
            $payload["answer"]
        );

        if (!$faq->insert()) {
            $this->call(500, "internal_server_error", "Não foi possível cadastrar o FAQ", "error")->back(null);
            return;
        }

        $response = $faq->selectByIdWithCategory($faq->getId());

        if (!$response) {
            $this->call(500, "internal_server_error", "Não foi possível cadastrar o FAQ", "error")->back(null);
            return;
        }

        $this->call(201, "created", "FAQ criado com sucesso", "success")->back($response);
    }

    public function update(array $data): void
    {
        $payload = $this->getJsonInput();

        if (
            !isset($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT) ||
            !$this->validate($payload)
        ) {
            $this->call(400, "bad_request", "ID inválido ou campos obrigatórios ausentes", "error")->back(null);
            return;
        }

        $faq = new Faq();
        if (!$faq->selectByIdWithCategory($data["faq_id"])) {
            $this->call(404, "not_found", "FAQ não encontrado", "error")->back(null);
            return;
        }

        $faq = new Faq(
            null,
            $payload["faqs_category_id"],
            $payload["question"],
            $payload["answer"]
        );

        if (
            !$faq->updateById($data["faq_id"]) &&
            $faq->getErrorMessage() !== "Registro não encontrado ou sem alterações."
        ) {
            $this->call(500, "internal_server_error", "Não foi possível atualizar o FAQ", "error")->back(null);
            return;
        }

        $response = $faq->selectByIdWithCategory($data["faq_id"]);

        if (!$response) {
            $this->call(500, "internal_server_error", "Não foi possível atualizar o FAQ", "error")->back(null);
            return;
        }

        $this->call(200, "success", "FAQ atualizado com sucesso", "success")->back($response);
    }

    public function delete(array $data): void
    {
        if (
            !isset($data["faq_id"]) ||
            empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(400, "bad_request", "ID do FAQ é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        $faq = new Faq();
        if (!$faq->selectByIdWithCategory($data["faq_id"])) {
            $this->call(404, "not_found", "FAQ não encontrado", "error")->back(null);
            return;
        }

        if (!$faq->softDeleteById($data["faq_id"])) {
            $this->call(404, "not_found", "FAQ não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "FAQ removido com sucesso", "success")->back(null);
    }

    private function validate(array $data): bool
    {
        if (
            !isset($data["faqs_category_id"]) ||
            !isset($data["question"]) ||
            !isset($data["answer"]) ||
            empty($data["faqs_category_id"]) ||
            empty($data["question"]) ||
            empty($data["answer"]) ||
            !filter_var($data["faqs_category_id"], FILTER_VALIDATE_INT)
        ) {
            return false;
        }

        return true;
    }
}
