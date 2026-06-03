<?php

namespace Source\Controller;

use Source\Models\Store\ProductCategory;

class CategoriesProducts extends Api
{
    public function listById(array $data): void
    {
        if (
            !isset($data["category_id"]) ||
            empty($data["category_id"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID da categoria do produto é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $category = new ProductCategory();
        if (!$category->selectById($data["category_id"]) || $category->getActive() !== 1) {
            $this->call(404, "not_found", "Categoria não encontrada", "error")->back(null);
            return;
        }

        $response = [
            "id" => $category->getId(),
            "name" => $category->getName()
        ];

        $this->call(200, "success", "Categoria encontrada", "success")->back($response);
    }

    public function insert(array $data): void
    {
        $payload = $this->getJsonInput();

        if (!isset($payload["name"]) || empty($payload["name"])) {
            $this->call(400, "bad_request", "O campo nome é obrigatório", "error")->back(null);
            return;
        }

        $category = new ProductCategory(null, $payload["name"]);

        if (!$category->insert()) {
            $this->call(500, "internal_server_error", "Não foi possível cadastrar o produto", "error")->back(null);
            return;
        }

        $response = [
            "id" => $category->getId(),
            "name" => $category->getName()
        ];

        $this->call(201, "created", "Categoria de Produto criada com sucesso", "success")->back($response);
    }
}
