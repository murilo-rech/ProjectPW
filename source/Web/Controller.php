<?php

namespace Source\Web;

use League\Plates\Engine;

class Controller
{
    protected $view;

    public function __construct(string $pathToView)
    {
        $this->view = new Engine(__DIR__ . "/../../views/{$pathToView}", "php");
    }
}