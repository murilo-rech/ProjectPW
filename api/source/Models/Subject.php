<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Subject extends Model
{
    private ?int $id;
    private ?int $schoolId;
    private ?string $name;
    private ?int $active;

    public function __construct(
        ?int $id = null,
        ?int $schoolId = null,
        ?string $name = null,
        ?int $active = null
    ) {
        $this->id = $id;
        $this->schoolId = $schoolId;
        $this->name = $name;
        $this->active = $active;

        $this->table = 'subjects';
        $this->primaryKey = 'id';
        $this->fillable = ['schoolId', 'name', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getSchoolId(): ?int
    {
        return $this->schoolId;
    }

    public function setSchoolId(?int $schoolId): void
    {
        $this->schoolId = $schoolId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(?int $active): void
    {
        $this->active = $active;
    }

    public function selectForTeacher(int $teacherId, int $schoolId): array|false
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'SELECT subjects.* FROM subjects
                 INNER JOIN teacher_subjects ON teacher_subjects.subject_id = subjects.id
                 WHERE teacher_subjects.teacher_id = :teacher_id AND subjects.school_id = :school_id
                   AND subjects.active = 1
                 ORDER BY subjects.name ASC'
            );
            $stmt->bindValue(':teacher_id', $teacherId, PDO::PARAM_INT);
            $stmt->bindValue(':school_id', $schoolId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            $this->errorMessage = 'Nao foi possivel consultar as materias do professor.';
            return false;
        }
    }

    public function findByNameInSchool(string $name, int $schoolId, ?int $excludeId = null): array|false
    {
        $query = 'SELECT * FROM subjects WHERE school_id = :school_id AND LOWER(TRIM(name)) = LOWER(TRIM(:name))';
        if ($excludeId !== null) {
            $query .= ' AND id <> :exclude_id';
        }
        $query .= ' ORDER BY active DESC, id ASC LIMIT 1';

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':school_id', $schoolId, PDO::PARAM_INT);
            $stmt->bindValue(':name', $name);
            if ($excludeId !== null) {
                $stmt->bindValue(':exclude_id', $excludeId, PDO::PARAM_INT);
            }
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
        } catch (PDOException $exception) {
            $this->errorMessage = 'Nao foi possivel verificar o nome da materia.';
            return false;
        }
    }

    public function isAssignedToTeacher(int $subjectId, int $teacherId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'SELECT id FROM teacher_subjects WHERE subject_id = :subject_id AND teacher_id = :teacher_id LIMIT 1'
            );
            $stmt->bindValue(':subject_id', $subjectId, PDO::PARAM_INT);
            $stmt->bindValue(':teacher_id', $teacherId, PDO::PARAM_INT);
            $stmt->execute();
            return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            $this->errorMessage = 'Nao foi possivel verificar a autorizacao da materia.';
            return false;
        }
    }

    public function assignTeacher(int $subjectId, int $teacherId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'INSERT IGNORE INTO teacher_subjects (teacher_id, subject_id) VALUES (:teacher_id, :subject_id)'
            );
            $stmt->bindValue(':teacher_id', $teacherId, PDO::PARAM_INT);
            $stmt->bindValue(':subject_id', $subjectId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $exception) {
            $this->errorMessage = 'Nao foi possivel associar a materia ao professor.';
            return false;
        }
    }

    public function unassignTeacher(int $subjectId, int $teacherId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'DELETE FROM teacher_subjects WHERE subject_id = :subject_id AND teacher_id = :teacher_id'
            );
            $stmt->bindValue(':subject_id', $subjectId, PDO::PARAM_INT);
            $stmt->bindValue(':teacher_id', $teacherId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->rowCount() > 0;
        } catch (PDOException $exception) {
            $this->errorMessage = 'Nao foi possivel remover a materia do professor.';
            return false;
        }
    }

    public function hasAvailabilityForTeacher(int $subjectId, int $teacherId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'SELECT id FROM availabilities WHERE subject_id = :subject_id AND teacher_id = :teacher_id AND active = 1 LIMIT 1'
            );
            $stmt->bindValue(':subject_id', $subjectId, PDO::PARAM_INT);
            $stmt->bindValue(':teacher_id', $teacherId, PDO::PARAM_INT);
            $stmt->execute();
            return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            $this->errorMessage = 'Nao foi possivel consultar os horarios da materia.';
            return true;
        }
    }
}
