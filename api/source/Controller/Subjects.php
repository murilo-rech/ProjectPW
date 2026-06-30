<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Subject;

class Subjects extends Api
{
    private const GLOBAL_ADMIN = 1;
    private const SCHOOL_ADMIN = 2;
    private const TEACHER = 3;
    private const STUDENT = 4;

    public function listById(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        if (!$this->validateId($data, "subject_id")) {
            $this->call(400, "bad_request", "ID da disciplina e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $subject = new Subject();
        if (!$subject->selectById((int)$data["subject_id"])) {
            $this->call(404, "not_found", "Disciplina nao encontrada", "error")->back();
            return;
        }

        if (!$this->canAccess($subject)) {
            $this->call(403, "forbidden", "Usuario sem permissao para acessar esta disciplina.", "error")->back();
            return;
        }

        $this->call(200, "success", "Disciplina encontrada", "success")->back($this->responseData($subject));
    }

    public function listAll(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $subject = new Subject();
        $this->call(200, "success", "Lista de Disciplinas", "success")->back($subject->selectAll($this->schoolFilters()));
    }

    public function listPaginator(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        if (!$this->validateId($data, "page") || !$this->validateId($data, "per_page")) {
            $this->call(400, "bad_request", "Os campos page e per_page sao obrigatorios e devem ser numeros inteiros", "error")->back();
            return;
        }

        $subject = new Subject();
        $response = $subject->selectPaginator(
            (int)$data["page"],
            (int)$data["per_page"],
            $this->schoolFilters(),
            "id",
            "ASC"
        );

        $this->call(200, "success", "Lista de Disciplinas com Paginacao", "success")->back($response);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(self::SCHOOL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->inputData($data);

        if (!$this->validate($data) || $this->userAuthSchoolId === null) {
            $this->call(400, "bad_request", "O campo name e obrigatorio", "error")->back();
            return;
        }

        $subject = new Subject(
            null,
            (int)$this->userAuthSchoolId,
            trim($data["name"]),
            isset($data["active"]) ? (int)$data["active"] : 1
        );

        if (!$subject->insert()) {
            $this->call(500, "internal_server_error", $subject->getErrorMessage(), "error")->back();
            return;
        }

        $subject->selectById((int)$subject->getId());
        $this->call(201, "success", "Disciplina inserida com sucesso", "created")->back($this->responseData($subject));
    }

    public function update(array $data): void
    {
        if (!$this->authToken(self::SCHOOL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->inputData($data);

        if (!$this->validateId($data, "subject_id") || !$this->validate($data)) {
            $this->call(400, "bad_request", "ID invalido ou campos obrigatorios ausentes", "error")->back();
            return;
        }

        $existing = new Subject();
        if (!$existing->selectById((int)$data["subject_id"])) {
            $this->call(404, "not_found", "Disciplina nao encontrada", "error")->back();
            return;
        }

        if (!$this->canAccess($existing)) {
            $this->call(403, "forbidden", "Usuario sem permissao para atualizar esta disciplina.", "error")->back();
            return;
        }

        $subject = new Subject(
            null,
            null,
            trim($data["name"]),
            isset($data["active"]) ? (int)$data["active"] : null
        );

        if (!$subject->updateById((int)$data["subject_id"])) {
            $this->call(500, "internal_server_error", $subject->getErrorMessage(), "error")->back();
            return;
        }

        $subject->selectById((int)$data["subject_id"]);
        $this->call(200, "success", "Disciplina atualizada com sucesso", "success")->back($this->responseData($subject));
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(self::SCHOOL_ADMIN)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        if (!$this->validateId($data, "subject_id")) {
            $this->call(400, "bad_request", "ID da disciplina e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $subject = new Subject();
        if (!$subject->selectById((int)$data["subject_id"])) {
            $this->call(404, "not_found", "Disciplina nao encontrada", "error")->back();
            return;
        }

        if (!$this->canAccess($subject)) {
            $this->call(403, "forbidden", "Usuario sem permissao para excluir esta disciplina.", "error")->back();
            return;
        }

        if (!$subject->softDeleteById((int)$data["subject_id"])) {
            $this->call(404, "not_found", "Disciplina nao encontrada", "error")->back();
            return;
        }

        $this->call(200, "success", "Disciplina excluida com sucesso", "success")->back();
    }

    private function validate(array $data): bool
    {
        if (!isset($data["name"]) || empty(trim($data["name"]))) {
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

    private function canAccess(Subject $subject): bool
    {
        return $this->userAuthTypeId === self::GLOBAL_ADMIN
            || ($this->userAuthSchoolId !== null && $subject->getSchoolId() === $this->userAuthSchoolId);
    }

    private function schoolFilters(): array
    {
        if ($this->userAuthTypeId === self::GLOBAL_ADMIN) {
            return [];
        }

        return ["school_id = " . (int)$this->userAuthSchoolId];
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

    private function responseData(Subject $subject): array
    {
        return [
            "id" => $subject->getId(),
            "school_id" => $subject->getSchoolId(),
            "name" => $subject->getName(),
            "active" => $subject->getActive()
        ];
    }
}
