<?php

namespace Source\Models;

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
}
