<?php

namespace Source\Web;

class Customer extends Controller
{
    public function __construct()
    {
        parent::__construct("web");
    }

    public function home(): void
    {
        echo $this->view->render("customer-home",[]);
    }

    public function catalog(): void
    {
        echo    $this->view->render("customer-catalog",[]);
    }
}