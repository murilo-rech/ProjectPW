<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Availability extends Model
{
    private ?int $id = null;
    private ?int $teacherId = null;
    private ?int $subjectId = null;
    private ?int $modality = null;
    private ?int $weekday = null;
    private ?string $startTime = null;
    private ?string $endTime = null;
    private ?int $maxStudents = null;
    private ?string $location = null;
    private ?string $meetingLink = null;
    private ?int $active = null;

    public function __construct(
        ?int $id = null,
        ?int $teacherId = null,
        ?int $subjectId = null,
        ?int $modality = null,
        ?int $weekday = null,
        ?string $startTime = null,
        ?string $endTime = null,
        ?int $maxStudents = null,
        ?string $location = null,
        ?string $meetingLink = null,
        ?int $active = null
    ) {
        $this->id = $id;
        $this->teacherId = $teacherId;
        $this->subjectId = $subjectId;
        $this->modality = $modality;
        $this->weekday = $weekday;
        $this->startTime = $startTime;
        $this->endTime = $endTime;
        $this->maxStudents = $maxStudents;
        $this->location = $location;
        $this->meetingLink = $meetingLink;
        $this->active = $active;
        $this->table = 'availabilities';
        $this->primaryKey = 'id';
        $this->fillable = [
            'teacherId', 'subjectId', 'modality', 'weekday', 'startTime',
            'endTime', 'maxStudents', 'location', 'meetingLink', 'active'
        ];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(?int $value): void { $this->id = $value; }
    public function getTeacherId(): ?int { return $this->teacherId; }
    public function setTeacherId(?int $value): void { $this->teacherId = $value; }
    public function getSubjectId(): ?int { return $this->subjectId; }
    public function setSubjectId(?int $value): void { $this->subjectId = $value; }
    public function getModality(): ?int { return $this->modality; }
    public function setModality(?int $value): void { $this->modality = $value; }
    public function getWeekday(): ?int { return $this->weekday; }
    public function setWeekday(?int $value): void { $this->weekday = $value; }
    public function getStartTime(): ?string { return $this->startTime; }
    public function setStartTime(?string $value): void { $this->startTime = $value; }
    public function getEndTime(): ?string { return $this->endTime; }
    public function setEndTime(?string $value): void { $this->endTime = $value; }
    public function getMaxStudents(): ?int { return $this->maxStudents; }
    public function setMaxStudents(?int $value): void { $this->maxStudents = $value; }
    public function getLocation(): ?string { return $this->location; }
    public function setLocation(?string $value): void { $this->location = $value; }
    public function getMeetingLink(): ?string { return $this->meetingLink; }
    public function setMeetingLink(?string $value): void { $this->meetingLink = $value; }
    public function getActive(): ?int { return $this->active; }
    public function setActive(?int $value): void { $this->active = $value; }

    public function subjectBelongsToSchool(int $subjectId, int $schoolId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'SELECT id FROM subjects WHERE id = :subject_id AND school_id = :school_id AND active = 1 LIMIT 1'
            );
            $stmt->bindValue(':subject_id', $subjectId, PDO::PARAM_INT);
            $stmt->bindValue(':school_id', $schoolId, PDO::PARAM_INT);
            $stmt->execute();
            return (bool)$stmt->fetch();
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function subjectBelongsToTeacher(int $subjectId, int $teacherId, int $schoolId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'SELECT subjects.id FROM subjects
                 INNER JOIN teacher_subjects ON teacher_subjects.subject_id = subjects.id
                 WHERE subjects.id = :subject_id AND subjects.school_id = :school_id
                   AND subjects.active = 1 AND teacher_subjects.teacher_id = :teacher_id
                 LIMIT 1'
            );
            $stmt->bindValue(':subject_id', $subjectId, PDO::PARAM_INT);
            $stmt->bindValue(':school_id', $schoolId, PDO::PARAM_INT);
            $stmt->bindValue(':teacher_id', $teacherId, PDO::PARAM_INT);
            $stmt->execute();
            return (bool)$stmt->fetch();
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function selectForScope(int $typeId, int $userId, ?int $schoolId, bool $bookingOnly = false): array|false
    {
        $where = ['availabilities.active = 1', 'subjects.active = 1', 'teacher.active = 1'];
        $params = [];

        if ($typeId === 2 && $schoolId !== null) {
            $where[] = 'subjects.school_id = :school_id';
            $params[':school_id'] = $schoolId;
        } elseif ($typeId === 3) {
            $where[] = 'availabilities.teacher_id = :user_id';
            $params[':user_id'] = $userId;
        } elseif ($typeId === 4) {
            if ($schoolId === null) {
                return [];
            }
            $where[] = 'subjects.school_id = :school_id';
            $params[':school_id'] = $schoolId;
        }

        if ($bookingOnly) {
            $where[] = 'availabilities.max_students > (SELECT COUNT(*) FROM appointments WHERE appointments.availability_id = availabilities.id AND appointments.active = 1 AND appointments.status NOT IN (\'rejected\', \'cancelled\'))';
        }

        try {
            $query = 'SELECT availabilities.*, subjects.name AS subject_name, teacher.name AS teacher_name,
                             (SELECT COUNT(*) FROM appointments WHERE appointments.availability_id = availabilities.id AND appointments.active = 1 AND appointments.status NOT IN (\'rejected\', \'cancelled\')) AS booked_students
                      FROM availabilities
                      INNER JOIN subjects ON subjects.id = availabilities.subject_id
                      INNER JOIN users AS teacher ON teacher.id = availabilities.teacher_id
                      WHERE ' . implode(' AND ', $where) . '
                      ORDER BY availabilities.weekday ASC, availabilities.start_time ASC';
            $stmt = Connect::getInstance()->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value, PDO::PARAM_INT);
            }
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function detailsById(int $id): array|false
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'SELECT availabilities.*, subjects.name AS subject_name, subjects.school_id AS school_id, teacher.name AS teacher_name
                 FROM availabilities
                 INNER JOIN subjects ON subjects.id = availabilities.subject_id
                 INNER JOIN users AS teacher ON teacher.id = availabilities.teacher_id
                 WHERE availabilities.id = :id LIMIT 1'
            );
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }
}
