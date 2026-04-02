<?php

namespace Source\Web;

class Admin extends Controller
{
    public function __construct()
    {
        parent::__construct("admin");
    }

    public function home(): void
    {
        echo $this->view->render("home", []);
    }

}