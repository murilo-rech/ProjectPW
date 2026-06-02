<?php

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
date_default_timezone_set('America/Sao_Paulo');

ob_start();

require __DIR__ . "/vendor/autoload.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use CoffeeCode\Router\Router;

$route = new Router(url("api"), ":");

$route->namespace("Source\Controller");

$route->group("/products");
$route->get("/list/{product_id}", "Products:listById");
$route->get("/list", "Products:listAll");
$route->get("/list/paginator/{page}/{per_page}", "Products:listPaginator");
$route->post("/", "Products:insert");
$route->put("/{product_id}", "Products:update");
$route->delete("/{product_id}", "Products:delete");
$route->group(null);

$route->group("/categories-products");
$route->get("/list/{category_id}", "ProductCategories:listById");
$route->get("/list", "ProductCategories:listAll");
$route->post("/", "ProductCategories:insert");
$route->group(null);

$route->namespace("Source\Controller\Faqs");

$route->group("/faqs-categories");
$route->get("/list/{category_id}", "FaqsCategories:listById");
$route->get("/list", "FaqsCategories:listAll");
$route->post("/", "FaqsCategories:insert");
$route->put("/{category_id}", "FaqsCategories:update");
$route->delete("/{category_id}", "FaqsCategories:delete");
$route->group(null);

$route->group("/faqs");
$route->get("/list/{faq_id}", "Faqs:listById");
$route->get("/list", "Faqs:listAll");
$route->post("/", "Faqs:insert");
$route->put("/{faq_id}", "Faqs:update");
$route->delete("/{faq_id}", "Faqs:delete");
$route->group(null);

$route->dispatch();

if ($route->error()) {
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code(404);

    echo json_encode([
        "code" => 404,
        "type" => "error",
        "status" => "not_found",
        "message" => "URL não encontrada",
        "data" => null
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

ob_end_flush();
