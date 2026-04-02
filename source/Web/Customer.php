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
        var_dump($_SESSION["customer"]);
    }

    public function catalog(): void
    {

        // busca no BD pelos produtos do cliente logado
        // $_SESSION["customer"]
        var_dump($_SESSION["customer"], $_SESSION["customer"]["id"]);
        $products = [
            ["name" => "Produto 1", "price" => 100],
            ["name" => "Produto 2", "price" => 200],
        ];
        echo  $this->view->render("customer-catalog",[
            "products" => $products
        ]);
    }
}