<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Address;

class Addresses extends Api
{
    private const SCHOOL_ADMIN = 2;

    public function listById(array $data): void
    {
        if (!$this->authToken(self::SCHOOL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        if (!$this->validateId($data, "address_id")) {
            $this->call(400, "bad_request", "ID do endereco e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $address = new Address();
        if (!$address->selectById((int)$data["address_id"])) {
            $this->call(404, "not_found", "Endereco nao encontrado", "error")->back();
            return;
        }

        if ($address->getUserId() !== $this->userAuthId) {
            $this->call(403, "forbidden", "Usuario sem permissao para acessar este endereco.", "error")->back();
            return;
        }

        $this->call(200, "success", "Endereco encontrado", "success")->back($this->responseData($address));
    }

    public function listAll(array $data): void
    {
        if (!$this->authToken(self::SCHOOL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $address = new Address();
        $this->call(200, "success", "Lista de Enderecos", "success")->back(
            $address->selectAll(["user_id = " . (int)$this->userAuthId])
        );
    }

    public function listPaginator(array $data): void
    {
        if (!$this->authToken(self::SCHOOL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        if (!$this->validateId($data, "page") || !$this->validateId($data, "per_page")) {
            $this->call(400, "bad_request", "Os campos page e per_page sao obrigatorios e devem ser numeros inteiros", "error")->back();
            return;
        }

        $address = new Address();
        $response = $address->selectPaginator(
            (int)$data["page"],
            (int)$data["per_page"],
            ["user_id = " . (int)$this->userAuthId],
            "id",
            "ASC"
        );

        $this->call(200, "success", "Lista de Enderecos com Paginacao", "success")->back($response);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(self::SCHOOL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->inputData($data);

        if (!$this->validate($data)) {
            $this->call(400, "bad_request", "Os campos street e number sao obrigatorios", "error")->back();
            return;
        }

        $address = new Address(
            null,
            (int)$this->userAuthId,
            trim($data["street"]),
            trim($data["number"]),
            isset($data["active"]) ? (int)$data["active"] : 1
        );

        if (!$address->insert()) {
            $this->call(500, "internal_server_error", $address->getErrorMessage(), "error")->back();
            return;
        }

        $address->selectById((int)$address->getId());
        $this->call(201, "success", "Endereco inserido com sucesso", "created")->back($this->responseData($address));
    }

    public function update(array $data): void
    {
        if (!$this->authToken(self::SCHOOL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->inputData($data);

        if (!$this->validateId($data, "address_id") || !$this->validate($data)) {
            $this->call(400, "bad_request", "ID invalido ou campos obrigatorios ausentes", "error")->back();
            return;
        }

        $existing = new Address();
        if (!$existing->selectById((int)$data["address_id"])) {
            $this->call(404, "not_found", "Endereco nao encontrado", "error")->back();
            return;
        }

        if ($existing->getUserId() !== $this->userAuthId) {
            $this->call(403, "forbidden", "Usuario sem permissao para atualizar este endereco.", "error")->back();
            return;
        }

        $address = new Address(
            null,
            (int)$this->userAuthId,
            trim($data["street"]),
            trim($data["number"]),
            isset($data["active"]) ? (int)$data["active"] : null
        );

        if (!$address->updateById((int)$data["address_id"])) {
            $this->call(500, "internal_server_error", $address->getErrorMessage(), "error")->back();
            return;
        }

        $address->selectById((int)$data["address_id"]);
        $this->call(200, "success", "Endereco atualizado com sucesso", "success")->back($this->responseData($address));
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(self::SCHOOL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        if (!$this->validateId($data, "address_id")) {
            $this->call(400, "bad_request", "ID do endereco e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $address = new Address();
        if (!$address->selectById((int)$data["address_id"])) {
            $this->call(404, "not_found", "Endereco nao encontrado", "error")->back();
            return;
        }

        if ($address->getUserId() !== $this->userAuthId) {
            $this->call(403, "forbidden", "Usuario sem permissao para excluir este endereco.", "error")->back();
            return;
        }

        if (!$address->softDeleteById((int)$data["address_id"])) {
            $this->call(404, "not_found", "Endereco nao encontrado", "error")->back();
            return;
        }

        $this->call(200, "success", "Endereco excluido com sucesso", "success")->back();
    }

    private function validate(array $data): bool
    {
        if (
            !isset($data["street"], $data["number"])
            || empty(trim($data["street"]))
            || empty(trim($data["number"]))
        ) {
            return false;
        }

        return !isset($data["active"]) || $this->validateActive($data["active"]);
    }

    private function validateId(array $data, string $field): bool
    {
        return isset($data[$field])
            && filter_var($data[$field], FILTER_VALIDATE_INT) !== false
            && (int)$data[$field] > 0;
    }

    private function validateActive(mixed $active): bool
    {
        return filter_var($active, FILTER_VALIDATE_INT) !== false
            && in_array((int)$active, [0, 1], true);
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

    private function responseData(Address $address): array
    {
        return [
            "id" => $address->getId(),
            "user_id" => $address->getUserId(),
            "street" => $address->getStreet(),
            "number" => $address->getNumber(),
            "active" => $address->getActive()
        ];
    }
}
