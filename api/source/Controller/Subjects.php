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
        if ($this->userAuthTypeId === self::TEACHER) {
            $rows = $this->userAuthSchoolId === null
                ? []
                : $subject->selectForTeacher((int)$this->userAuthId, $this->userAuthSchoolId);
        } else {
            $rows = $subject->selectAll($this->schoolFilters());
        }
        if ($rows === false) {
            $this->call(500, "internal_server_error", "Nao foi possivel consultar as materias.", "error")->back();
            return;
        }
        $this->call(200, "success", "Lista de Disciplinas", "success")->back($rows);
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
        if ($this->userAuthTypeId === self::TEACHER) {
            $rows = $this->userAuthSchoolId === null
                ? []
                : $subject->selectForTeacher((int)$this->userAuthId, $this->userAuthSchoolId);
            if ($rows === false) {
                $this->call(500, "internal_server_error", "Nao foi possivel consultar as materias.", "error")->back();
                return;
            }
            $page = (int)$data["page"];
            $perPage = (int)$data["per_page"];
            $response = [
                "page" => $page,
                "perPage" => $perPage,
                "total" => count($rows),
                "data" => array_slice($rows, ($page - 1) * $perPage, $perPage)
            ];
        } else {
            $response = $subject->selectPaginator(
                (int)$data["page"],
                (int)$data["per_page"],
                $this->schoolFilters(),
                "id",
                "ASC"
            );
        }

        $this->call(200, "success", "Lista de Disciplinas com Paginacao", "success")->back($response);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken([self::SCHOOL_ADMIN, self::TEACHER])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->inputData($data);

        if (!$this->validate($data) || $this->userAuthSchoolId === null) {
            $this->call(400, "bad_request", "O campo name e obrigatorio", "error")->back();
            return;
        }

        $name = trim($data["name"]);
        $existing = new Subject();
        $existingRow = $existing->findByNameInSchool($name, (int)$this->userAuthSchoolId);
        if ($existing->getErrorMessage() !== null) {
            $this->call(500, "internal_server_error", "Nao foi possivel verificar a materia.", "error")->back();
            return;
        }

        if ($this->userAuthTypeId === self::TEACHER && is_array($existingRow)) {
            if ((int)$existingRow["active"] !== 1) {
                $this->call(400, "bad_request", "Esta materia esta inativa. Solicite a reativacao ao administrador da escola.", "error")->back();
                return;
            }
            if (!$existing->assignTeacher((int)$existingRow["id"], (int)$this->userAuthId)) {
                $this->call(500, "internal_server_error", "Nao foi possivel associar a materia ao professor.", "error")->back();
                return;
            }
            $existing->selectById((int)$existingRow["id"]);
            $this->call(200, "success", "Materia adicionada ao professor.", "success")->back($this->responseData($existing));
            return;
        }

        if ($this->userAuthTypeId === self::SCHOOL_ADMIN && is_array($existingRow)) {
            if ((int)$existingRow["active"] === 1) {
                $this->call(400, "bad_request", "Ja existe uma materia com esse nome nesta escola.", "error")->back();
                return;
            }
            $reactivated = new Subject(null, null, $name, 1);
            if (!$reactivated->updateById((int)$existingRow["id"])) {
                $this->call(500, "internal_server_error", "Nao foi possivel reativar a materia existente.", "error")->back();
                return;
            }
            $reactivated->selectById((int)$existingRow["id"]);
            $this->call(200, "success", "Materia reativada com sucesso.", "success")->back($this->responseData($reactivated));
            return;
        }

        $subject = new Subject(
            null,
            (int)$this->userAuthSchoolId,
            $name,
            $this->userAuthTypeId === self::SCHOOL_ADMIN && isset($data["active"])
                ? (int)$data["active"]
                : 1
        );

        if (!$subject->insert()) {
            $this->call(500, "internal_server_error", $subject->getErrorMessage(), "error")->back();
            return;
        }

        if ($this->userAuthTypeId === self::TEACHER && !$subject->assignTeacher((int)$subject->getId(), (int)$this->userAuthId)) {
            $subject->softDeleteById((int)$subject->getId());
            $this->call(500, "internal_server_error", "Nao foi possivel associar a nova materia ao professor.", "error")->back();
            return;
        }

        $subject->selectById((int)$subject->getId());
        $this->call(201, "success", "Disciplina inserida com sucesso", "created")->back($this->responseData($subject));
    }

    public function update(array $data): void
    {
        if (!$this->authToken([self::SCHOOL_ADMIN, self::TEACHER])) {
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

        if ($this->userAuthTypeId === self::TEACHER && isset($data["active"])) {
            $this->call(400, "bad_request", "O professor pode editar o nome, mas nao pode alterar o estado da materia.", "error")->back();
            return;
        }

        $duplicate = $existing->findByNameInSchool(trim($data["name"]), (int)$existing->getSchoolId(), (int)$existing->getId());
        if ($existing->getErrorMessage() !== null) {
            $this->call(500, "internal_server_error", "Nao foi possivel verificar o nome da materia.", "error")->back();
            return;
        }
        if (is_array($duplicate)) {
            $this->call(400, "bad_request", "Ja existe outra materia com esse nome nesta escola.", "error")->back();
            return;
        }

        $subject = new Subject(
            null,
            null,
            trim($data["name"]),
            $this->userAuthTypeId === self::SCHOOL_ADMIN && isset($data["active"])
                ? (int)$data["active"]
                : null
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
        if (!$this->authToken([self::SCHOOL_ADMIN, self::TEACHER])) {
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

        if ($this->userAuthTypeId === self::TEACHER) {
            if ($subject->hasAvailabilityForTeacher((int)$subject->getId(), (int)$this->userAuthId)) {
                $this->call(400, "bad_request", "Exclua primeiro os horarios ativos desta materia.", "error")->back();
                return;
            }
            if (!$subject->unassignTeacher((int)$subject->getId(), (int)$this->userAuthId)) {
                $this->call(500, "internal_server_error", "Nao foi possivel remover a materia do professor.", "error")->back();
                return;
            }
            $this->call(200, "success", "Materia removida do professor.", "success")->back();
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
        if ($this->userAuthTypeId === self::GLOBAL_ADMIN) {
            return true;
        }
        if ($this->userAuthSchoolId === null || $subject->getSchoolId() !== $this->userAuthSchoolId) {
            return false;
        }
        return $this->userAuthTypeId !== self::TEACHER
            || $subject->getActive() === 1 && (int)$this->userAuthId > 0
                && $subject->isAssignedToTeacher((int)$subject->getId(), (int)$this->userAuthId);
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
