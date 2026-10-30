<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Appointment;
use Source\Models\AppointmentImage;
use Source\Support\ImageStorage;

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
        $rows = $appointment->selectAll($this->permissionFilters());
        $this->call(200, "success", "Lista de Agendamentos", "success")->back($this->formatRows($rows));
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

        if (isset($response["data"]) && is_array($response["data"])) {
            $response["data"] = $this->formatRows($response["data"]);
        }

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

        if (!$appointment->updateStatusById((int)$data["appointment_id"], "cancelled")
            || !$appointment->softDeleteById((int)$data["appointment_id"])) {
            $this->call(404, "not_found", "Agendamento nao encontrado", "error")->back();
            return;
        }

        $this->call(200, "success", "Agendamento excluido com sucesso", "success")->back();
    }

    public function updateStatus(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }

        $data = $this->inputData($data);
        if (!$this->validateId($data, "appointment_id")
            || !isset($data["status"])
            || !in_array($data["status"], ["approved", "rejected", "completed"], true)) {
            $this->call(400, "bad_request", "Informe um status valido para o agendamento.", "error")->back();
            return;
        }

        $appointment = new Appointment();
        if (!$appointment->selectById((int)$data["appointment_id"])) {
            $this->call(404, "not_found", "Agendamento nao encontrado.", "error")->back();
            return;
        }
        if (!$this->canAccess((int)$data["appointment_id"], $appointment)) {
            $this->call(403, "forbidden", "Usuario sem permissao para atualizar este agendamento.", "error")->back();
            return;
        }

        $currentStatus = $appointment->getStatus() ?? "pending";
        $validTransition = ($currentStatus === "pending" && in_array($data["status"], ["approved", "rejected"], true))
            || ($currentStatus === "approved" && $data["status"] === "completed");
        if (!$validTransition) {
            $this->call(400, "bad_request", "O status atual nao permite essa transicao.", "error")->back();
            return;
        }

        if (!$appointment->updateStatusById((int)$data["appointment_id"], $data["status"])) {
            $this->call(500, "internal_server_error", "Nao foi possivel atualizar o status do agendamento.", "error")->back();
            return;
        }

        $appointment->selectById((int)$data["appointment_id"]);
        $this->call(200, "success", "Status do agendamento atualizado.", "success")->back($this->responseData($appointment));
    }

    public function uploadImages(array $data): void
    {
        if (!$this->authToken(self::STUDENT)) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }
        if (!$this->validateId($data, "appointment_id")) {
            $this->call(400, "bad_request", "ID do agendamento invalido.", "error")->back();
            return;
        }

        $appointment = new Appointment();
        if (!$appointment->selectById((int)$data["appointment_id"])) {
            $this->call(404, "not_found", "Agendamento nao encontrado.", "error")->back();
            return;
        }
        if ($appointment->getStudentId() !== $this->userAuthId || $appointment->getActive() !== 1) {
            $this->call(403, "forbidden", "Somente o autor do agendamento ativo pode enviar imagens.", "error")->back();
            return;
        }

        $files = $this->normalizeImageFiles($_FILES["images"] ?? null);
        if ($files === false || count($files) === 0 || count($files) > 20) {
            $this->call(400, "bad_request", "Selecione de 1 a 20 imagens por envio.", "error")->back();
            return;
        }

        $storage = new ImageStorage();
        $images = new AppointmentImage();
        $created = [];
        foreach ($files as $file) {
            try {
                $stored = $storage->store($file);
            } catch (\Throwable $exception) {
                $this->rollbackImages($created, $images, $storage);
                $this->call(400, "bad_request", $exception->getMessage(), "error")->back();
                return;
            }

            $imageId = $images->insert((int)$data["appointment_id"], $stored["filename"], $stored["mime_type"]);
            if ($imageId === false) {
                $storage->delete($stored["filename"]);
                $this->rollbackImages($created, $images, $storage);
                error_log("Falha ao associar imagem ao agendamento: " . ($images->getErrorMessage() ?? "erro desconhecido"));
                $this->call(500, "internal_server_error", "Nao foi possivel associar as imagens ao agendamento.", "error")->back();
                return;
            }
            $created[] = ["id" => $imageId, "filename" => $stored["filename"]];
        }

        $this->call(201, "success", "Imagens associadas ao agendamento.", "created")->back(
            $this->imageResponse((int)$data["appointment_id"], $images)
        );
    }

    public function listImages(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }
        if (!$this->validateId($data, "appointment_id")) {
            $this->call(400, "bad_request", "ID do agendamento invalido.", "error")->back();
            return;
        }

        $appointment = new Appointment();
        if (!$appointment->selectById((int)$data["appointment_id"])) {
            $this->call(404, "not_found", "Agendamento nao encontrado.", "error")->back();
            return;
        }
        if (!$this->canAccess((int)$data["appointment_id"], $appointment)) {
            $this->call(403, "forbidden", "Usuario sem permissao para consultar as imagens.", "error")->back();
            return;
        }

        $this->call(200, "success", "Imagens do agendamento", "success")->back(
            $this->imageResponse((int)$data["appointment_id"], new AppointmentImage())
        );
    }

    public function showImage(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }
        if (!$this->validateId($data, "image_id")) {
            $this->call(400, "bad_request", "ID da imagem invalido.", "error")->back();
            return;
        }

        $imageModel = new AppointmentImage();
        $image = $imageModel->findById((int)$data["image_id"]);
        if ($image === false) {
            $this->call(404, "not_found", "Imagem nao encontrada.", "error")->back();
            return;
        }

        $appointment = new Appointment();
        if (!$appointment->selectById((int)$image["appointment_id"])) {
            $this->call(404, "not_found", "Agendamento nao encontrado.", "error")->back();
            return;
        }
        if (!$this->canAccess((int)$image["appointment_id"], $appointment)) {
            $this->call(403, "forbidden", "Usuario sem permissao para acessar esta imagem.", "error")->back();
            return;
        }

        $this->streamImage($image);
    }

    public function deleteImage(array $data): void
    {
        if (!$this->authToken([self::GLOBAL_ADMIN, self::SCHOOL_ADMIN, self::TEACHER, self::STUDENT])) {
            $this->call(401, "unauthorized", "Usuario nao esta autenticado ou nao possui permissao.", "error")->back();
            return;
        }
        if (!$this->validateId($data, "image_id")) {
            $this->call(400, "bad_request", "ID da imagem invalido.", "error")->back();
            return;
        }

        $images = new AppointmentImage();
        $image = $images->findById((int)$data["image_id"]);
        if ($image === false) {
            $this->call(404, "not_found", "Imagem nao encontrada.", "error")->back();
            return;
        }
        $appointment = new Appointment();
        if (!$appointment->selectById((int)$image["appointment_id"])) {
            $this->call(404, "not_found", "Agendamento nao encontrado.", "error")->back();
            return;
        }
        if (!$this->canAccess((int)$image["appointment_id"], $appointment)) {
            $this->call(403, "forbidden", "Usuario sem permissao para excluir esta imagem.", "error")->back();
            return;
        }
        if ($this->userAuthTypeId !== self::GLOBAL_ADMIN
            && ($this->userAuthTypeId !== self::STUDENT || $appointment->getStudentId() !== $this->userAuthId)) {
            $this->call(403, "forbidden", "Somente o aluno autor do agendamento pode excluir as imagens.", "error")->back();
            return;
        }

        $deleted = $images->deleteById((int)$data["image_id"]);
        if ($deleted === false) {
            $this->call(500, "internal_server_error", "Nao foi possivel excluir a imagem.", "error")->back();
            return;
        }
        (new ImageStorage())->delete($deleted["stored_name"]);
        $this->call(200, "success", "Imagem excluida.", "success")->back();
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
        $filters = ["active = 1"];

        if ($this->userAuthTypeId === self::GLOBAL_ADMIN) {
            return $filters;
        }

        if ($this->userAuthTypeId === self::SCHOOL_ADMIN) {
            $schoolId = (int)$this->userAuthSchoolId;
            return array_merge($filters, [
                "availability_id IN (SELECT availabilities.id FROM availabilities INNER JOIN subjects ON subjects.id = availabilities.subject_id WHERE subjects.school_id = {$schoolId})"
            ]);
        }

        if ($this->userAuthTypeId === self::TEACHER) {
            return array_merge($filters, [
                "availability_id IN (SELECT id FROM availabilities WHERE teacher_id = " . (int)$this->userAuthId . ")"
            ]);
        }

        return array_merge($filters, ["student_id = " . (int)$this->userAuthId]);
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
        $details = $appointment->detailsById((int)$appointment->getId()) ?? [];
        return array_merge($details, [
            "id" => $appointment->getId(),
            "availability_id" => $appointment->getAvailabilityId(),
            "student_id" => $appointment->getStudentId(),
            "notes" => $appointment->getNotes(),
            "active" => $appointment->getActive(),
            "status" => $appointment->getStatus() ?? ($details["status"] ?? "pending"),
            "created_at" => $appointment->getCreatedAt() ?? ($details["created_at"] ?? null),
            "images" => $this->imageResponse((int)$appointment->getId(), new AppointmentImage())
        ]);
    }

    private function formatRows(array $rows): array
    {
        $formatted = [];
        foreach ($rows as $row) {
            $id = is_object($row) ? ($row->id ?? null) : ($row["id"] ?? null);
            if (!is_numeric($id) || (int)$id < 1) {
                continue;
            }
            $appointment = new Appointment();
            if ($appointment->selectById((int)$id)) {
                $formatted[] = $this->responseData($appointment);
            }
        }
        return $formatted;
    }

    private function imageResponse(int $appointmentId, AppointmentImage $images): array
    {
        $rows = $images->listByAppointmentId($appointmentId);
        if ($rows === false) {
            return [];
        }

        return array_map(static fn(array $image): array => [
            "id" => (int)$image["id"],
            "mime_type" => $image["mime_type"],
            "created_at" => $image["created_at"],
            "url" => "/appointments/images/" . (int)$image["id"]
        ], $rows);
    }

    private function normalizeImageFiles(mixed $files): array|false
    {
        if (!is_array($files) || !isset($files["name"], $files["tmp_name"], $files["error"], $files["size"])) {
            return false;
        }
        if (!is_array($files["name"])) {
            return [$files];
        }

        $normalized = [];
        foreach (array_keys($files["name"]) as $index) {
            $normalized[] = [
                "name" => $files["name"][$index] ?? "",
                "type" => $files["type"][$index] ?? "",
                "tmp_name" => $files["tmp_name"][$index] ?? "",
                "error" => $files["error"][$index] ?? UPLOAD_ERR_NO_FILE,
                "size" => $files["size"][$index] ?? 0
            ];
        }
        return $normalized;
    }

    private function rollbackImages(array $created, AppointmentImage $images, ImageStorage $storage): void
    {
        foreach ($created as $image) {
            $images->deleteById((int)$image["id"]);
            $storage->delete($image["filename"]);
        }
    }

    private function streamImage(array $image): void
    {
        $path = (new ImageStorage())->pathFor((string)$image["stored_name"]);
        if ($path === null) {
            $this->call(404, "not_found", "Imagem nao encontrada.", "error")->back();
            return;
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($path);
        if ($mime !== $image["mime_type"] || !in_array($mime, ["image/jpeg", "image/png", "image/gif", "image/webp"], true)) {
            $this->call(404, "not_found", "Imagem nao encontrada.", "error")->back();
            return;
        }

        header("Content-Type: {$mime}");
        header("Content-Length: " . filesize($path));
        header('Content-Disposition: inline; filename="appointment-image"');
        header("Cache-Control: private, no-store");
        header("X-Content-Type-Options: nosniff");
        readfile($path);
    }
}
