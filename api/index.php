<?php

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
date_default_timezone_set('America/Sao_Paulo');

ob_start();

require  __DIR__ . "/vendor/autoload.php";

set_exception_handler(function (\Throwable $exception): void {
    error_log("Erro nao tratado na API: " . $exception->getMessage());

    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
    }

    echo json_encode([
        "code" => 500,
        "type" => "error",
        "status" => "internal_server_error",
        "message" => "Nao foi possivel processar a solicitacao."
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
});

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use CoffeeCode\Router\Router;

$route = new Router(url("api"),":");

$route->namespace("Source\Controller");

$route->group("/login");
$route->post("/","Users:auth");
$route->group(null);

$route->group("/auth");
$route->get("/{type_id}","Users:checkAuth");
$route->group(null);

$route->group("/users");
$route->post("/register","Users:register");
$route->post("/login","Users:auth");
$route->put("/update","Users:update");
$route->post("/register-admin","Users:registerAdmin");
$route->post("/login-admin","Users:authAdmin");
$route->put("/update-admin","Users:updateAdmin");
$route->group(null);

$route->group("/addresses");
$route->get("/list/{address_id}","Addresses:listById");
$route->get("/list","Addresses:listAll");
$route->get("/list/paginator/{page}/{per_page}","Addresses:listPaginator");
$route->post("/","Addresses:insert");
$route->put("/{address_id}","Addresses:update");
$route->delete("/{address_id}","Addresses:delete");
$route->group(null);

// Produtos
$route->group("/products");
$route->get("/list/{product_id}","Products:listById");
$route->get("/list","Products:listAll");
$route->get("/list/paginator/{page}/{per_page}","Products:listPaginator");
$route->post("/","Products:insert");
$route->put("/{product_id}","Products:update");
$route->delete("/{product_id}","Products:delete");
$route->group(null);

$route->group("/products-categories");
$route->group(null);

// FAQs
$route->group("/faqs");
$route->get("/active","Faqs:listActive");
$route->get("/list/{faq_id}","Faqs:listById");
$route->get("/list","Faqs:listAll");
$route->get("/list/paginator/{page}/{per_page}","Faqs:listPaginator");
$route->post("/","Faqs:insert");
$route->put("/{faq_id}","Faqs:update");
$route->put("/{faq_id}/status","Faqs:updateStatus");
$route->put("/{faq_id}/order","Faqs:updateOrder");
$route->delete("/{faq_id}","Faqs:delete");
$route->group(null);

$route->group("/faqs-categories");
$route->group(null);

// Plans
$route->group("/plans");
$route->get("/active","Plans:listActive");
$route->get("/list/{plan_id}","Plans:listById");
$route->get("/list","Plans:listAll");
$route->get("/list/paginator/{page}/{per_page}","Plans:listPaginator");
$route->post("/","Plans:insert");
$route->put("/{plan_id}","Plans:update");
$route->delete("/{plan_id}","Plans:delete");
$route->group(null);

// Schools
$route->group("/schools");
$route->get("/mine","Schools:listMine");
$route->get("/list/{school_id}","Schools:listById");
$route->get("/list","Schools:listAll");
$route->get("/list/paginator/{page}/{per_page}","Schools:listPaginator");
$route->post("/","Schools:insert");
$route->put("/{school_id}","Schools:update");
$route->delete("/{school_id}","Schools:delete");
$route->group(null);

// Subjects
$route->group("/subjects");
$route->get("/list/{subject_id}","Subjects:listById");
$route->get("/list","Subjects:listAll");
$route->get("/list/paginator/{page}/{per_page}","Subjects:listPaginator");
$route->post("/","Subjects:insert");
$route->put("/{subject_id}","Subjects:update");
$route->delete("/{subject_id}","Subjects:delete");
$route->group(null);

// Appointments
$route->group("/appointments");
$route->get("/list/{appointment_id}","Appointments:listById");
$route->get("/list","Appointments:listAll");
$route->get("/list/paginator/{page}/{per_page}","Appointments:listPaginator");
$route->post("/","Appointments:insert");
$route->put("/{appointment_id}","Appointments:update");
$route->delete("/{appointment_id}","Appointments:delete");
$route->group(null);

$route->dispatch();

/** ERROR REDIRECT */
if ($route->error()) {
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code(404);

    echo json_encode([
        "code" => 404,
        "status" => "not_found",
        "message" => "URL nao encontrada"
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

}

ob_end_flush();
