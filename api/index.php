<?php

ob_start();

require  __DIR__ . "/../vendor/autoload.php";

// os headers abaixo são necessários para permitir o acesso a API por clientes externos ao domínio
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Access-Control-Allow-Credentials: true'); // Permitir credenciais

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use CoffeeCode\Router\Router;

$route = new Router(url("api"),":");

$route->namespace("Source\WebService");

/* USERS */

$route->group("/users");

$route->get("/teste-model", "Users:testModel");
$route->get("/login", "Users:login");
$route->post("/add", "Users:createUser");
$route->post("/photo", "Users:updatePhoto");
$route->post("/file", "Users:updateFile");;

//http://localhost:8080/acme-tarde/api/users/
$route->get("/", "Users:listUsers");
//http://localhost:8080/acme-tarde/api/users/id/2
$route->get("/id/{id}", "Users:listUserById");
$route->get("/id/", "Users:listUserById");
//http://localhost:8080/acme-tarde/api/users/add

$route->put("/update", "Users:updateUser");
//http://localhost:8080/acme-tarde/api/users/delete/id/38
$route->delete("/delete/id/{id}", "Users:deleteUser");

$route->group("null");

$route->dispatch();

/** ERROR REDIRECT */
if ($route->error()) {
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code(404);

    echo json_encode([
        "code" => 404,
        "status" => "not_found",
        "message" => "URL não encontrada"
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

}

ob_end_flush();