<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Appointment extends Model
{
    private ?int $id;
    private ?int $availabilityId;
    private ?int $studentId;
    private ?string $notes;
    private ?int $active;
    private ?string $createdAt;
    private ?string $status = null;

    public function __construct(
        ?int $id = null,
        ?int $availabilityId = null,
        ?int $studentId = null,
        ?string $notes = null,
        ?int $active = null,
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->availabilityId = $availabilityId;
        $this->studentId = $studentId;
        $this->notes = $notes;
        $this->active = $active;
        $this->createdAt = $createdAt;

        $this->table = 'appointments';
        $this->primaryKey = 'id';
        $this->fillable = ['availabilityId', 'studentId', 'notes', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getAvailabilityId(): ?int
    {
        return $this->availabilityId;
    }

    public function setAvailabilityId(?int $availabilityId): void
    {
        $this->availabilityId = $availabilityId;
    }

    public function getStudentId(): ?int
    {
        return $this->studentId;
    }

    public function setStudentId(?int $studentId): void
    {
        $this->studentId = $studentId;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): void
    {
        $this->notes = $notes;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(?int $active): void
    {
        $this->active = $active;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?string $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?string $status): void
    {
        $this->status = $status;
    }

    public function detailsById(int $id): ?array
    {
        try {
            $query = "SELECT appointments.id, appointments.availability_id, appointments.student_id,
                             appointments.notes, appointments.active, appointments.status, appointments.created_at,
                             availabilities.modality, availabilities.weekday, availabilities.start_time,
                             availabilities.end_time, availabilities.location, availabilities.meeting_link,
                             subjects.name AS subject_name, teacher.name AS teacher_name, student.name AS student_name
                      FROM appointments
                      INNER JOIN availabilities ON availabilities.id = appointments.availability_id
                      INNER JOIN subjects ON subjects.id = availabilities.subject_id
                      INNER JOIN users AS teacher ON teacher.id = availabilities.teacher_id
                      INNER JOIN users AS student ON student.id = appointments.student_id
                      WHERE appointments.id = :id
                      LIMIT 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return null;
        }
    }

    public function updateStatusById(int $id, string $status): bool
    {
        if (!in_array($status, ['pending', 'approved', 'rejected', 'completed', 'cancelled'], true)) {
            $this->errorMessage = 'Status de agendamento invalido.';
            return false;
        }

        try {
            $stmt = Connect::getInstance()->prepare(
                "UPDATE {$this->table} SET status = :status WHERE {$this->primaryKey} = :id AND active = 1"
            );
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            if ($stmt->rowCount() !== 1) {
                $this->errorMessage = 'Agendamento nao encontrado ou sem alteracoes.';
                return false;
            }
            $this->status = $status;
            return true;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function availabilityBelongsToSchool(int $availabilityId, int $schoolId): bool
    {
        try {
            $query = "SELECT availabilities.id
                      FROM availabilities
                      INNER JOIN subjects ON subjects.id = availabilities.subject_id
                      INNER JOIN users ON users.id = availabilities.teacher_id
                      WHERE availabilities.id = :availability_id
                        AND availabilities.active = 1
                        AND subjects.active = 1
                        AND subjects.school_id = :school_id
                        AND users.school_id = :school_id
                        AND users.type_id = 3
                        AND users.active = 1
                      LIMIT 1";

            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':availability_id', $availabilityId, PDO::PARAM_INT);
            $stmt->bindValue(':school_id', $schoolId, PDO::PARAM_INT);
            $stmt->execute();

            return (bool)$stmt->fetch();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }
}
