<?php

namespace Source\Controller;

use Source\Models\Store\Product;

class Products extends Api
{
    public function listAll(array $data): void
    {
        $product = new Product();
        $this->call(200, "success", "Lista de Produtos", "success")->back($product->listAllWithCategory());
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
        $response = $product->selectByIdWithCategory($data["product_id"]);

        if (!$response) {
            $this->call(404, "not_found", "Produto não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Produto encontrado", "success")->back($response);
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

        $product = new Product();
        $response = $product->selectPaginator($data["page"], $data["per_page"], ["active = 1"], "id", "ASC");
        $this->call(200, "success", "Lista de Produtos com Paginação", "success")->back($response);
    }

    public function insert(array $data): void
    {
        $payload = $this->getJsonInput();

        if (!$this->validate($payload)) {
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
            $payload["category_id"],
            $payload["name"],
            $payload["price"]
        );

        if (!$product->insert()) {
            $this->call(500, "internal_server_error", "Não foi possível cadastrar o produto", "error")->back(null);
            return;
        }

        $response = $product->selectByIdWithCategory($product->getId());

        if (!$response) {
            $this->call(500, "internal_server_error", "Não foi possível cadastrar o produto", "error")->back(null);
            return;
        }

        $this->call(201, "created", "Produto criado com sucesso", "success")->back($response);
    }

    public function update(array $data): void
    {
        $payload = $this->getJsonInput();

        if (
            !isset($data["product_id"]) ||
            !filter_var($data["product_id"], FILTER_VALIDATE_INT) ||
            !$this->validate($payload)
        ) {
            $this->call(400, "bad_request", "ID inválido ou campos obrigatórios ausentes", "error")->back(null);
            return;
        }

        $product = new Product();
        if (!$product->selectByIdWithCategory($data["product_id"])) {
            $this->call(404, "not_found", "Produto não encontrado", "error")->back(null);
            return;
        }

        $product = new Product(
            null,
            $payload["category_id"],
            $payload["name"],
            $payload["price"]
        );

        if (
            !$product->updateById($data["product_id"]) &&
            $product->getErrorMessage() !== "Registro não encontrado ou sem alterações."
        ) {
            $this->call(500, "internal_server_error", "Não foi possível atualizar o produto", "error")->back(null);
            return;
        }

        $response = $product->selectByIdWithCategory($data["product_id"]);

        if (!$response) {
            $this->call(500, "internal_server_error", "Não foi possível atualizar o produto", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Produto atualizado com sucesso", "success")->back($response);
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
        if (!$product->selectByIdWithCategory($data["product_id"])) {
            $this->call(404, "not_found", "Produto não encontrado", "error")->back(null);
            return;
        }

        if (!$product->softDeleteById($data["product_id"])) {
            $this->call(404, "not_found", "Produto não encontrado", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Produto removido com sucesso", "success")->back(null);
    }

    private function validate(array $data): bool
    {
        if (
            !isset($data["category_id"]) ||
            !isset($data["name"]) ||
            !isset($data["price"]) ||
            empty($data["category_id"]) ||
            empty($data["name"]) ||
            !filter_var($data["category_id"], FILTER_VALIDATE_INT) ||
            filter_var($data["price"], FILTER_VALIDATE_FLOAT) === false
        ) {
            return false;
        }

        return true;
    }
}
