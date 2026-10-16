<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Appointment;

class Appointments extends Api
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

        if (!$this->validateId($data, "appointment_id")) {
            $this->call(400, "bad_request", "ID do agendamento e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $appointment = new Appointment();
        if (!$appointment->selectById((int)$data["appointment_id"])) {
            $this->call(404, "not_found", "Agendamento nao encontrado", "error")->back();
            return;
        }

        if (!$this->canAccess((int)$data["appointment_id"], $appointment)) {
            $this->call(403, "forbidden", "Usuario sem permissao para acessar este agendamento.", "error")->back();
            return;
        }

        $this->call(200, "success", "Agendamento encontrado", "success")->back($this->responseData($appointment));
    }

    public function listAll(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $appointment = new Appointment();
        $this->call(200, "success", "Lista de Agendamentos", "success")->back(
            $appointment->selectAll($this->permissionFilters())
        );
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

        $appointment = new Appointment();
        $response = $appointment->selectPaginator(
            (int)$data["page"],
            (int)$data["per_page"],
            $this->permissionFilters(),
            "id",
            "ASC"
        );

        $this->call(200, "success", "Lista de Agendamentos com Paginacao", "success")->back($response);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(self::STUDENT)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->inputData($data);

        if (!$this->validate($data) || $this->userAuthSchoolId === null) {
            $this->call(400, "bad_request", "O campo availability_id e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $appointment = new Appointment();
        if (!$appointment->availabilityBelongsToSchool((int)$data["availability_id"], (int)$this->userAuthSchoolId)) {
            if ($appointment->getErrorMessage() !== null) {
                $this->call(500, "internal_server_error", $appointment->getErrorMessage(), "error")->back();
                return;
            }
            $this->call(404, "not_found", "Disponibilidade nao encontrada para a escola do aluno", "error")->back();
            return;
        }

        $appointment = new Appointment(
            null,
            (int)$data["availability_id"],
            (int)$this->userAuthId,
            isset($data["notes"]) ? trim($data["notes"]) : null,
            1
        );

        if (!$appointment->insert()) {
            $this->call(500, "internal_server_error", $appointment->getErrorMessage(), "error")->back();
            return;
        }

        $appointment->selectById((int)$appointment->getId());
        $this->call(201, "success", "Agendamento inserido com sucesso", "created")->back($this->responseData($appointment));
    }

    public function update(array $data): void
    {
        if (!$this->authToken(self::STUDENT)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->inputData($data);

        if (!$this->validateId($data, "appointment_id") || !$this->validate($data) || $this->userAuthSchoolId === null) {
            $this->call(400, "bad_request", "ID invalido ou campos obrigatorios ausentes", "error")->back();
            return;
        }

        $existing = new Appointment();
        if (!$existing->selectById((int)$data["appointment_id"])) {
            $this->call(404, "not_found", "Agendamento nao encontrado", "error")->back();
            return;
        }

        if ($existing->getStudentId() !== $this->userAuthId) {
            $this->call(403, "forbidden", "Usuario sem permissao para atualizar este agendamento.", "error")->back();
            return;
        }

        if (!$existing->availabilityBelongsToSchool((int)$data["availability_id"], (int)$this->userAuthSchoolId)) {
            if ($existing->getErrorMessage() !== null) {
                $this->call(500, "internal_server_error", $existing->getErrorMessage(), "error")->back();
                return;
            }
            $this->call(404, "not_found", "Disponibilidade nao encontrada para a escola do aluno", "error")->back();
            return;
        }

        $appointment = new Appointment(
            null,
            (int)$data["availability_id"],
            null,
            isset($data["notes"]) ? trim($data["notes"]) : null,
            null
        );

        if (!$appointment->updateById((int)$data["appointment_id"])) {
            $this->call(500, "internal_server_error", $appointment->getErrorMessage(), "error")->back();
            return;
        }

        $appointment->selectById((int)$data["appointment_id"]);
        $this->call(200, "success", "Agendamento atualizado com sucesso", "success")->back($this->responseData($appointment));
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(self::STUDENT)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        if (!$this->validateId($data, "appointment_id")) {
            $this->call(400, "bad_request", "ID do agendamento e obrigatorio e deve ser um numero inteiro", "error")->back();
            return;
        }

        $appointment = new Appointment();
        if (!$appointment->selectById((int)$data["appointment_id"])) {
            $this->call(404, "not_found", "Agendamento nao encontrado", "error")->back();
            return;
        }

        if ($appointment->getStudentId() !== $this->userAuthId) {
            $this->call(403, "forbidden", "Usuario sem permissao para excluir este agendamento.", "error")->back();
            return;
        }

        if (!$appointment->softDeleteById((int)$data["appointment_id"])) {
            $this->call(404, "not_found", "Agendamento nao encontrado", "error")->back();
            return;
        }

        $this->call(200, "success", "Agendamento excluido com sucesso", "success")->back();
    }

    private function validate(array $data): bool
    {
        return $this->validateId($data, "availability_id");
    }

    private function validateId(array $data, string $field): bool
    {
        return isset($data[$field])
            && filter_var($data[$field], FILTER_VALIDATE_INT) !== false
            && (int)$data[$field] > 0;
    }

    private function canAccess(int $appointmentId, Appointment $appointment): bool
    {
        if ($this->userAuthTypeId === self::GLOBAL_ADMIN) {
            return true;
        }

        if ($this->userAuthTypeId === self::STUDENT) {
            return $appointment->getStudentId() === $this->userAuthId;
        }

        $filters = array_merge(["id = {$appointmentId}"], $this->permissionFilters());
        return !empty($appointment->selectAll($filters));
    }

    private function permissionFilters(): array
    {
        if ($this->userAuthTypeId === self::GLOBAL_ADMIN) {
            return [];
        }

        if ($this->userAuthTypeId === self::SCHOOL_ADMIN) {
            $schoolId = (int)$this->userAuthSchoolId;
            return [
                "availability_id IN (SELECT availabilities.id FROM availabilities INNER JOIN subjects ON subjects.id = availabilities.subject_id WHERE subjects.school_id = {$schoolId})"
            ];
        }

        if ($this->userAuthTypeId === self::TEACHER) {
            return [
                "availability_id IN (SELECT id FROM availabilities WHERE teacher_id = " . (int)$this->userAuthId . ")"
            ];
        }

        return ["student_id = " . (int)$this->userAuthId];
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

    private function responseData(Appointment $appointment): array
    {
        return [
            "id" => $appointment->getId(),
            "availability_id" => $appointment->getAvailabilityId(),
            "student_id" => $appointment->getStudentId(),
            "notes" => $appointment->getNotes(),
            "active" => $appointment->getActive(),
            "created_at" => $appointment->getCreatedAt()
        ];
    }
}
