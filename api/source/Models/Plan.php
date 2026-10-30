<?php

namespace Source\Models;

use Source\Core\Model;

class Plan extends Model
{
    private ?int $id;
    private ?string $name;
    private ?string $description;
    private ?float $price;
    private ?int $maxStudents;
    private ?int $maxTeachers;
    private ?int $active;

    public function __construct(
        ?int $id = null,
        ?string $name = null,
        ?string $description = null,
        ?float $price = null,
        ?int $maxStudents = null,
        ?int $maxTeachers = null,
        ?int $active = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->maxStudents = $maxStudents;
        $this->maxTeachers = $maxTeachers;
        $this->active = $active;

        $this->table = 'plans';
        $this->primaryKey = 'id';
        $this->fillable = ['name', 'description', 'price', 'maxStudents', 'maxTeachers', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(?float $price): void
    {
        $this->price = $price;
    }

    public function getMaxStudents(): ?int
    {
        return $this->maxStudents;
    }

    public function setMaxStudents(?int $maxStudents): void
    {
        $this->maxStudents = $maxStudents;
    }

    public function getMaxTeachers(): ?int
    {
        return $this->maxTeachers;
    }

    public function setMaxTeachers(?int $maxTeachers): void
    {
        $this->maxTeachers = $maxTeachers;
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
