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
