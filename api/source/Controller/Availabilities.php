<?php

namespace Source\Controller;

use Source\Models\Availability;

class Availabilities extends Api
{
    private const GLOBAL_ADMIN = 1;
    private const SCHOOL_ADMIN = 2;
    private const TEACHER = 3;
    private const STUDENT = 4;

    public function listAll(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }
        $availability = new Availability();
        $rows = $availability->selectForScope(
            (int)$this->userAuthTypeId,
            (int)$this->userAuthId,
            $this->userAuthSchoolId
        );
        if ($rows === false) {
            $this->call(500, "internal_server_error", "Nao foi possivel consultar as disponibilidades.", "error")->back();
            return;
        }
        $this->call(200, "success", "Lista de disponibilidades", "success")->back($rows);
    }

    public function listForBooking(array $data): void
    {
        if (!$this->authToken(self::STUDENT)) {
            $this->call(401, "unauthorized", "Somente alunos autenticados podem consultar os horarios para agendar.", "error")->back();
            return;
        }
        $availability = new Availability();
        $rows = $availability->selectForScope(
            self::STUDENT,
            (int)$this->userAuthId,
            $this->userAuthSchoolId,
            true
        );
        if ($rows === false) {
            $this->call(500, "internal_server_error", "Nao foi possivel consultar os horarios disponiveis.", "error")->back();
            return;
        }
        $this->call(200, "success", "Horarios disponiveis para agendamento", "success")->back($rows);
    }

    public function listById(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }
        if (!$this->validateId($data, "availability_id")) {
            $this->call(400, "bad_request", "ID da disponibilidade invalido.", "error")->back();
            return;
        }
        $availability = new Availability();
        if (!$availability->selectById((int)$data["availability_id"])) {
            $this->call(404, "not_found", "Disponibilidade nao encontrada.", "error")->back();
            return;
        }
        if (!$this->canAccess($availability)) {
            $this->call(403, "forbidden", "Usuario sem permissao para acessar esta disponibilidade.", "error")->back();
            return;
        }
        $this->call(200, "success", "Disponibilidade encontrada", "success")->back($this->responseData($availability));
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(self::TEACHER)) {
            $this->call(401, "unauthorized", "Somente professores autenticados podem cadastrar horarios.", "error")->back();
            return;
        }
        $data = $this->inputData($data);
        if (!$this->validatePayload($data) || $this->userAuthSchoolId === null) {
            $this->call(400, "bad_request", "Confira disciplina, dia, horario, vagas e modalidade.", "error")->back();
            return;
        }

        $availability = new Availability();
        if (!$availability->subjectBelongsToTeacher((int)$data["subject_id"], (int)$this->userAuthId, (int)$this->userAuthSchoolId)) {
            $this->call(403, "forbidden", "A disciplina nao esta associada ao professor nesta escola.", "error")->back();
            return;
        }

        $availability = $this->makeAvailability($data);
        if (!$availability->insert()) {
            error_log("Falha ao cadastrar disponibilidade: " . ($availability->getErrorMessage() ?? "erro desconhecido"));
            $this->call(500, "internal_server_error", "Nao foi possivel cadastrar o horario.", "error")->back();
            return;
        }
        $availability->selectById((int)$availability->getId());
        $this->call(201, "success", "Horario cadastrado com sucesso.", "created")->back($this->responseData($availability));
    }

    public function update(array $data): void
    {
        if (!$this->authToken(self::TEACHER)) {
            $this->call(401, "unauthorized", "Somente professores autenticados podem editar horarios.", "error")->back();
            return;
        }
        $data = $this->inputData($data);
        if (!$this->validateId($data, "availability_id") || !$this->validatePayload($data)) {
            $this->call(400, "bad_request", "ID ou dados da disponibilidade invalidos.", "error")->back();
            return;
        }

        $existing = new Availability();
        if (!$existing->selectById((int)$data["availability_id"])) {
            $this->call(404, "not_found", "Disponibilidade nao encontrada.", "error")->back();
            return;
        }
        if ($existing->getTeacherId() !== $this->userAuthId) {
            $this->call(403, "forbidden", "O professor so pode alterar os proprios horarios.", "error")->back();
            return;
        }
        $candidate = new Availability();
        $subjectIsAuthorized = (int)$data["subject_id"] === (int)$existing->getSubjectId()
            ? $candidate->subjectBelongsToSchool((int)$data["subject_id"], (int)$this->userAuthSchoolId)
            : $candidate->subjectBelongsToTeacher((int)$data["subject_id"], (int)$this->userAuthId, (int)$this->userAuthSchoolId);
        if (!$subjectIsAuthorized) {
            $this->call(403, "forbidden", "A disciplina nao esta associada ao professor nesta escola.", "error")->back();
            return;
        }

        $availability = $this->makeAvailability($data);
        if (!$availability->updateById((int)$data["availability_id"])) {
            $this->call(500, "internal_server_error", "Nao foi possivel atualizar o horario.", "error")->back();
            return;
        }
        $availability->selectById((int)$data["availability_id"]);
        $this->call(200, "success", "Horario atualizado com sucesso.", "success")->back($this->responseData($availability));
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(self::TEACHER)) {
            $this->call(401, "unauthorized", "Somente professores autenticados podem excluir horarios.", "error")->back();
            return;
        }
        if (!$this->validateId($data, "availability_id")) {
            $this->call(400, "bad_request", "ID da disponibilidade invalido.", "error")->back();
            return;
        }
        $availability = new Availability();
        if (!$availability->selectById((int)$data["availability_id"])) {
            $this->call(404, "not_found", "Disponibilidade nao encontrada.", "error")->back();
            return;
        }
        if ($availability->getTeacherId() !== $this->userAuthId) {
            $this->call(403, "forbidden", "O professor so pode excluir os proprios horarios.", "error")->back();
            return;
        }
        if (!$availability->softDeleteById((int)$data["availability_id"])) {
            $this->call(500, "internal_server_error", "Nao foi possivel excluir o horario.", "error")->back();
            return;
        }
        $this->call(200, "success", "Horario excluido.", "success")->back();
    }

    private function makeAvailability(array $data): Availability
    {
        $modality = (int)$data["modality"];
        $online = $modality === 1;
        return new Availability(
            null,
            (int)$this->userAuthId,
            (int)$data["subject_id"],
            $modality,
            (int)$data["weekday"],
            $data["start_time"],
            $data["end_time"],
            (int)$data["max_students"],
            $online ? null : trim($data["location"]),
            $online ? trim($data["meeting_link"]) : null,
            1
        );
    }

    private function validatePayload(array $data): bool
    {
        if (!$this->validateId($data, "subject_id")
            || !isset($data["modality"], $data["weekday"], $data["start_time"], $data["end_time"], $data["max_students"])) {
            return false;
        }
        if (!in_array((int)$data["modality"], [1, 2], true)
            || !in_array((int)$data["weekday"], [1, 2, 3, 4, 5, 6, 7], true)
            || filter_var($data["max_students"], FILTER_VALIDATE_INT) === false
            || (int)$data["max_students"] < 1 || (int)$data["max_students"] > 20) {
            return false;
        }
        if (!preg_match('/\A(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?\z/', (string)$data["start_time"])
            || !preg_match('/\A(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?\z/', (string)$data["end_time"])
            || strtotime((string)$data["start_time"]) >= strtotime((string)$data["end_time"])) {
            return false;
        }
        if ((int)$data["modality"] === 1) {
            return isset($data["meeting_link"])
                && filter_var($data["meeting_link"], FILTER_VALIDATE_URL)
                && in_array(strtolower((string)parse_url($data["meeting_link"], PHP_URL_SCHEME)), ["http", "https"], true);
        }
        return isset($data["location"]) && trim((string)$data["location"]) !== "" && strlen($data["location"]) <= 150;
    }

    private function canAccess(Availability $availability): bool
    {
        if ($this->userAuthTypeId === self::GLOBAL_ADMIN) {
            return true;
        }
        if ($this->userAuthTypeId === self::TEACHER) {
            return $availability->getTeacherId() === $this->userAuthId;
        }
        $details = $availability->detailsById((int)$availability->getId());
        return is_array($details) && $this->userAuthSchoolId !== null
            && (int)$details["school_id"] === $this->userAuthSchoolId;
    }

    private function responseData(Availability $availability): array
    {
        $details = $availability->detailsById((int)$availability->getId());
        if ($details === false) {
            return [];
        }
        return $details;
    }

    private function validateId(array $data, string $field): bool
    {
        return isset($data[$field])
            && filter_var($data[$field], FILTER_VALIDATE_INT) !== false
            && (int)$data[$field] > 0;
    }

    private function inputData(array $data): array
    {
        $json = json_decode(file_get_contents("php://input"), true);
        if (is_array($json)) {
            $routeData = isset($data["availability_id"]) ? ["availability_id" => $data["availability_id"]] : [];
            return array_merge($json, $routeData);
        }
        return $data;
    }
}
