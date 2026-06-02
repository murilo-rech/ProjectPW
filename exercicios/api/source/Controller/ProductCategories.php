<?php

namespace Source\Controller;

use Source\Models\Store\ProductCategory;

class ProductCategories extends Api
{
    public function listAll(array $data): void
    {
        $categories = new ProductCategory();
        $this->call(200, "success", "Lista de Categorias de Produto", "success")->back($categories->listAll());
    }

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
        $response = $category->findById($data["category_id"]);

        if (!$response) {
            $this->call(404, "not_found", "Categoria não encontrada", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Categoria encontrada", "success")->back($response);
    }

    public function insert(array $data): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data["name"]) || empty($data["name"])) {
            $this->call(400, "bad_request", "O campo nome é obrigatório", "error")->back(null);
            return;
        }

        $category = new ProductCategory(null, $data["name"]);

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
