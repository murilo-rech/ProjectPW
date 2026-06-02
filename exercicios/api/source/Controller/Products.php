<?php

namespace Source\Controller;

use Source\Models\Store\Product;

class Products extends Api
{
    public function listAll(array $data): void
    {
        $products = new Product();
        $this->call(200, "success", "Lista de Produtos", "success")->back($products->listAll());
    }

    public function listById(array $data): void
    {
        if (
            !isset($data["product_id"]) ||
            empty($data["product_id"]) ||
            !filter_var($data["product_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do produto é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $product = new Product();
        $response = $product->findById($data["product_id"]);

        if (!$response) {
            $this->call(404, "not_found", "Produto não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Produto encontrado", "success")->back($response);
    }

    public function insert(array $data): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Os campos name, price e category_id são obrigatórios",
                "error"
            )->back(null);
            return;
        }

        $product = new Product(
            null,
            $data["category_id"],
            $data["name"],
            $data["price"]
        );

        if (!$product->insert()) {
            $this->call(500, "internal_server_error", "Não foi possível cadastrar o produto", "error")->back(null);
            return;
        }

        $this->call(201, "created", "Produto criado com sucesso", "success")->back(
            $product->findById($product->getId())
        );
    }

    public function update(array $data): void
    {
        $body = json_decode(file_get_contents("php://input"), true);

        if (
            !isset($data["product_id"]) ||
            empty($data["product_id"]) ||
            !filter_var($data["product_id"], FILTER_VALIDATE_INT) ||
            !$this->validate($body)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID inválido ou campos obrigatórios ausentes",
                "error"
            )->back(null);
            return;
        }

        $product = new Product();

        if (!$product->findById($data["product_id"])) {
            $this->call(404, "not_found", "Produto não encontrado", "error")->back(null);
            return;
        }

        $product = new Product(
            null,
            $body["category_id"],
            $body["name"],
            $body["price"]
        );

        if (!$product->updateProductById($data["product_id"])) {
            $this->call(500, "internal_server_error", "Não foi possível atualizar o produto", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Produto atualizado com sucesso", "success")->back(
            $product->findById($data["product_id"])
        );
    }

    public function delete(array $data): void
    {
        if (
            !isset($data["product_id"]) ||
            empty($data["product_id"]) ||
            !filter_var($data["product_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do produto é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $product = new Product();

        if (!$product->softDeleteById($data["product_id"])) {
            $this->call(404, "not_found", "Produto não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Produto removido com sucesso", "success")->back(null);
    }

    public function listPaginator(array $data): void
    {
        if (
            !isset($data["page"]) ||
            !isset($data["per_page"]) ||
            empty($data["page"]) ||
            empty($data["per_page"]) ||
            !filter_var($data["page"], FILTER_VALIDATE_INT) ||
            !filter_var($data["per_page"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "Os campos page e per_page são obrigatórios, devem ser números inteiros e maiores que zero",
                "error"
            )->back(null);
            return;
        }

        $products = new Product();
        $response = $products->selectPaginator($data["page"], $data["per_page"], ["active = 1"], 'id', 'ASC');
        $this->call(200, "success", "Lista de Produtos com Paginação", "success")->back($response);
    }

    public function validate($data): bool
    {
        if (
            !isset($data["category_id"]) ||
            !isset($data["name"]) ||
            !isset($data["price"]) ||
            empty($data["category_id"]) ||
            empty($data["name"]) ||
            empty($data["price"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT) ||
            !filter_var($data["price"], FILTER_VALIDATE_FLOAT)
        ) {
            return false;
        }

        return true;
    }
}
