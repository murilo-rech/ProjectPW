## Criação de Rotas

## No script `index.php` (na raíz do projeto)

```PHP
$route->get("/", "Site:home");
$route->get("/sobre", "Site:about");
$route->get("/contato", "Site:contact");

// Criar os grupos de rotas, para área de app e área de admin
// Rotas amigáveis da área restrita do app
$route->group("/app");
$route->get("/", "App:home");
$route->get("/perfil", "App:profile");
$route->group(null);
// Rotas da área restrita do admin
$route->group("/admin");
$route->get("/", "Admin:home");
$route->get("/usuarios", "Admin:users");
$route->group(null);

```

## Nas classes `source/Web/Site.php`, `source/Web/App.php` e `source/Web/Admin.php`

Criar os métodos para cada rota.

## Na pastas `views/site`, `views/app` e `views/admin`
Criar as views para cada rota.