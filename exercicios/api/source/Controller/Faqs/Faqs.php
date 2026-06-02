<?php

namespace Source\Controller\Faqs;

use Source\Controller\Api;
use Source\Models\Faqs\Faq;

class Faqs extends Api
{
    public function listAll(array $data): void
    {
        $faqs = new Faq();
        $this->call(200, "success", "Lista de FAQs", "success")->back($faqs->listAll());
    }

    public function listById(array $data): void
    {
        if (
            !isset($data["faq_id"]) ||
            empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do FAQ é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $faq = new Faq();
        $response = $faq->findById($data["faq_id"]);

        if (!$response) {
            $this->call(404, "not_found", "FAQ não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "FAQ encontrado", "success")->back($response);
    }

    public function insert(array $data): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$this->validate($data)) {
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
            $data["faqs_category_id"],
            $data["question"],
            $data["answer"]
        );

        if (!$faq->insert()) {
            $this->call(500, "internal_server_error", "Não foi possível cadastrar o FAQ", "error")->back(null);
            return;
        }

        $this->call(201, "created", "FAQ criado com sucesso", "success")->back(
            $faq->findById($faq->getId())
        );
    }

    public function update(array $data): void
    {
        $body = json_decode(file_get_contents("php://input"), true);

        if (
            !isset($data["faq_id"]) ||
            empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT) ||
            !$this->validate($body)
        ) {
            $this->call(400, "bad_request", "ID inválido ou campos obrigatórios ausentes", "error")->back(null);
            return;
        }

        $faq = new Faq();

        if (!$faq->findById($data["faq_id"])) {
            $this->call(404, "not_found", "FAQ não encontrado", "error")->back(null);
            return;
        }

        $faq = new Faq(
            null,
            $body["faqs_category_id"],
            $body["question"],
            $body["answer"]
        );

        if (!$faq->updateFaqById($data["faq_id"])) {
            $this->call(500, "internal_server_error", "Não foi possível atualizar o FAQ", "error")->back(null);
            return;
        }

        $this->call(200, "success", "FAQ atualizado com sucesso", "success")->back(
            $faq->findById($data["faq_id"])
        );
    }

    public function delete(array $data): void
    {
        if (
            !isset($data["faq_id"]) ||
            empty($data["faq_id"]) ||
            !filter_var($data["faq_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do FAQ é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $faq = new Faq();

        if (!$faq->softDeleteById($data["faq_id"])) {
            $this->call(404, "not_found", "FAQ não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "FAQ removido com sucesso", "success")->back(null);
    }

    public function validate($data): bool
    {
        if (
            !isset($data["question"]) ||
            !isset($data["answer"]) ||
            !isset($data["faqs_category_id"]) ||
            empty($data["question"]) ||
            empty($data["answer"]) ||
            empty($data["faqs_category_id"]) ||
            !filter_var($data["faqs_category_id"], FILTER_VALIDATE_INT)
        ) {
            return false;
        }

        return true;
    }
}
