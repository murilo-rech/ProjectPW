<?php

require __DIR__ . "/vendor/autoload.php";

use CoffeeCode\Router\Router;
use Source\Models\User;

ob_start();

$route = new Router(url(), ":");

$route->namespace("Source\Web");

// Rotas da área individual, uma para cada cliente do SaaS
// var_dump($_GET["route"]);
$linkRaw = $_GET['route'] ?? '';
if (preg_match('~^/?([^/]+)~', $linkRaw, $m)) {
    $link = $m[1]; // ex.: "loja-fabio", "loja-maria", "loja-joao"
} else {
    $link = '';
}
//var_dump($link);
$user = new User();
if($user->findLink($link)){
    $route->group("/{$link}");
    $route->get("/", "Customer:home");
    $route->get("/catalogo", "Customer:catalog");
    // Demais rotas
    // $route->get("/carrinho-compras", "Customer:cart");
    $route->group(null);
}

// Rotas amigáveis da área pública
$route->get("/", "Site:home");
$route->get("/sobre", "Site:about");
$route->get("/contato", "Site:contact");
$route->get("/localizacao", "Site:location");
$route->get("/carrinho-compras","Site:cart");
$route->get("/servicos","Site:services");
$route->get("/faqs","Site:faqs");
$route->get("/login","Site:login");
$route->get("/cadastro","Site:register");
$route->get("/js-poo","Site:jsPoo");

// Rotas amigáveis da área restrita
$route->group("/app");
$route->get("/", "App:home");
$route->get("/perfil", "App:profile");
$route->group(null);

$route->group("/admin");
$route->get("/", "Admin:home");
$route->group(null);

$route->get("/ops/{errcode}", "Site:error");

$route->group(null);

$route->dispatch();

if ($route->error()) {
    $route->redirect("/ops/{$route->error()}");
}

ob_end_flush();